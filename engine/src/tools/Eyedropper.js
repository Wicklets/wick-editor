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

        this.hoverColor = '#ffffff';
        this.colorPreview = null;
    }

    get doubleClickEnabled () {
        return false;
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
        this._destroyColorPreview();
    }

    onMouseMove (e) {
        super.onMouseMove(e);

        var canvas = this.paper.view._element;
        var ctx = canvas.getContext('2d');

        var pointPx = this.paper.view.projectToView(e.point);
        pointPx.x = Math.round(pointPx.x) * window.devicePixelRatio;
        pointPx.y = Math.round(pointPx.y) * window.devicePixelRatio;
        var colorData = ctx.getImageData(pointPx.x, pointPx.y, 1, 1).data;
        var colorCSS = 'rgb(' + colorData[0] + ',' + colorData[1] + ',' + colorData[2] + ')';

        this.hoverColor = colorCSS;

        this._createColorPreview(e.point);
    }

    onMouseDown (e) {
        this._destroyColorPreview();

        this.fireEvent('eyedropperPickedColor', {
            color: new Wick.Color(this.hoverColor),
        });
    }

    onMouseDrag (e) {

    }

    onMouseUp (e) {
        this._createColorPreview(e.point);
    }

    _createColorPreview (point) {
        this._destroyColorPreview();

        var offset = 10 / this.paper.view.zoom;
        var center = point.add(new paper.Point(offset+0.5, offset+0.5));
        var radius = 10 / paper.view.zoom;
        var size = new paper.Size(radius, radius);

        this.colorPreview = new this.paper.Group();
        this.colorPreview.addChild(new this.paper.Path.Rectangle({
            center: center,
            size: size,
            strokeColor: '#000000',
            fillColor: this.hoverColor,
            strokeWidth: 1.0 / this.paper.view.zoom,
        }));
    }

    _destroyColorPreview () {
        if(this.colorPreview) {
            this.colorPreview.remove();
            this.colorPreview = null;
        }
    }
}
