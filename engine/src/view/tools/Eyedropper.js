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

Wick.Tools.Eyedropper = class extends Wick.Tool {
    /**
     *
     */
    constructor () {
        super();

        this.canvasCtx = null;
        this.hoverColor = null;

        this.colorPreviewBorder = null;
        this.colorPreview = null;
    }

    /**
     *
     * @type {string}
     */
    get cursor () {
        return 'url(cursors/eyedropper.png) 32 32, auto';
    }

    onActivate (e) {
        this.canvasCtx = this.paper.view._element.getContext('2d');
    }

    onDeactivate (e) {
        this._destroyColorPreview();
    }

    onMouseDown (e) {
        this._destroyColorPreview();

        var pointPx = this.paper.view.projectToView(e.point);
        pointPx.x = Math.round(pointPx.x);
        pointPx.y = Math.round(pointPx.y);
        var colorData = this.canvasCtx.getImageData(pointPx.x, pointPx.y, 1, 1).data;
        this.hoverColor = 'rgb(' + colorData[0] + ',' + colorData[1] + ',' + colorData[2] + ')';

        this._createColorPreview(e.point);
    }

    onMouseDrag (e) {

    }

    onMouseUp (e) {

    }

    _createColorPreview (point) {
        var offset = 10 / this.paper.view.zoom;
        var center = point.add(new paper.Point(offset+0.5, offset+0.5));
        var radius = 10 / paper.view.zoom;
        var size = new paper.Size(radius, radius);

        this.colorPreviewBorder = new this.paper.Path.Rectangle(center, size);
        this.colorPreviewBorder.strokeColor = 'white';
        this.colorPreviewBorder.strokeWidth = 3.0 / this.paper.view.zoom;

        this.colorPreview = new this.paper.Path.Rectangle(center, size);
        this.colorPreview.fillColor = hoverColor;
        this.colorPreview.strokeColor = 'black';
        this.colorPreview.strokeWidth = 1.0 / this.paper.view.zoom;
    }

    _destroyColorPreview () {
        if(this.colorPreview) {
            this.colorPreview.remove();
            this.colorPreview = null;
            this.colorPreviewBorder.remove();
            this.colorPreviewBorder = null;
        }
    }
}
