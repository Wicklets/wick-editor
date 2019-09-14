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

Wick.GUIElement.FrameStrip = class extends Wick.GUIElement {
    constructor (model) {
        super(model);
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Body
        if(this.model.isActive) {
            ctx.fillStyle = Wick.GUIElement.FRAMES_STRIP_ACTIVE_FILL_COLOR;
        } else {
            ctx.fillStyle = Wick.GUIElement.FRAMES_STRIP_INACTIVE_FILL_COLOR;
        }

        var width = this.canvas.width;
        var height = Wick.GUIElement.FRAMES_STRIP_HEIGHT;

        ctx.beginPath();
        ctx.rect(this.project.scrollX, 0, width, height);
        ctx.fill();

        // Add frame overlay
        if(this.mouseState === 'over') {
            this.addFrameCol = Math.floor(this.localMouse.x / this.gridCellWidth);
            this.addFrameRow = Math.floor(this.localMouse.y / this.gridCellHeight);

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
        }
    }

    onMouseDown (e) {
        var newFrame = new Wick.Frame({start: this.addFrameCol+1});
        this.model.addFrame(newFrame);
    }

    get bounds () {
        return {
            x: this.project.scrollX,
            y: 0,
            width: this.canvas.width,
            height: Wick.GUIElement.FRAMES_STRIP_HEIGHT,
        };
    }
}
