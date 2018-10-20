/*
    Copyright (c) 2018 Zach Rispoli (zrispo)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
 */

/* 
    animationtimeline.js
    Library for canvas based animation timeline GUI for Wick
    by zrispo (zach@wickeditor.com)
 */

var AnimationTimeline = new (function ft () {
    var self = this;

    var GRID_CELL_WIDTH = 20;
    var GRID_CELL_HEIGHT = 30;
    var EDGE_DRAG_TOLERANCE = 4;
    var LAYERS_GUI_WIDTH = 80;
    var NUMBER_LINE_HEIGHT = 15;
    var LAYERS_WIDTH = 45;
    var TWEEN_ICON_SIZE = 10;
    var TWEEN_ICON_HEIGHT = GRID_CELL_HEIGHT * 2/3;
    var BUTTON_SIZE = 15;
    var LOCK_BUTTON_OFFSET = 0;
    var HIDE_BUTTON_OFFSET = 25;

    var interfaceDark = '#333';
    var interfaceMidDark = '#666';
    var interfaceMedium = '#999';

    var elem;
    var canvas;
    var ctx;
    var scrollbarContainer;

    var itemName;
    var eventName;

    var scroll = {x:0, y:0};

    var canvasClicked;
    var clickedXY = {x: null, y: null};
    var clickedFrame;
    var clickedTween;
    var clickedLayer;
    var clickedButton;

    var playhead = new Playhead();
    var activeLayerIndex = 0;
    var layers = [];

    var grid = new Grid();
    var numberline = new Numberline();
    var selectionBox = new SelectionBox();

    var scrollbar;

    self.setup = function (_elem, callback) {
        elem = _elem;
        elem.style.position = 'relative';

        scrollbarContainer = document.createElement('div');
        scrollbarContainer.style.position = 'absolute';
        scrollbarContainer.style.zIndex = '2';
        scrollbarContainer.style.width = '100%';
        scrollbarContainer.style.height = '100%';
        scrollbarContainer.style.overflow = 'hidden';
        scrollbarContainer.style.backgroundColor = 'rgba(0,0,0,0)';
        scrollbar = new PerfectScrollbar(scrollbarContainer);
        scrollbarContainer.addEventListener('ps-scroll-x', (e) => {
            var sx = parseInt($('.ps__rail-x').css('left'));
            scroll.x = -sx;
            self.repaint();
        });
        scrollbarContainer.addEventListener('ps-scroll-y', (e) => {
            var sy = parseInt($('.ps__rail-y').css('top'));
            scroll.y = -sy;
            self.repaint();
        });
        elem.appendChild(scrollbarContainer);

        var scrollbarContainerContent = document.createElement('div');
        scrollbarContainerContent.style.width = '2000px';
        scrollbarContainerContent.style.height = '1000px';
        scrollbarContainerContent.id = 'bogobogo';
        scrollbarContainer.appendChild(scrollbarContainerContent);

        canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.className = 'animationtimeline-canvas';
        canvas.style.width = 'calc(100%)';
        canvas.style.height = 'calc(100%)';
        elem.appendChild(canvas);

        attachMouseEvents();

        ctx = canvas.getContext('2d');
        
        var callbackCalled = false;
        $( window ).resize(function() {
            canvas.width = $(canvas)[0].clientWidth * window.devicePixelRatio;
            canvas.height = $(canvas)[0].clientHeight * window.devicePixelRatio;
            self.repaint();
            if(!callbackCalled) callback();
            callbackCalled = true;
        });

        window.dispatchEvent(new Event('resize'));
    }

    self.repaint = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = interfaceDark;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var dpr = window.devicePixelRatio;
        ctx.scale(dpr,dpr);

        ctx.save();
        ctx.translate(LAYERS_WIDTH, 0);
        ctx.translate(scroll.x, scroll.y);
            ctx.save();
            ctx.translate(0, NUMBER_LINE_HEIGHT);

                grid.repaint();
                allFrames().forEach(function (frame) {
                    frame.repaint();
                });
                selectionBox.repaint();

            ctx.restore();

            numberline.repaint();
            playhead.repaint();
        ctx.restore();

        ctx.save();
        ctx.translate(0, NUMBER_LINE_HEIGHT);
        ctx.translate(0, scroll.y);
            layers.forEach(function (layer) {
                layer.repaint();
            });
            layers.forEach(function (layer) {
                layer.repaintDropGhost();
            });
        ctx.restore();
    }

    self.setData = function (data) {
        playhead.position = data.playheadPosition;
        activeLayerIndex = data.activeLayerIndex;

        numberline.onionEnabled = data.onionSkinEnabled;
        numberline.seekForwards = data.onionSkinSeekForwards;
        numberline.seekBackwards = data.onionSkinSeekBackwards;

        layers = data.layers.map(layerData => {
            var layer = new Layer({
                locked: layerData.locked,
                hidden: layerData.hidden,
            });
            layer.frames = layerData.frames.map(frameData => {
                var frame = new Frame({
                    start: frameData.start,
                    end: frameData.end,
                    layer: layer,
                });
                frame.tweens = frameData.tweens.map(tweenData => {
                    var tween = new Tween({
                        playheadPosition: tweenData.playheadPosition,
                        frame: frame,
                    });
                    return tween;
                });
                return frame;
            });
            return layer;
        });
    }

    self.frameAtXY = function (x, y) {
        x -= LAYERS_WIDTH;
        y -= NUMBER_LINE_HEIGHT;
        return frames.find(function (f) {
            return pointInBounds({x:x,y:y},f.bounds);
        });
    }

    function attachMouseEvents () {
        $(window).mousemove(function (e) {
            correctMousePos(e);

            if(e.buttons > 0 && canvasClicked) {
                handleMouseDrag(e);
            } else {
                handleMouseMove(e);
            }

            triggerEvent(e);
            self.repaint();
        });

        $(scrollbarContainer).mousedown(function (e) {
            correctMousePos(e);
            if(e.button === 0) {
                canvasClicked = true;
                handleMouseDown(e);
            } else {
                handleRightClick(e);
            }
            triggerEvent(e);
            self.repaint();
        });

        $(window).mouseup(function (e) {
            if(!canvasClicked) return;
            if(e.button !== 0) return;
            canvasClicked = false;
            correctMousePos(e);
            handleMouseUp(e);
            triggerEvent(e);
            self.repaint();
        });

        $(window).keypress(function (e) {
            if(e.key === 'ArrowRight') {
                scroll.x -= 10;
            } else if (e.key === 'ArrowLeft') {
                scroll.x += 10;
                if(scroll.x > 0) scroll.x = 0;
            } else if (e.key === 'ArrowDown') {
                scroll.y -= 10
            } else if (e.key === 'ArrowUp') {
                scroll.y += 10
                if(scroll.y > 0) scroll.y = 0;
            }
            self.repaint();
        });
    }

    function handleMouseMove (e) {
        resetHoverEffects();
        determineItemName(e);
        eventName = 'MouseMove';
    }

    function handleMouseDrag (e) {
        eventName = 'MouseDrag';
    }

    function handleMouseDown (e) {
        determineItemName(e);
        clickedXY = {x: e.x, y: e.y};
        clickedRowCol = XYToRowCol(e.x, e.y);
        eventName = 'MouseDown';
    }

    function handleMouseUp (e) {
        eventName = 'MouseUp';
    }

    function handleRightClick (e) {
        determineItemName(e);
        clickedXY = {x: e.x, y: e.y};
        clickedRowCol = XYToRowCol(e.x, e.y);
        eventName = 'RightClick';
    }

    function determineItemName (e) {
        // Find frame clicked
        var frame = allFrames().find(function (f) {
            return pointInBounds(e,f.bounds);
        });

        // Find tween clicked
        var tween = null;
        allFrames().forEach(function (f) {
            var found = f.tweens.find(function (t) {
                var x = e.x - f.bounds.left;
                var y = e.y - f.bounds.top;
                return pointInBounds({x:x,y:y}, t.bounds);
            });
            if(found) tween = found;
        });

        // Find button clicked
        var button = null;
        layers.forEach(function (l) {
            var found = l.buttons.find(function (b) {
                var x = e.x + LAYERS_WIDTH + scroll.x;
                var y = e.y;
                return pointInBounds({x:x,y:y}, b.bounds);
            });
            if(found) button = found;
        });

        if (button) {
            itemName = 'Button';
            clickedButton = button;
        } else if(e.x + scroll.x < 0) {
            if(e.y < layers.length * GRID_CELL_HEIGHT) {
                clickedLayer = layers[XYToRowCol(e.x,e.y).row];
                itemName = 'Layer';
            } else {
                itemName = 'BlankLayer';
            }
        } else if(tween) {
            itemName = 'Tween';
            clickedTween = tween;
        } else if(frame) {
            if(e.button === 2) {
                // Frame edges can't be right clicked.
                itemName = 'Frame';
            } else {
                if(pointInBounds(e,frame.leftEdgeBounds)) {
                    itemName = 'FrameLeftEdge';
                } else if (pointInBounds(e,frame.rightEdgeBounds)) {
                    itemName = 'FrameRightEdge';
                } else {
                    itemName = 'Frame';
                }
            }
            clickedFrame = frame;
        } else {
            if(e.x < 0 && e.y < 0) {
                // NOTE: This is the top-left corner of the timeline 
                // which isn't actually supposed to do anything.
                itemName = 'NumberLine';
            } else if (e.y < 0) {
                var f = Math.floor(e.x / GRID_CELL_WIDTH) + 1;
                if(numberline.onionEnabled) {
                    if(f === playhead.position - numberline.seekBackwards) {
                        itemName = 'OnionSeekStart';
                    } else if (f === playhead.position + numberline.seekForwards) {
                        itemName = 'OnionSeekEnd';
                    } else {
                        itemName = 'NumberLine';
                    }
                } else {
                    itemName = 'NumberLine';
                }
            } else {
                itemName = 'BlankFrame';
            }
        }
    }

    function resetHoverEffects () {
        allFrames().forEach(function (f) {
            f.highlightDragEdge = null;
        });
    }

    function triggerEvent (e) {
        var fn = 'on' + itemName + eventName;
        var rc = XYToRowCol(e.x, e.y);
        var startRC = XYToRowCol(clickedXY.x, clickedXY.y);

        e.start = clickedXY;
        e.delta = {x: e.x - e.start.x, y: e.y - e.start.y};
        e.frame = clickedFrame;
        e.frames = selectedFrames();
        e.tween = clickedTween;
        e.tweens = selectedTweens();
        e.layer = clickedLayer;
        e.button = clickedButton;
        e.row = rc.row;
        e.col = rc.col;
        e.startRow = startRC.row;
        e.startCol = startRC.col;

        self[fn] && self[fn](e);
    }

/* Timeline utils */

    function selectedFrames () {
        return allFrames().filter(function (f) { 
            return f.isSelected(); 
        });
    }

    function selectedTweens () {
        return allTweens().filter(function (tween) {
            return tween.isSelected();
        });
    }

    function alllayers () {
        return layers;
    }

    function allFrames () {
        return alllayers().map(function (layer) { 
            return layer.frames;
        }).reduce(function (a,b) {
            return a.concat(b);
        }, []);
    }

    function allTweens () {
        return allFrames().map(function (frame) { 
            return frame.tweens;
        }).reduce(function (a,b) {
            return a.concat(b);
        }, []);
    }

    function reinsertLayer (layer, i) {
        layers = layers.filter(seekLayer => {
            return seekLayer !== layer
        });
        layers.splice(i, 0, layer);
    }

/* Button */

    function Button (args) {
        this.clickFn = args.clickFn;
        this.isToggledFn = args.isToggledFn;
        this.icon = args.icon;
        this.offset = args.offset;
        this.layer = args.layer;

        this.state = 'inactive';
        this.bounds = null;
        this.indexMoved = false;
    }

    Button.prototype.repaint = function () {
        this.regenBounds();

        // Button body
        ctx.beginPath();
        ctx.fillStyle = this.isToggledFn() ? 'green' : 'red';
        ctx.rect(this.bounds.left, 
                 this.bounds.top,
                 this.bounds.width, 
                 this.bounds.height);
        ctx.fill();
        ctx.closePath();

        // Icon

    }

    Button.prototype.regenBounds = function () {
        this.bounds = {};

        this.bounds.top = this.layer.getIndex() * GRID_CELL_HEIGHT;
        this.bounds.left = this.offset;
        this.bounds.bottom = this.bounds.top + BUTTON_SIZE;
        this.bounds.right = this.offset + BUTTON_SIZE;

        this.bounds.width = this.bounds.right - this.bounds.left;
        this.bounds.height = this.bounds.bottom - this.bounds.top;
    }

/* Layer */

    function Layer (args) {
        this.uuid = args.uuid;

        this.locked = args.locked;
        this.hidden = args.hidden;
        this.frames = args.frames || [];

        var self = this;
        this.lockButton = new Button({
            clickFn: function () {
                self.locked = !self.locked;
            },
            isToggledFn: function () {
                return self.locked;
            },
            offset: LOCK_BUTTON_OFFSET,
            icon: '',
            layer: this,
        });
        this.hideButton = new Button({
            clickFn: function () {
                self.hidden = !self.hidden;
            },
            isToggledFn: function () {
                return self.hidden;
            },
            offset: HIDE_BUTTON_OFFSET,
            icon: '',
            layer: this,
        });
        this.buttons = [this.lockButton, this.hideButton];

        this.dragging = false;
        this.draggingOffset = 0;
    }

    Layer.prototype.repaint = function () {
        // Layer
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 
                     this.getIndex() * GRID_CELL_HEIGHT, 
                     LAYERS_WIDTH, 
                     GRID_CELL_HEIGHT);

        // Buttons
        this.lockButton.repaint();
        this.hideButton.repaint();

        // Active layer effect
        if(this.getIndex() === activeLayerIndex) {
            ctx.fillStyle = 'green';
            ctx.fillRect(0, this.getIndex()*GRID_CELL_HEIGHT + GRID_CELL_HEIGHT/2, 10, 10);
        }
    }

    Layer.prototype.repaintDropGhost = function () {
        if(this.dragging) {
            ctx.fillStyle = 'red';
            ctx.fillRect(0,
                         this.getDropIndex() * GRID_CELL_HEIGHT,
                         LAYERS_WIDTH,
                         2);
        }
    }

    Layer.prototype.drop = function () {
        var oldIndex = this.getIndex();
        var newIndex = this.getDropIndex();
        if(newIndex > oldIndex)
            newIndex --;
        reinsertLayer(this, newIndex);
    }

    Layer.prototype.getDropIndex = function () {
        var y = this.getIndex() * GRID_CELL_HEIGHT;
        y += this.draggingOffset + GRID_CELL_HEIGHT/2;
        var i = Math.round(y / GRID_CELL_HEIGHT);
        return Math.max(0, Math.min(layers.length, i));
    }

    Layer.prototype.getIndex = function () {
        return layers.indexOf(this);
    }

/* Frame */

    function Frame (args) {
        this.uuid = args.uuid;
        this.start = args.start || 0;
        this.end = args.end || (args.start + 1);
        this.layer = args.layer;
        this.tweens = args.tweens || [];
        
        this.state = args.selected ? 'selected' : 'inactive';

        this.prevState = {
            start: null,
            end: null,
            layer: null,
        };

        this.bounds = null;
        this.leftEdgeBounds = null;
        this.rightEdgeBounds = null;
        this.dropGhostBounds = null;

        this.highlightDragEdge = null;
        this.draggingOffset = {x:0, y:0};
        this.leftDragOffset = 0;
        this.rightDragOffset = 0;
    }

    Frame.prototype.regenBounds = function () {
        this.bounds = {};

        this.bounds.top = this.layer.getIndex() * GRID_CELL_HEIGHT;
        this.bounds.left = (this.start-1) * GRID_CELL_WIDTH;
        this.bounds.bottom = (this.layer.getIndex() + 1) * GRID_CELL_HEIGHT;
        this.bounds.right = this.end * GRID_CELL_WIDTH;

        this.bounds.width = this.bounds.right - this.bounds.left;
        this.bounds.height = this.bounds.bottom - this.bounds.top;

        this.leftEdgeBounds = JSON.parse(JSON.stringify(this.bounds));
        this.leftEdgeBounds.right = this.leftEdgeBounds.left + EDGE_DRAG_TOLERANCE;
        this.leftEdgeBounds.width = EDGE_DRAG_TOLERANCE;

        this.rightEdgeBounds = JSON.parse(JSON.stringify(this.bounds));
        this.rightEdgeBounds.left = this.rightEdgeBounds.right - EDGE_DRAG_TOLERANCE;
        this.rightEdgeBounds.width = EDGE_DRAG_TOLERANCE;

        this.dropGhostBounds = {};
        this.dropGhostBounds.left = this.getDropStart()*GRID_CELL_WIDTH;
        this.dropGhostBounds.top = this.getDropLayer()*GRID_CELL_HEIGHT;
        this.dropGhostBounds.right = this.getDropEnd()*GRID_CELL_WIDTH;
        this.dropGhostBounds.top = this.dropGhostBounds.top + GRID_CELL_HEIGHT;
    }

    Frame.prototype.repaint = function () {
        this.regenBounds();

        // Drop ghost
        if(this.draggingOffset.x !== 0 && this.draggingOffset.y !== 0) {
            ctx.beginPath();
            ctx.fillStyle = 'rgba(200,200,255,0.3)';
            ctx.rect(this.dropGhostBounds.left, 
                     this.dropGhostBounds.top, 
                     this.dropGhostBounds.width, 
                     this.dropGhostBounds.height);
            ctx.stroke();
            ctx.closePath();
        }

        // Frame 
        ctx.beginPath();
        ctx.strokeStyle = 'gray';
        ctx.fillStyle = this.state === 'selected' ? 'rgb(200,230,255)' : 'white';
        ctx.rect(this.bounds.left + this.draggingOffset.x + this.leftDragOffset, 
                 this.bounds.top + this.draggingOffset.y, 
                 this.bounds.width + this.rightDragOffset - this.leftDragOffset, 
                 this.bounds.height);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        if(this.highlightDragEdge === 'left') {
            // Left edge highlight
            ctx.fillStyle = this.highlightDragEdge ? 'red' : 'white';
            ctx.beginPath();
            ctx.rect(this.leftEdgeBounds.left + this.leftDragOffset, 
                     this.leftEdgeBounds.top, 
                     this.leftEdgeBounds.width, 
                     this.leftEdgeBounds.height);
            ctx.fill();
            ctx.closePath();
        } else if (this.highlightDragEdge === 'right') {
            // Right edge highlight
            ctx.fillStyle = this.highlightDragEdge ? 'red' : 'white';
            ctx.beginPath();
            ctx.rect(this.rightEdgeBounds.left + this.rightDragOffset, 
                     this.rightEdgeBounds.top, 
                     this.rightEdgeBounds.width, 
                     this.rightEdgeBounds.height);
            ctx.fill();
            ctx.closePath();
        }

        // Tweens
        ctx.save();
        ctx.translate(this.bounds.left + this.draggingOffset.x, 
                      this.bounds.top + this.draggingOffset.y);
            this.tweens.forEach(function (tween) {
                tween.repaint();
            });
        ctx.restore();
    }

    Frame.prototype.select = function () {
        this.state = 'selected';
    }

    Frame.prototype.deselect = function () {
        this.state = 'inactive';
    }

    Frame.prototype.isSelected = function () {
        return this.state === 'selected';
    }

    Frame.prototype.saveState = function () {
        this.prevState.start = this.start;
        this.prevState.end = this.end;
        this.prevState.layer = this.layer;
    }

    Frame.prototype.recoverState = function () {
        this.start = this.prevState.start;
        this.end = this.prevState.end;
        this.layer = this.prevState.layer;
    }

    Frame.prototype.drop = function () {
        this.saveState();
        this.start = this.getDropStart();
        this.end = this.getDropEnd();
        this.layer = this.getDropLayer();
        this.draggingOffset = {x:0,y:0};
    }

    Frame.prototype.dropLeftEdge = function () {
        this.saveState();
        var numDraggedSpaces = Math.round(this.leftDragOffset / GRID_CELL_WIDTH);
        this.start += numDraggedSpaces;
        this.leftDragOffset = 0;
    }

    Frame.prototype.dropRightEdge = function () {
        this.saveState();
        var numDraggedSpaces = Math.round(this.rightDragOffset / GRID_CELL_WIDTH);
        this.end += numDraggedSpaces;
        this.rightDragOffset = 0;
    }

    Frame.prototype.isValid = function () {
        if(this.start <= 0 || this.end <= 0) {
            return false;
        }   
        var onTopOfOtherFrame = false;
        var self = this;
        allFrames().filter(function (frame) {
            return frame !== self;
        }).forEach(function (frame) {
            if(self.touches(frame)) {
                onTopOfOtherFrame = true;
            }
        });
        return !onTopOfOtherFrame;
    }

    Frame.prototype.getDropStart = function () {
        var x = this.leftDragOffset + this.draggingOffset.x + GRID_CELL_WIDTH / 2;
        return this.start + XYToRowCol(x).col;
    }

    Frame.prototype.getDropEnd = function () {
        var x = this.rightDragOffset + this.draggingOffset.x + GRID_CELL_WIDTH / 2;
        return this.end + XYToRowCol(x).col;
    }

    Frame.prototype.getDropLayer = function () {
        var l = this.layer.getIndex() + Math.round(this.draggingOffset.y / GRID_CELL_HEIGHT);
        var i = Math.min(layers.length-1, Math.max(0, l));
        return layers[i];
    }

    Frame.prototype.touches = function (frame) {
        if(this.layer !== frame.layer) return false;
        return (this.start >= frame.start && this.start <= frame.end)
            || (this.end >= frame.start && this.end <= frame.end)
            || (frame.start >= this.start && frame.start <= this.end)
            || (frame.end >= this.start && frame.end <= this.end);
    }

    Frame.prototype.type = function () {
        return 'frame';
    }

/* Tween */

    function Tween (args) {
        this.playheadPosition = args.playheadPosition;
        this.state = args.selected ? 'selected' : 'inactive';
        this.uuid = args.uuid;
        this.frame = args.frame;

        this.bounds = null;
        this.absoluteBounds = null;
        this.draggingOffset = 0;
    }

    Tween.prototype.repaint = function () {
        this.regenBounds();

        ctx.beginPath();
        ctx.fillStyle = this.state === 'selected' ? 'red' : 'green';
        ctx.rect(this.bounds.left + this.draggingOffset, 
                 this.bounds.top, 
                 this.bounds.width, 
                 this.bounds.height);
        ctx.fill();
        ctx.closePath();
    }

    Tween.prototype.regenBounds = function () {
        this.bounds = {};

        this.bounds.top = TWEEN_ICON_HEIGHT;
        this.bounds.left = this.playheadPosition * GRID_CELL_WIDTH + GRID_CELL_WIDTH/2 - TWEEN_ICON_SIZE/2;
        this.bounds.bottom = this.bounds.top + TWEEN_ICON_SIZE;
        this.bounds.right = this.bounds.left + TWEEN_ICON_SIZE;

        this.bounds.width = this.bounds.right - this.bounds.left;
        this.bounds.height = this.bounds.bottom - this.bounds.top;

        this.absoluteBounds = {
            top: this.bounds.top + this.frame.bounds.top,
            left: this.bounds.left + this.frame.bounds.left,
            bottom: this.bounds.bottom + this.frame.bounds.top,
            right: this.bounds.right + this.frame.bounds.left,
            width: this.bounds.width,
            height: this.bounds.height,
        };
    }

    Tween.prototype.select = function () {
        this.state = 'selected';
    }

    Tween.prototype.deselect = function () {
        this.state = 'inactive';
    }

    Tween.prototype.isSelected = function () {
        return this.state === 'selected';
    }

    Tween.prototype.type = function () {
        return 'tween';
    }

    Tween.prototype.drop = function () {
        this.playheadPosition += Math.round(this.draggingOffset/GRID_CELL_WIDTH);
        this.draggingOffset = 0;
    }

/* Playhead */

    function Playhead () {
        this.position = 1;
    }

    Playhead.prototype.repaint = function () {
        var x = (this.position-1) * GRID_CELL_WIDTH + GRID_CELL_WIDTH/2; 
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(x,0);
        ctx.lineTo(x,1000);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = 'red';
        ctx.arc(x, 0, NUMBER_LINE_HEIGHT/2, 0, 2*Math.PI);
        ctx.closePath();
        ctx.fill();
    }

/* Grid */

    function Grid () {

    }

    Grid.prototype.repaint = function () {
        var cellW = GRID_CELL_WIDTH;
        var cellH = GRID_CELL_HEIGHT;
        var gridW = canvas.width;
        var gridH = layers.length*GRID_CELL_HEIGHT;
        var offset = Math.round(-scroll.x/GRID_CELL_WIDTH);

        ctx.strokeStyle = interfaceMedium;
        ctx.lineWidth = "1px";

        // Horizontal lines
        for(var i = 0; i <= gridH/cellH; i++) {
            var y = i*cellH;
            ctx.beginPath();
            ctx.moveTo(-scroll.x+0.5, y+0.5);
            ctx.lineTo(-scroll.x+gridW+0.5, y+0.5);
            ctx.stroke();
            ctx.closePath();
        }

        // Vertical lines
        for(var i = offset; i < gridW/cellW+offset; i++) {
            var x = i*cellW;
            ctx.beginPath();
            ctx.moveTo(x+0.5, 0);
            ctx.lineTo(x+0.5, gridH+0.5);
            ctx.stroke();
            ctx.closePath();
        }
    }

/* NumberLine */

    function Numberline () {
        this.onionEnabled = false;

        this.seekForwards = null;
        this.seekBackwards = null;

        this.seekBackwardsDragOffset = 0;
        this.seekForwardsDragOffset = 0;
    }

    Numberline.prototype.repaint = function () {
        var offset = Math.round(-scroll.x/GRID_CELL_WIDTH);

        for(var i = offset; i < canvas.width/GRID_CELL_WIDTH + offset; i++) {
            var x = i*GRID_CELL_WIDTH;
            var f = i+1;
            if(f%5 == 0 || f==1) {
                ctx.fillStyle = 'gray';
                ctx.font = "12px Arial";
                ctx.fillText(f,x,10);

                ctx.strokeStyle = interfaceMidDark;
            } else {
                ctx.strokeStyle = interfaceMedium;
            }
            ctx.beginPath();
            ctx.moveTo(x+0.5,0);
            ctx.lineTo(x+0.5,NUMBER_LINE_HEIGHT+0.5);
            ctx.stroke();
            ctx.closePath();
        }

        if(this.onionEnabled) {
            ctx.fillStyle = 'blue';

            var p = playhead.position-1;
            var seekBackwardsX = (p - this.seekBackwards) * GRID_CELL_WIDTH + this.seekBackwardsDragOffset;
            var seekForwardsX = (p + this.seekForwards) * GRID_CELL_WIDTH + this.seekForwardsDragOffset;
            ctx.rect(seekBackwardsX, 
                     0, 
                     GRID_CELL_WIDTH, 
                     NUMBER_LINE_HEIGHT);
            ctx.fill();

            ctx.rect(seekForwardsX, 
                     0, 
                     GRID_CELL_WIDTH, 
                     NUMBER_LINE_HEIGHT);
            ctx.fill();
        }
    }

    Numberline.prototype.dropSeekStart = function () {
        var d = Math.round(numberline.seekBackwardsDragOffset/GRID_CELL_WIDTH);
        this.seekBackwards -= d;
        this.seekBackwardsDragOffset = 0;
    }

    Numberline.prototype.dropSeekEnd = function () {
        var d = Math.round(numberline.seekForwardsDragOffset/GRID_CELL_WIDTH);
        this.seekForwards += d;
        this.seekForwardsDragOffset = 0;
    }

/* SelectionBox */

    function SelectionBox () {
        this.bounds = null;
    }

    SelectionBox.prototype.setStart = function (x,y) {
        this.bounds = {
            left: x,
            top: y,
            right: x,
            bottom: y,
        }
    }

    SelectionBox.prototype.setEnd = function (x,y) {
        this.bounds.right = x;
        this.bounds.bottom = y;
    }

    SelectionBox.prototype.deactivate = function () {
        this.bounds = null;
    }

    SelectionBox.prototype.getObjectsInside = function () {
        // Correct bounds because setEnd always sets right and bottom (this is stupid)
        if(this.bounds.right < this.bounds.left) {
            var t = this.bounds.right;
            this.bounds.right = this.bounds.left;
            this.bounds.left = t;
        }

        if(this.bounds.top > this.bounds.bottom) {
            var t = this.bounds.top;
            this.bounds.top = this.bounds.bottom;
            this.bounds.bottom = t;
        }

        var self = this;
        var frames = allFrames().filter(function (frame) {
            return boundsIntersect(self.bounds, frame.bounds)
                || boundsInsideBounds(frame.bounds, self.bounds);
        });
        var tweens = allTweens().filter(function (tween) {
            return boundsIntersect(self.bounds, tween.absoluteBounds)
                || boundsInsideBounds(tween.absoluteBounds, self.bounds);
        });
        return frames.concat(tweens);
    }

    SelectionBox.prototype.repaint = function () {
        if(!this.bounds) return;
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(100,100,100,0.5)';
        ctx.fillStyle = 'rgba(100,100,100,0.5)';
        ctx.rect(this.bounds.left, 
                 this.bounds.top, 
                 this.bounds.right - this.bounds.left, 
                 this.bounds.bottom - this.bounds.top);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
    }

/* Util */

    function correctMousePos (e) {
        var offset = $(canvas).offset();
        offset.left += scroll.x;
        offset.top += scroll.y;
        e.x = e.pageX - offset.left - LAYERS_WIDTH;
        e.y = e.pageY - offset.top - NUMBER_LINE_HEIGHT;
    }

    function pointInBounds (point, bounds) {
        return point.x >= bounds.left
            && point.x <= bounds.right
            && point.y >= bounds.top
            && point.y <= bounds.bottom;
    }

    function boundsIntersect (boundsA, boundsB) {
        return !(boundsB.left > boundsA.right || 
                 boundsB.right < boundsA.left || 
                 boundsB.top > boundsA.bottom ||
                 boundsB.bottom < boundsA.top);
    }

    function boundsInsideBounds (boundsInner, boundsOuter) {
        return boundsInner.left >= boundsOuter.left
            && boundsInner.right <= boundsOuter.right
            && boundsInner.top >= boundsOuter.top
            && boundsInner.bottom <= boundsOuter.bottom;
    }

    function XYToRowCol (x,y) {
        return {
            col: Math.floor(x / GRID_CELL_WIDTH),
            row: Math.floor(y / GRID_CELL_HEIGHT),
        }
    }

    function rowColToXY (row,col) {
        return {
            x: col * GRID_CELL_WIDTH,
            y: row * GRID_CELL_HEIGHT,
        }
    }

/* Mouse events logic */

    // NumberLine

    self.onNumberLineMouseMove = function (e) {

    }

    self.onNumberLineMouseDown = function (e) {
        playhead.position = e.col + 1;
    }

    self.onNumberLineMouseDrag = function (e) {
        playhead.position = e.col + 1;
        if(playhead.position < 1) playhead.position = 1;
    }

    self.onNumberLineMouseUp = function (e) {
        
    }

    // Onion seek start

    self.onOnionSeekStartMouseMove = function (e) {

    }

    self.onOnionSeekStartMouseDown = function (e) {
        
    }

    self.onOnionSeekStartMouseDrag = function (e) {
        numberline.seekBackwardsDragOffset = e.delta.x;
    }

    self.onOnionSeekStartMouseUp = function (e) {
        numberline.dropSeekStart();
    }

    // Onion seek end

    self.onOnionSeekEndMouseMove = function (e) {

    }

    self.onOnionSeekEndMouseDown = function (e) {
        
    }

    self.onOnionSeekEndMouseDrag = function (e) {
        numberline.seekForwardsDragOffset = e.delta.x;
    }

    self.onOnionSeekEndMouseUp = function (e) {
        numberline.dropSeekEnd();
    }

    // BlankFrame

    self.onBlankFrameMouseMove = function (e) {

    }

    self.onBlankFrameMouseDown = function (e) {
        if(e.row < layers.length)
            playhead.position = e.col + 1;

        if(!e.shiftKey) {
            allFrames().forEach(function (frame) {
                frame.deselect();
            });
            allTweens().forEach(function (tween) {
                tween.deselect();
            });
        }
        selectionBox.setStart(e.x, e.y);
    }

    self.onBlankFrameMouseDrag = function (e) {
        selectionBox.setEnd(e.x, e.y);
    }

    self.onBlankFrameMouseUp = function (e) {
        if(e.x === e.start.x && e.y === e.start.y && e.row < layers.length) {
            playhead.position = e.col + 1;
            activeLayerIndex = e.row;

            layers[activeLayerIndex].frames.push(new Frame({
                start: playhead.position, 
                end: playhead.position,
                layer: layers[activeLayerIndex],
                tweens: [],
            }));
        } else {
            selectionBox.getObjectsInside().forEach(function (obj) {
                obj.select();
            });
        }

        selectionBox.deactivate();
    }

    self.onBlankFrameRightClick = function (e) {
        playhead.position = e.col + 1;
        activeLayerIndex = e.row;
    }

    // Frame

    self.onFrameMouseMove = function (e) {

    }

    self.onFrameMouseDown = function (e) {
        playhead.position = e.col + 1;
        activeLayerIndex = Math.min(layers.length-1, Math.max(0,e.row));

        allTweens().forEach(function (tween) {
            tween.deselect();
        });

        if(!e.shiftKey && e.frame && !e.frame.isSelected()) {
            allFrames().forEach(function (frame) {
                frame.deselect();
            });
        }
        if(e.frame) {
            if(e.shiftKey && e.frame.isSelected()) {
                e.frame.deselect();
            } else {
                e.frame.select();
            }
        }
    }

    self.onFrameMouseDrag = function (e) {
        e.frames.forEach(function (frame) {
            frame.draggingOffset.x = e.delta.x;
            frame.draggingOffset.y = e.delta.y;
        });
    }

    self.onFrameMouseUp =  function (e) {
        var position = e.col+1;
        var i = Math.min(layers.length-1, Math.max(0, e.row));

        playhead.position = position;
        activeLayerIndex = i;

        e.frames.forEach(function (frame) {
            frame.drop();
        });
        var validState = true;
        e.frames.forEach(function (frame) {
            if(!frame.isValid())
                validState = false;
        });
        if(!validState) {
            e.frames.forEach(function (frame) {
                frame.recoverState();
            });
        }
    }

    self.onFrameRightClick =  function (e) {
        playhead.position = e.col + 1;
        activeLayerIndex = e.row;

        if(!e.shiftKey && e.frame && !e.frame.isSelected()) {
            allFrames().forEach(function (frame) {
                frame.deselect();
            });
        }
        if(e.frame) {
            e.frame.select();
        }
    }

    // Frame Left Edge

    self.onFrameLeftEdgeMouseMove = function (e) {
        e.frame.highlightDragEdge = 'left';
    }

    self.onFrameLeftEdgeMouseDown = function (e) {
        playhead.position = e.col + 1;
    }

    self.onFrameLeftEdgeMouseDrag = function (e) {
        // Round to nearest cell to snap to grid
        e.frame.leftDragOffset = Math.round(e.delta.x / GRID_CELL_WIDTH) * GRID_CELL_WIDTH;

        playhead.position = e.frame.start + XYToRowCol(e.frame.leftDragOffset).col;
    }

    self.onFrameLeftEdgeMouseUp = function (e) {
        e.frame.dropLeftEdge();
        if(!e.frame.isValid()) {
            e.frame.recoverState();
        }

        playhead.position = e.frame.start;
    }

    // Frame Right Edge

    self.onFrameRightEdgeMouseMove = function (e) {
        e.frame.highlightDragEdge = 'right';
    }

    self.onFrameRightEdgeMouseDown = function (e) {
        playhead.position = e.col + 1;
    }

    self.onFrameRightEdgeMouseDrag = function (e) {
        // Round to nearest cell to snap to grid
        e.frame.rightDragOffset = Math.round(e.delta.x / GRID_CELL_WIDTH) * GRID_CELL_WIDTH;

        playhead.position = e.frame.end + XYToRowCol(e.frame.rightDragOffset).col;
    }

    self.onFrameRightEdgeMouseUp = function (e) {
        e.frame.dropRightEdge();
        if(!e.frame.isValid()) {
            e.frame.recoverState();
        }

        playhead.position = e.frame.end;
    }

    // Tween

    self.onTweenMouseMove = function (e) {

    }

    self.onTweenMouseDown = function (e) {
        playhead.position = e.col+1;
        activeLayerIndex = Math.min(layers.length-1, Math.max(0, e.row));

        if(!e.shiftKey && e.tween && !e.tween.isSelected()) {
            allTweens().forEach(function (tween) {
                tween.deselect();
            });
        }
        if(e.tween) {
            if(e.shiftKey && e.tween.isSelected()) {
                e.tween.deselect();
            } else {
                e.tween.select();
            }
        }
    }

    self.onTweenMouseDrag = function (e) {
        e.tweens.forEach(function (tween) {
            tween.draggingOffset = e.delta.x;
        });
    }

    self.onTweenMouseUp = function (e) {
        e.tweens.forEach(function (tween) {
            tween.drop();
        });
    }

    // BlankLayer

    self.onBlankLayerMouseMove = function (e) {

    }

    self.onBlankLayerMouseDown = function (e) {
        
    }

    self.onBlankLayerMouseDrag = function (e) {
        
    }

    self.onBlankLayerMouseUp = function (e) {
        layers.push(new Layer({
            index: layers.length,
            locked: false,
            hidden: false,
            frames: [],
        }));
        activeLayerIndex = layers.length-1;
    }

    // Layer

    self.onLayerMouseMove = function (e) {

    }

    self.onLayerMouseDown = function (e) {
        activeLayerIndex = e.layer.getIndex();
    }

    self.onLayerMouseDrag = function (e) {
        e.layer.dragging = true;
        e.layer.draggingOffset = e.delta.y;
    }

    self.onLayerMouseUp = function (e) {
        e.layer.drop();
        e.layer.dragging = false;
        activeLayerIndex = layers.indexOf(e.layer);
    }

    // Button

    self.onButtonMouseMove = function (e) {
        
    }

    self.onButtonMouseDown = function (e) {
        e.button.clickFn();
    }

    self.onButtonMouseDrag = function (e) {
        
    }

    self.onButtonMouseUp = function (e) {
        
    }

})();
