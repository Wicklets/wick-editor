/*
 * Copyright 2020 WICKLETS LLC
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

Wick.GUIElement.SelectionBox = class extends Wick.GUIElement.Ghost {
    constructor (model) {
        super(model);
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Draw selection box (using mouse position - this is drawn just so it feels more responsive)
        // (Disabled for now - didn't look good.)
        /*
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = Wick.GUIElement.FRAME_GHOST_COLOR;
        ctx.beginPath();
        ctx.rect(
            this._mouseStart.x,
            this._mouseStart.y,
            this._mouseDiff.x,
            this._mouseDiff.y);
        ctx.fill();
        */

        this.gridStart = {
            x: Math.floor(this._mouseStart.x / this.gridCellWidth),
            y: Math.floor(this._mouseStart.y / this.gridCellHeight),
        };
        this.gridEnd = {
            x: Math.floor(this._mouseEnd.x / this.gridCellWidth),
            y: Math.floor(this._mouseEnd.y / this.gridCellHeight),
        };

        // Make sure min is always less than max
        // (This makes calculating bounds and finding items contained within the selection box easier)
        if(this.gridStart.x > this.gridEnd.x) {
            var temp = this.gridEnd.x;
            this.gridEnd.x = this.gridStart.x;
            this.gridStart.x = temp;
        }

        if(this.gridStart.y > this.gridEnd.y) {
            var temp = this.gridEnd.y;
            this.gridEnd.y = this.gridStart.y;
            this.gridStart.y = temp;
        }

        // Draw selection box (using grid position - this shows what will actually be selected)
        ctx.strokeStyle = 'rgba(66, 111, 200, 1.0)';
        ctx.fillStyle = 'rgba(66, 111, 200, 0.4)';
        ctx.globalAlpha = 1.0;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.roundRect(
            this.gridStart.x * this.gridCellWidth,
            this.gridStart.y * this.gridCellHeight,
            (this.gridEnd.x - this.gridStart.x + 1) * this.gridCellWidth,
            (this.gridEnd.y - this.gridStart.y + 1) * this.gridCellHeight,
            Wick.GUIElement.FRAME_BORDER_RADIUS
        );
        ctx.stroke();
        ctx.fill()
    }

    finish () {
        var playheadRangeStart = this.gridStart.x + 1;
        var playheadRangeEnd = this.gridEnd.x + 1;
        var layerRangeStart = this.gridStart.y;
        var layerRangeEnd = this.gridEnd.y;

        // Find all frames within selection box bounds and select them.
        this.model.getAllFrames().filter(frame => {
            return frame.inRange(playheadRangeStart, playheadRangeEnd)
                && frame.parentLayer.index >= layerRangeStart
                && frame.parentLayer.index <= layerRangeEnd;
        }).forEach(frame => {
            frame.project.selection.select(frame);
        });
    }
}
