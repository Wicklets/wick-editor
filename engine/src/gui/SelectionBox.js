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

Wick.GUIElement.SelectionBox = class extends Wick.GUIElement.Ghost {
    constructor (model) {
        super(model);
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        this.playheadStart = Math.min(this.startCol, this.endCol);
        this.playheadEnd = Math.max(this.startCol, this.endCol);
        this.layerStart = Math.min(this.startRow, this.endRow);
        this.layerEnd = Math.max(this.startRow, this.endRow);

        console.log(this.playheadStart, this.playheadEnd, this.layerStart, this.layerEnd)

        ctx.fillStyle = 'rgba(100,100,255,0.4)';
        ctx.beginPath();
        ctx.roundRect(
            this.playheadStart * this.gridCellWidth,
            this.layerStart * this.gridCellHeight,
            this.playheadEnd * this.gridCellWidth,
            this.layerEnd * this.gridCellHeight,
            Wick.GUIElement.FRAME_BORDER_RADIUS);
        ctx.fill();
    }

    finish () {
        console.log('selection box finish')
    }
}
