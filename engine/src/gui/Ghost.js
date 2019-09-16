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
        this.moveCols = Math.round(this._mouseDiff.x/this.gridCellWidth);
        this.moveRows = Math.round(this._mouseDiff.y/this.gridCellHeight);
    }

    finish () {
        // Implemeneted by subclasses.
    }
}
