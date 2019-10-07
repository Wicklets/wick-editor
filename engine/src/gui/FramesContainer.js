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

Wick.GUIElement.FramesContainer = class extends Wick.GUIElement {
    constructor (model) {
        super(model);

        this.canAutoScrollX = true;
        this.canAutoScrollY = true;

        this._frameStrips = {};
        this._frameGhost = null;

        this._selectionBox = null;
    }

    draw () {
        super.draw();

        this.addFrameCol = Math.floor(this.localMouse.x / this.gridCellWidth);
        this.addFrameRow = Math.floor(this.localMouse.y / this.gridCellHeight);

        var ctx = this.ctx;

        // Background
        ctx.fillStyle = Wick.GUIElement.TIMELINE_BACKGROUND_COLOR;
        ctx.beginPath();
        ctx.rect(this.project.scrollX, this.project.scrollY, this.canvas.width, this.canvas.height);
        ctx.fill();

        // Add a small buffer to prevent some graphics from being cut off
        ctx.save();
        ctx.translate(1,1);

        // Draw frame strips
        var layers = this.model.layers;
        layers.forEach(layer => {
            var i = layer.index;

            ctx.save();
            ctx.translate(0, i * this.gridCellHeight);
                if(layer.isActive) {
                    ctx.fillStyle = Wick.GUIElement.FRAMES_STRIP_ACTIVE_FILL_COLOR;
                } else {
                    ctx.fillStyle = Wick.GUIElement.FRAMES_STRIP_INACTIVE_FILL_COLOR;
                }

                var width = this.canvas.width;
                var height = Wick.GUIElement.GRID_DEFAULT_CELL_HEIGHT - 2;

                ctx.beginPath();
                ctx.rect(this.project.scrollX, 0, width, height);
                ctx.fill();
            ctx.restore();
        });

        // Draw grid
        ctx.lineWidth = 1;
        ctx.strokeStyle = Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_COLOR;
        var skip =  Math.round(this.project.scrollX / this.gridCellWidth);
        for(var i = -1; i < this.canvas.width / this.gridCellWidth + 1; i++) {
            ctx.beginPath();
            var x = (i+skip) * this.gridCellWidth;
            ctx.moveTo(x, this.project.scrollY);
            ctx.lineTo(x, this.project.scrollY+this.canvas.height);
            ctx.stroke();
        }

        // Draw frames
        var frames = this.model.getAllFrames();

        var draggingFrames = frames.filter(frame => {
            if(frame.guiElement._ghost) return true;
            if(frame.tweens.find(tween => {
                return tween.guiElement._ghost;
            })) {
                return true;
            }
            return false;
        });

        frames.forEach(frame => {
            if(draggingFrames.indexOf(frame) !== -1) return;
            this._drawFrame(frame, true);
        });

        // Make sure to render the frames being dragged last.
        draggingFrames.forEach(frame => {
            this._drawFrame(frame, false);
        });

        // Add frame overlay
        if(this.mouseState === 'over' && !this._selectionBox && this._addFrameOverlayIsActive()) {
            this.cursor = 'pointer';

            var x = this.addFrameCol * this.gridCellWidth;
            var y = this.addFrameRow * this.gridCellHeight;

            ctx.fillStyle = Wick.GUIElement.ADD_FRAME_OVERLAY_FILL_COLOR;

            ctx.beginPath();
            ctx.roundRect(x, y, this.gridCellWidth, this.gridCellHeight, Wick.GUIElement.FRAME_BORDER_RADIUS);
            ctx.fill();

            // Plus sign
            ctx.font = '30px bold Courier New';
            ctx.fillStyle = Wick.GUIElement.ADD_FRAME_OVERLAY_PLUS_COLOR;
            ctx.globalAlpha = 0.5;
            ctx.fillText('+', x + this.gridCellWidth / 2 - 8, y + this.gridCellHeight / 2 + 8);
            ctx.globalAlpha = 1.0;
        } else {
            this.cursor = 'default';
        }

        // Selection box
        if(this._selectionBox) {
            this._selectionBox.draw();
        }

        // Top drop shadow
        var dropShadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.rect(this.project.scrollX, this.project.scrollY-1, this.canvas.width, 2);
        ctx.fill();

        ctx.restore();
    }

    _drawFrame (frame, enableCull) {
        var ctx = this.ctx;

        // Optimization: don't render frames that are outside the scroll area
        // This really speeds things up!!
        var frameStartX = (frame.start - 1) * this.gridCellWidth;
        var frameStartY = frame.parentLayer.index * this.gridCellHeight;
        var frameEndX = frameStartX + frame.length * this.gridCellWidth;
        var frameEndY = frameStartY + this.gridCellHeight;
        var framesContainerWidth = this.canvas.width - Wick.GUIElement.LAYERS_CONTAINER_WIDTH;
        var framesContainerHeight = this.canvas.height - Wick.GUIElement.BREADCRUMBS_HEIGHT - Wick.GUIElement.NUMBER_LINE_HEIGHT;

        if(enableCull) {
            var scrollX = this.project.scrollX;
            var scrollY = this.project.scrollY;
            if(frameEndX < scrollX || frameEndY < scrollY) {
                return;
            }
            if(frameStartX > scrollX + framesContainerWidth || frameStartY > scrollY + framesContainerHeight) {
                return;
            }
        }

        // Draw the frame
        ctx.save();
        ctx.translate(frameStartX, frameStartY);
            frame.guiElement.draw();
        ctx.restore();
    }

    onMouseDrag () {
        if(!this._selectionBox) {
            this._selectionBox = new Wick.GUIElement.SelectionBox(this.model);
        }

        // Move the playhead when the selection box is dragged.
        var newPlayhead = this.addFrameCol+1;
        if(this.model.playheadPosition !== newPlayhead) {
            this.model.playheadPosition = newPlayhead;
            this.projectWasSoftModified();
        }
    }

    onMouseUp (e) {
        if(this._selectionBox) {
            if(!e.shiftKey) {
                this.model.project.selection.clear();
            }

            // The selection box was just finished, select frames with the box bounds
            this._selectionBox.finish();
        } else if (this._addFrameOverlayIsActive()) {
            var playheadPosition = this.addFrameCol+1;
            var layerIndex = this.addFrameRow;

            // Create a new frame and add that frame to the project
            var newFrame = new Wick.Frame({start: playheadPosition});
            this.model.layers[layerIndex].addFrame(newFrame);

            // Select that frame and activate the layer it belongs to
            this.model.project.selection.clear();
            this.model.project.selection.select(newFrame);
            newFrame.parentLayer.activate();

            // Move the playhead onto the new frame
            this.model.project.activeTimeline.playheadPosition = playheadPosition;

            this.projectWasModified();
        } else {
            // Nothing was clicked - clear the selection
            this.model.project.selection.clear();
            this.projectWasModified();
        }

        this._selectionBox = null;
    }

    get bounds () {
        return {
            x: this.project.scrollX,
            y: this.project.scrollY,
            width: this.canvas.width,
            height: this.canvas.height,
        };
    }

    _addFrameOverlayIsActive () {
        return this.addFrameCol >= 0 &&
               this.addFrameRow >= 0 &&
               this.addFrameRow < this.model.layers.length &&
               !this.model.layers[this.addFrameRow].getFrameAtPlayheadPosition(this.addFrameCol+1);
    }
}
