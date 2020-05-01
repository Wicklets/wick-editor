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

Wick.Tools.Rectangle = class extends Wick.Tool {
    /**
     *
     */
    constructor () {
        super();

        this.name = 'rectangle';

        this.path = null;

        this.topLeft = null;
        this.bottomRight = null;
    }

    get doubleClickEnabled () {
        return false;
    }

    /**
     *
     * @type {string}
     */
    get cursor () {
        return 'crosshair';
    }

    get isDrawingTool () {
        return true;
    }

    onActivate (e) {

    }

    onDeactivate (e) {
        if(this.path) {
            this.path.remove();
            this.path = null;
        }
    }

    onMouseDown (e) {
        this.topLeft = e.point;
        this.bottomRight = e.point;
    }

    onMouseDrag (e) {
        if(this.path) this.path.remove();

        this.bottomRight = e.point;

        // Lock width and height if shift is held down
        if(e.modifiers.shift) {
            var d = this.bottomRight.subtract(this.topLeft);
            var max = Math.max(Math.abs(d.x), Math.abs(d.y));
            this.bottomRight.x = this.topLeft.x + max * (d.x < 0 ? -1 : 1);
            this.bottomRight.y = this.topLeft.y + max * (d.y < 0 ? -1 : 1);
        }

        var bounds = new this.paper.Rectangle(
            new paper.Point(this.topLeft.x, this.topLeft.y),
            new paper.Point(this.bottomRight.x, this.bottomRight.y)
        );
        if(this.getSetting('cornerRadius') !== 0) {
            this.path = new this.paper.Path.Rectangle(bounds, this.getSetting('cornerRadius'));
        } else {
            this.path = new this.paper.Path.Rectangle(bounds);
        }

        this.path.fillColor = this.getSetting('fillColor').rgba;
        this.path.strokeColor = this.getSetting('strokeColor').rgba;
        this.path.strokeWidth = this.getSetting('strokeWidth');
        this.path.strokeCap = 'round';
    }

    onMouseUp (e) {
        if(!this.path) return;

        this.path.remove();
        this.addPathToProject(this.path);
        this.path = null;

        this.fireEvent('canvasModified');
    }
}
