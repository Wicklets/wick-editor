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

Wick.Tools.None = class extends Wick.Tool {
    /**
     * Creates a none tool.
     */
    constructor () {
        super();

        this.name = 'none';
    }

    /**
     * The "no-sign" cursor.
     * @type {string}
     */
    get cursor () {
        return 'not-allowed'
    }

    onActivate (e) {

    }

    onDeactivate (e) {

    }

    onMouseDown (e) {
        var message = '';

        if(!this.project.activeFrame) {
            message = 'CLICK_NOT_ALLOWED_NO_FRAME';
        } else if (this.project.activeLayer.locked) {
            message = 'CLICK_NOT_ALLOWED_LAYER_LOCKED';
        } else if (this.project.activeLayer.hidden) {
            message = 'CLICK_NOT_ALLOWED_LAYER_HIDDEN';
        } else {
           return;
        }

        this.project.errorOccured(message);
    }

    onMouseDrag (e) {

    }

    onMouseUp (e) {

    }
}
