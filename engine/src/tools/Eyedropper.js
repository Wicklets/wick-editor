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

Wick.Tools.Eyedropper = class extends Wick.Tool {
    /**
     *
     */
    constructor () {
        super();

        this.name = 'eyedropper';

        this.canvasCtx = null;
    }

    /**
     *
     * @type {string}
     */
    get cursor () {
        return 'url(cursors/eyedropper.png) 32 32, auto';
    }

    onActivate (e) {

    }

    onDeactivate (e) {

    }

    onMouseDown (e) {
        var canvas = this.paper.view._element;
        var ctx = canvas.getContext('2d');

        var pointPx = this.paper.view.projectToView(e.point);
        pointPx.x = Math.round(pointPx.x);
        pointPx.y = Math.round(pointPx.y);
        var colorData = ctx.getImageData(pointPx.x, pointPx.y, 1, 1).data;
        var colorCSS = 'rgb(' + colorData[0] + ',' + colorData[1] + ',' + colorData[2] + ')';
        var color = new paper.Color(colorCSS);

        if(!e.modifiers.shift) {
            this.project.toolSettings.setSetting('fillColor', colorCSS);
        } else {
            this.project.toolSettings.setSetting('strokeColor', colorCSS);
        }
        this.fireEvent('canvasModified');
    }

    onMouseDrag (e) {

    }

    onMouseUp (e) {

    }
}
