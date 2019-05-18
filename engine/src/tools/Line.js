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

Wick.Tools.Line = class extends Wick.Tool {
    /**
     *
     */
    constructor () {
        super();

        this.name = 'line';

        this.path = new this.paper.Path({insert:false});

        this.startPoint;
        this.endPoint;
    }

    /**
     *
     * @type {string}
     */
    get cursor () {
        return 'crosshair';
    }

    onActivate (e) {
        this.path.remove();
    }

    onDeactivate (e) {
        this.path.remove();
    }

    onMouseDown (e) {
        this.startPoint = e.point;
    }

    onMouseDrag (e) {
        this.path.remove();
        this.endPoint = e.point;
        this.path = new paper.Path.Line(this.startPoint, this.endPoint);
        this.path.strokeCap = 'round';
        this.path.strokeColor = this.getSetting('strokeColor');
        this.path.strokeWidth = this.getSetting('strokeWidth');
    }

    onMouseUp (e) {
        this.fireEvent('canvasModified');
    }
}
