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

Wick.Tools.Pan = class extends Wick.Tool {
    /**
     *
     */
    constructor () {
        super();

        this.name = 'pan';
    }

    get doubleClickEnabled () {
        return false;
    }

    /**
     *
     * @type {string}
     */
    get cursor () {
        return 'move';
    }

    onActivate (e) {

    }

    onDeactivate (e) {

    }

    onMouseDown (e) {

    }

    onMouseDrag (e) {
        var d = e.downPoint.subtract(e.point);
        this.paper.view.center = this.paper.view.center.add(d);
    }

    onMouseUp (e) {
        this.fireEvent({eventName: 'canvasViewTransformed'});
    }
}
