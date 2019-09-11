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
    }

    draw () {
        var ctx = this.ctx;

        // Background
        ctx.fillStyle = Wick.GUIElement.TIMELINE_BACKGROUND_COLOR;
        ctx.beginPath();
        ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fill();

        // Draw frame strips
        for(var i = 0; i < this.model.layers.length; i++) {
            var layer = this.model.layers[i];

            if(layer.isActive) {
                ctx.fillStyle = Wick.GUIElement.FRAMES_STRIP_ACTIVE_FILL_COLOR;
            } else {
                ctx.fillStyle = Wick.GUIElement.FRAMES_STRIP_INACTIVE_FILL_COLOR;
            }

            var width = this.canvas.width;
            var height = Wick.GUIElement.FRAMES_STRIP_HEIGHT;

            ctx.save();
            ctx.translate(0, i * this.gridCellHeight);
                ctx.beginPath();
                ctx.rect(0, 0, this.canvas.width, height);
                ctx.fill();
            ctx.restore();
        }

        // Draw grid
        ctx.lineWidth = 1;
        ctx.strokeStyle = Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_COLOR;
        for(var i = -1; i < this.canvas.width / this.gridCellWidth + 1; i++) {
            ctx.beginPath();
            var x = i * this.gridCellWidth;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }

        // Draw frames
        this.model.getAllFrames().forEach(frame => {
            var frameX = (frame.start - 1) * this.gridCellWidth;
            var frameY = frame.parentLayer.index * this.gridCellHeight;
            ctx.save();
            ctx.translate(frameX, frameY);
                frame.guiElement.draw();
            ctx.restore();
        });
    }
}
