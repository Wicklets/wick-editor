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

        this._frameStrips = {};
        this._frameGhost = null;
    }

    draw () {
        var ctx = this.ctx;

        // Background
        ctx.fillStyle = Wick.GUIElement.TIMELINE_BACKGROUND_COLOR;
        ctx.beginPath();
        ctx.rect(this.project.scrollX, this.project.scrollY, this.canvas.width, this.canvas.height);
        ctx.fill();

        // Draw frame strips
        for(var i = 0; i < this.model.layers.length; i++) {
            var layer = this.model.layers[i];

            if(!this._frameStrips[layer.uuid]) {
                this._frameStrips[layer.uuid] = new Wick.GUIElement.FrameStrip(layer);
            }

            ctx.save();
            ctx.translate(0, i * this.gridCellHeight);
                this._frameStrips[layer.uuid].draw();
            ctx.restore();
        }

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
            if(frame._ghost) return true;
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
    }

    _drawFrame (frame, enableCull) {
        var ctx = this.ctx;

        var frameStartX = (frame.start - 1) * this.gridCellWidth;
        var frameStartY = frame.parentLayer.index * this.gridCellHeight;
        var frameEndX = frameStartX + frame.length * this.gridCellWidth;
        var frameEndY = frameStartY + this.gridCellHeight;
        var framesContainerWidth = this.canvas.width - Wick.GUIElement.LAYERS_CONTAINER_WIDTH;
        var framesContainerHeight = this.canvas.height - Wick.GUIElement.BREADCRUMBS_HEIGHT - Wick.GUIElement.NUMBER_LINE_HEIGHT;

        // Optimization: don't render frames that are outside the scroll area
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

        ctx.save();
        ctx.translate(frameStartX, frameStartY);
            frame.guiElement.draw();
        ctx.restore();
    }
}
