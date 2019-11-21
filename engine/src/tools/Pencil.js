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

Wick.Tools.Pencil = class extends Wick.Tool {
    static get MIN_ADD_POINT_MOVEMENT () {
        return 2;
    }

    /**
     * Creates a pencil tool.
     */
    constructor () {
        super();

        this.name = 'pencil'

        this.path = null;

        this._movement = new paper.Point();
    }

    get doubleClickEnabled () {
        return false;
    }

    /**
     * The pencil cursor.
     * @type {string}
     */
    get cursor () {
        return 'url(cursors/pencil.png) 32 32, auto';
    }

    get isDrawingTool () {
        return true;
    }

    onActivate (e) {

    }

    onDeactivate (e) {

    }

    onMouseDown (e) {
        this._movement = new paper.Point();

        if (!this.path) {
            this.path = new this.paper.Path({
                strokeColor: this.getSetting('strokeColor').rgba,
                strokeWidth: this.getSetting('strokeWidth'),
                strokeCap: 'round',
            });
        }

        this.path.add(e.point);
    }

    onMouseDrag (e) {
        if(!this.path) return;

        this._movement = this._movement.add(e.delta);

        if(this._movement.length > Wick.Tools.Pencil.MIN_ADD_POINT_MOVEMENT / this.paper.view.zoom) {
            this._movement = new paper.Point();
            this.path.add(e.point);
            this.path.smooth();
        }
    }

    onMouseUp (e) {
        if(!this.path) return;

        this.path.add(e.point);
        this.path.simplify();
        this.path.remove();
        this.addPathToProject(this.path);
        this.path = null;
        this.fireEvent('canvasModified');
    }
}
