/*
 * Copyright 2019 WICKLETS LLC
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */

Wick.GUIElement.Frame = class extends Wick.GUIElement {
    constructor (model) {
        super(model);
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Frame body
        if(this.mouseState === 'over') {
            ctx.fillStyle = Wick.GUIElement.FRAME_HOVERED_OVER;
        } else {
            ctx.fillStyle = Wick.GUIElement.FRAME_UNCONTENTFUL_FILL_COLOR;
        }

        ctx.beginPath();
        ctx.roundRect(0, 0, this.model.length * this.gridCellWidth, this.gridCellHeight, Wick.GUIElement.FRAME_BORDER_RADIUS);
        ctx.fill();

        // Add selection highlight if necessary
        if (this.model.isSelected) {
            ctx.strokeStyle = Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR;
            ctx.lineWidth = Wick.GUIElement.FRAME_HIGHLIGHT_STROKEWIDTH;
            ctx.stroke();
        }

        // Frame contentful dot
        if(this.model.tweens.length === 0 && !this.model.sound) {
            ctx.fillStyle = Wick.GUIElement.FRAME_CONTENT_DOT_COLOR;
            ctx.strokeStyle = Wick.GUIElement.FRAME_CONTENT_DOT_COLOR;
            ctx.lineWidth = Wick.GUIElement.FRAME_CONTENT_DOT_STROKE_WIDTH;

            ctx.beginPath();
            ctx.arc(this.gridCellWidth/2, this.gridCellHeight/2, Wick.GUIElement.FRAME_CONTENT_DOT_RADIUS, 0, 2 * Math.PI);
            if(this.model.contentful) {
                ctx.fill();
            }
            ctx.stroke();
        } else if (this.model.sound) {
            //waveform
        } else if (this.model.tweens.length > 0) {
            //tweens
        }
    }

    get bounds () {
        return {
            x: 0,
            y: 0,
            width: this.model.length * this.gridCellWidth,
            height: this.gridCellHeight,
        };
    }

    onMouseDown (e) {
        this.model.project.selection.select(this.model);
    }

  /*
    static get cachedWaveforms () {
        if(!Wick.GUIElement.Frame.__cachedWaveforms) {
            Wick.GUIElement.Frame.__cachedWaveforms = {};
        }
        return Wick.GUIElement.Frame.__cachedWaveforms;
    }

    constructor (model) {
        super(model);

        this.dragOffset = new paper.Point(0,0);

        this.rightEdge = new Wick.GUIElement.FrameRightEdge(model);
        this.rightEdgeStretch = 0;

        this.leftEdge = new Wick.GUIElement.FrameLeftEdge(model);
        this.leftEdgeStretch = 0;

        this.ghost = new Wick.GUIElement.FrameGhost(model);

        this.on('mouseOver', () => {
            this.build();
        });

        this.on('mouseDown', (e) => {
            this.model.project.activeTimeline.playheadPosition = this.model.start + this.localMouseGrid.x;
            if(!e.modifiers.shift && !this.model.isSelected) {
                this.model.project.selection.clear();
            }
            if(!this.model.isSelected) {
                this.model.project.selection.select(this.model);
                this.model.parentLayer.activate();
            }
            this.model.project.guiElement.build();
            this.model.project.guiElement.fire('projectModified');
        });

        this.on('mouseLeave', () => {
            this.build();
        });

        this.on('drag', () => {
            this._dragSelectedFrames();
        });

        this.on('dragEnd', () => {
            this._tryToDropFrames();
        });
    }

    get cursor () {
        return 'move';
    }

    get x () {
        return this.gridCellWidth * (this.model.start-1) + this.leftEdgeStretch + Wick.GUIElement.FRAME_MARGIN;
    }

    get y () {
        return this.gridCellHeight * this.model.parentLayer.index + Wick.GUIElement.FRAME_MARGIN;
    }

    get width () {
        return this.gridCellWidth * this.model.length + this.rightEdgeStretch - this.leftEdgeStretch - Wick.GUIElement.FRAME_MARGIN;
    }

    get height () {
        return Wick.GUIElement.FRAMES_STRIP_HEIGHT;
    }

    get dragOffset () {
        return this._dragOffset;
    }

    set dragOffset (dragOffset) {
        this._dragOffset = dragOffset;
    }

    get rightEdgeStretch () {
        return this._rightEdgeStretch;
    }

    set rightEdgeStretch (rightEdgeStretch) {
        this._rightEdgeStretch = rightEdgeStretch;
        var ddd = this.model.length * this.gridCellWidth;
        var framePixelLength = ddd + this._rightEdgeStretch;
        if(framePixelLength < this.gridCellWidth) {
            this._rightEdgeStretch = -ddd + this.gridCellWidth;
        }
    }

    get leftEdgeStretch () {
        return this._leftEdgeStretch;
    }

    set leftEdgeStretch (leftEdgeStretch) {
        this._leftEdgeStretch = leftEdgeStretch;
    }

    get selectedFrames () {
        return this.model.project.selection.getSelectedObjects(Wick.Frame);
    }

    get selectedFramesByLayers () {
        var frames = this.selectedFrames;
        var layers = {};
        frames.forEach(frame => {
            var layer = frame.parentLayer;
            if(!layers[layer.uuid]) {
                layers[layer.uuid] = [];
            }
            layers[layer.uuid].push(frame);
        });
        return layers;
    }

    get draggingFrames () {
        return this.model.parentTimeline.frames.filter(frame => {
            return frame.guiElement.ghost.active;
        });
    }

    get ghostStart () {
        var x = this.x + this.dragOffset.x;
        x = Math.round(x / this.gridCellWidth);
        x += 1;
        return x;
    }

    get ghostEnd () {
        var x = this.x + this.dragOffset.x + this.width;
        x = Math.round(x / this.gridCellWidth);
        return x;
    }

    get ghostLayer () {
        var y = this.y + this.dragOffset.y;
        y = Math.round(y / this.gridCellHeight);
        return y;
    }

    get ghostPosition () {
        return new paper.Point(
            (this.ghostStart-1) * this.gridCellWidth,
            this.ghostLayer * this.gridCellHeight
        );
    }

    get ghostWidth () {
        return (this.ghostEnd + 1 - this.ghostStart) * this.gridCellWidth;
    }

    build () {
        super.build();

        this._buildDropGhost();
        this._buildFrameBody();
        this._buildSoundWaveform();
        this._buildContentfulDot();
        this._buildDraggingEdges();
        this._buildTweens();
        this._buildIdentifierLabel();
        this._buildScriptsLabel();

        this.item.position = new paper.Point(this.x, this.y);
        this.item.position = this.item.position.add(this.dragOffset);
    }

    _buildFrameBody () {
        var fillColor = 'rgba(0,0,0,0)';
        if(this.isHoveredOver) {
            fillColor = Wick.GUIElement.FRAME_HOVERED_OVER;
        } else {
            fillColor = Wick.GUIElement.FRAME_UNCONTENTFUL_FILL_COLOR;
        }

        // Main Frame Body
        var frameRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(0, 0),
            to: new this.paper.Point(this.width, this.height),
            fillColor: fillColor,
            radius: Wick.GUIElement.FRAME_BORDER_RADIUS,
        });

        // Frame Drop Shadow
        var frameDropShadow = new this.paper.Path.Rectangle({
            from: new this.paper.Point(0, Wick.GUIElement.FRAME_DROP_SHADOW_DEPTH),
            to: new this.paper.Point(this.width, this.height + Wick.GUIElement.FRAME_DROP_SHADOW_DEPTH),
            fillColor: Wick.GUIElement.FRAME_DROP_SHADOW_FILL,
            strokeWidth: 0,
            radius: Wick.GUIElement.FRAME_BORDER_RADIUS,
        });

        // Create frame and drop shadow
        this.item.addChild(frameDropShadow);
        this.item.addChild(frameRect);

        // Add Selection Highlight If necessary.
        if (this.model.isSelected) {
            var frameBorderWidth = 2; // How thick is the highlight?
            var frameSelectedHighlight = new this.paper.Path.Rectangle({
                from: new this.paper.Point(frameBorderWidth, frameBorderWidth),
                to: new this.paper.Point(this.width-frameBorderWidth, this.height-frameBorderWidth),
                strokeColor: Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR,
                strokeWidth: frameBorderWidth + frameBorderWidth, // Adjust strokewidth to account for being inside the shape.
                fillColor: 'rgba(0,0,0,0)', // Invisible
                radius: Wick.GUIElement.FRAME_BORDER_RADIUS - frameBorderWidth, // Adjust radius to account for being inside the shape.
            });
            // Add it to the frame.
            this.item.addChild(frameSelectedHighlight);
        }

        // Visually alter the frame if the layer is hidden.
        if (this.model.parentLayer.hidden) {
            this.item.opacity = .25;
        } else {
            this.item.opacity = 1;
        }
    }

    _buildDropGhost () {
        this.ghost.position = new paper.Point(0,0);
        this.ghost.position = this.ghost.position.subtract(new paper.Point(this.x, this.y));
        this.ghost.position = this.ghost.position.subtract(new paper.Point(this.dragOffset.x, this.dragOffset.y));
        this.ghost.position = this.ghost.position.add(this.ghostPosition);
        this.ghost.width = this.ghostWidth;
        this.ghost.build();
        this.item.addChild(this.ghost.item);
    }

    _buildContentfulDot () {
        if(this.model.tweens.length > 0 || this.model.sound) {
            return;
        }

        var contentDot = new this.paper.Path.Ellipse({
            center: [this.gridCellWidth/2, this.gridCellHeight/2],
            radius: Wick.GUIElement.FRAME_CONTENT_DOT_RADIUS,
            fillColor: this.model.contentful ? Wick.GUIElement.FRAME_CONTENT_DOT_COLOR: 'rgba(0,0,0,0)',
            strokeColor: Wick.GUIElement.FRAME_CONTENT_DOT_COLOR,
            strokeWidth: Wick.GUIElement.FRAME_CONTENT_DOT_STROKE_WIDTH,
        });

        this.item.addChild(contentDot);
    }

    _buildDraggingEdges () {
        this.rightEdge.build();
        this.item.addChild(this.rightEdge.item);

        this.leftEdge.build();
        this.item.addChild(this.leftEdge.item);
    }

    _buildTweens () {
        this.model.tweens.forEach(tween => {
            tween.guiElement.build();
            this.item.addChild(tween.guiElement.item);
        });
    }

    _buildIdentifierLabel () {
        if(!this.model.identifier) {
            return;
        }

        var nameTextGroup = new paper.Group({
            children: [
                new paper.Path.Rectangle({
                    from: new paper.Point(0,0),
                    to: new paper.Point(this.width,this.height),
                    fillColor: 'black',
                }),
                new paper.PointText({
                    point: [0, 12],
                    content: this.model.identifier,
                    fillColor: 'black',
                    fontFamily: 'Courier New',
                    fontSize: 12
                })
            ],
        });
        nameTextGroup.clipped = true;
        this.item.addChild(nameTextGroup);
    }

    _buildScriptsLabel () {
        if(!this.model.hasContentfulScripts) {
            return;
        }

        var scriptCircle = new this.paper.Path.Ellipse({
            center: [this.gridCellWidth/2, 0],
            radius: Wick.GUIElement.FRAME_CONTENT_DOT_RADIUS*1.3,
            fillColor: Wick.GUIElement.FRAME_SCRIPT_DOT_COLOR,
        });

        var scriptCircleMask = new paper.Path.Rectangle({
            from: new paper.Point(0, 0),
            to: new paper.Point(this.width, this.height),
            fillColor: 'black'
        });

        var maskedScriptCircle = new paper.Group({
            children: [scriptCircleMask, scriptCircle]
        });
        maskedScriptCircle.clipped = true;
        maskedScriptCircle.remove();

        this.item.addChild(maskedScriptCircle);
    }

    _buildSoundWaveform () {
        if(!this.model.sound) {
            return;
        }

        this._generateWaveform();
        var waveform = this._getCachedWaveform();
        if(!waveform) {
            return;
        }

        var mask = new paper.Path.Rectangle({
            from: new paper.Point(0, 0),
            to: new paper.Point(this.width, this.height),
            fillColor: 'black'
        });

        waveform.remove();
        waveform.scaling.x = this.gridCellWidth / 1200 * this.model.project.framerate * this.model.sound.duration;
        waveform.scaling.y = 2;
        waveform.position = new paper.Point((waveform.width/2) * waveform.scaling.x, this.gridCellHeight);

        var clippedWaveform = new paper.Group({
            children: [mask, waveform]
        });
        clippedWaveform.clipped = true;
        clippedWaveform.remove();
        this.item.addChild(clippedWaveform);
    }

    _dragSelectedFrames () {
        this.selectedFrames.forEach(frame => {
            frame.guiElement.item.bringToFront();
            frame.guiElement.dragOffset = this.mouseDelta;
            frame.guiElement.ghost.active = true;
            frame.guiElement.build();
        });
    }

    _tryToDropFrames () {
        this.draggingFrames.forEach(frame => {
            var start = frame.guiElement.ghostStart;
            var end = frame.guiElement.ghostEnd;
            var layer = frame.guiElement.ghostLayer;

            frame.start = start;
            frame.end = end;

            var oldLayer = frame.parentLayer;
            var newLayer = frame.parentTimeline.layers[layer];
            oldLayer.removeFrame(frame);
            newLayer.addFrame(frame);

            frame.guiElement.leftEdgeStretch = 0;
            frame.guiElement.dragOffset = new paper.Point(0,0);
            frame.guiElement.ghost.active = false;
            frame.guiElement.build();
        });

        this.model.project.guiElement.fire('projectModified');
    }

    _getCachedWaveform () {
        return Wick.GUIElement.Frame.cachedWaveforms[this.model.uuid];
    }

    _setCachedWaveform (waveform) {
        Wick.GUIElement.Frame.cachedWaveforms[this.model.uuid] = waveform;
    }

    _generateWaveform () {
        if(this._getCachedWaveform()) return;

        var soundSrc = this.model.sound.src;

        var scwf = new SCWF();
        scwf.generate(soundSrc, {
            onComplete: (png, pixels) => {
                var raster = new paper.Raster(png);
                raster.remove();
                raster.onLoad = () => {
                    this._setCachedWaveform(raster);
                };
            }
        });
    }
    */
}
