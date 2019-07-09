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

Wick.GUIElement.Frame = class extends Wick.GUIElement.Draggable {
    static get cachedWaveforms () {
        if(!Wick.GUIElement.Frame.__cachedWaveforms) {
            Wick.GUIElement.Frame.__cachedWaveforms = {};
        }
        return Wick.GUIElement.Frame.__cachedWaveforms;
    }

    /**
     *
     */
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

    /**
     *
     */
    get x () {
        return this.gridCellWidth * (this.model.start-1) + this.leftEdgeStretch + Wick.GUIElement.FRAME_MARGIN;
    }

    /**
     *
     */
    get y () {
        return this.gridCellHeight * this.model.parentLayer.index + Wick.GUIElement.FRAME_MARGIN;
    }

    /**
     *
     */
    get width () {
        return this.gridCellWidth * this.model.length + this.rightEdgeStretch - this.leftEdgeStretch - Wick.GUIElement.FRAME_MARGIN;
    }

    /**
     *
     */
    get height () {
        return this.gridCellHeight - Wick.GUIElement.FRAME_MARGIN;
    }

    /**
     *
     */
    get dragOffset () {
        return this._dragOffset;
    }

    set dragOffset (dragOffset) {
        this._dragOffset = dragOffset;
    }

    /**
     *
     */
    get rightEdgeStretch () {
        return this._rightEdgeStretch;
    }

    set rightEdgeStretch (rightEdgeStretch) {
        this._rightEdgeStretch = rightEdgeStretch;
    }

    /**
     *
     */
    get leftEdgeStretch () {
        return this._leftEdgeStretch;
    }

    set leftEdgeStretch (leftEdgeStretch) {
        this._leftEdgeStretch = leftEdgeStretch;
    }

    /**
     *
     */
    get selectedFrames () {
        return this.model.project.selection.getSelectedObjects(Wick.Frame);
    }

    /**
     *
     */
    get draggingFrames () {
        return this.model.parentTimeline.frames.filter(frame => {
            return frame.guiElement.ghost.active;
        });
    }

    /**
     *
     */
    get ghostStart () {
        var x = this.x + this.dragOffset.x;
        x = Math.round(x / this.gridCellWidth);
        x += 1;
        return x;
    }

    /**
     *
     */
    get ghostEnd () {
        var x = this.x + this.dragOffset.x + this.width;
        x = Math.round(x / this.gridCellWidth);
        return x;
    }

    /**
     *
     */
    get ghostLayer () {
        var y = this.y + this.dragOffset.y;
        y = Math.round(y / this.gridCellHeight);
        return y;
    }

    /**
     *
     */
    get ghostPosition () {
        return new paper.Point(
            (this.ghostStart-1) * this.gridCellWidth,
            this.ghostLayer * this.gridCellHeight
        );
    }

    /**
     *
     */
    get ghostWidth () {
        return (this.ghostEnd + 1 - this.ghostStart) * this.gridCellWidth;
    }

    /**
     *
     */
    get canDrop () {
        var dropStart = this.ghostStart;
        var dropEnd = this.ghostEnd;
        var dropLayerIndex = this.ghostLayer;

        // Can't drop on non-existent layers...
        if(dropLayerIndex < 0 || dropLayerIndex >= this.model.parentTimeline.layers.length) {
            return false;
        }
        // ... or on non-existent frames...
        if(dropStart < 1) {
            return false;
        }

        // Can't make an 'inside out' frame
        if(dropEnd < dropStart) {
            return false;
        }

        // Can't drop on existing frames...
        var onTopOfFrames = this.model.parentTimeline.frames.filter(frame => {
            return !frame.guiElement.ghost.active;
        }).filter(frame => {
            return frame.parentLayer.index === dropLayerIndex;
        }).filter(frame => {
            return frame.inRange(dropStart, dropEnd);
        });

        if(onTopOfFrames.length > 0) {
            return false;
        }

        // We're all good!
        return true;
    }

    /**
     *
     */
    drop () {
        var start = this.ghostStart;
        var end = this.ghostEnd;
        var layer = this.ghostLayer;

        this.model.start = start;
        this.model.end = end;

        var oldLayer = this.model.parentLayer;
        var newLayer = this.model.parentTimeline.layers[layer];
        oldLayer.removeFrame(this.model);
        newLayer.addFrame(this.model, {removeOverlappingFrames: false});
    }

    /**
     *
     */
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
            if(this.model.tweens.length > 0) {
                fillColor = Wick.GUIElement.FRAME_TWEENED_HOVERED_OVER;
            } else {
                fillColor = Wick.GUIElement.FRAME_HOVERED_OVER;
            }
        } else if(this.model.tweens.length > 0) {
            fillColor = Wick.GUIElement.FRAME_TWEENED_FILL_COLOR;
        } else if(this.model.contentful) {
            fillColor = Wick.GUIElement.FRAME_CONTENTFUL_FILL_COLOR;
        } else {
            fillColor = Wick.GUIElement.FRAME_UNCONTENTFUL_FILL_COLOR;
        }

        var frameRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(0, 0),
            to: new this.paper.Point(this.width, this.height),
            fillColor: fillColor,
            strokeColor: this.model.isSelected ? Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR : '#000000',
            strokeWidth: this.model.isSelected ? 3 : 0,
            radius: Wick.GUIElement.FRAME_BORDER_RADIUS,
        });
        this.item.addChild(frameRect);
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
        if(this.model.tweens.length > 0) {
            return;
        }

        var contentDot = new this.paper.Path.Ellipse({
            center: [this.gridCellWidth/2, this.gridCellHeight/2 + 5],
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

        var scriptText = new paper.PointText({
            point: [this.gridCellWidth/2 - 5, this.gridCellHeight/2 + 8],
            content: 's',
            fillColor: '#008466',
            fontFamily: 'Courier New',
            fontWeight: 'bold',
            fontSize: 16,
        });
        scriptText.locked = true;

        this.item.addChild(scriptText);
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
        waveform.position = new paper.Point(waveform.width / 2, waveform.height / 2);

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
        var canDrop = true;
        this.draggingFrames.forEach(frame => {
            if(!frame.guiElement.canDrop) {
                canDrop = false;
            }
        });

        this.draggingFrames.forEach(frame => {
            if(canDrop) {
                frame.guiElement.drop();
            }
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
}
