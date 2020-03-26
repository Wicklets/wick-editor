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

Wick.GUIElement.Ghost = class extends Wick.GUIElement {
    constructor (model) {
        super(model);
    }

    draw () {
        super.draw();

        this._mouseStart = this._mouseStart || {
            x: this.localMouse.x,
            y: this.localMouse.y
        };
        this._mouseEnd = {
            x: this.localMouse.x,
            y: this.localMouse.y
        };
        this._mouseDiff = {
            x: this._mouseEnd.x - this._mouseStart.x,
            y: this._mouseEnd.y - this._mouseStart.y
        };

        // Save how many rows/columns we've moved for later
        var moveRowCols = this._roundToGrid(this._mouseDiff.x, this._mouseDiff.y);
        this.moveCols = moveRowCols.col;
        this.moveRows = moveRowCols.row;

        var startRowCols = this._roundToGrid(this._mouseStart.x, this._mouseStart.y);
        this.startCol = startRowCols.col;
        this.startRow = startRowCols.row;

        var endRowCols = this._roundToGrid(this._mouseEnd.x, this._mouseEnd.y);
        this.endCol = endRowCols.col;
        this.endRow = endRowCols.row;
    }

    finish () {
        // Implemeneted by subclasses.
    }

    _roundToGrid (x, y) {
        return {
            col: Math.round(x / this.gridCellWidth),
            row: Math.round(y / this.gridCellHeight)
        }
    }
}
