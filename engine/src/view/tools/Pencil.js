/*
 * Copyright 2018 WICKLETS LLC
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

Wick.Tools.Pencil = class extends Wick.Tool {
    /**
     * Creates a pencil tool.
     */
    constructor () {
        super();

        this.path = null;

        this.strokeWidth = 1;
        this.strokeColor = '#000000';
    }

    /**
     * The pencil cursor.
     * @type {string}
     */
    get cursor () {
        return 'url(cursors/pencil.png) 32 32, auto';
    }

    onActivate (e) {

    }

    onDeactivate (e) {

    }

    onMouseDown (e) {
        if (!this.path) {
            this.path = new this.paper.Path({
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth,
                strokeCap: 'round',
            });
        }

        this.path.add(e.point);
    }

    onMouseDrag (e) {
        this.path.add(e.point);
        this.path.smooth();
    }

    onMouseUp (e) {
        this.path.add(e.point);
        this.path = null;
        this.fireEvent('canvasModified');
    }
}
