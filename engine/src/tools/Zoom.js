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

Wick.Tools.Zoom = class extends Wick.Tool {
    /**
     *
     */
    constructor () {
        super();

        this.name = 'zoom';

        this.ZOOM_IN_AMOUNT = 1.25;
        this.ZOOM_OUT_AMOUNT = 0.8;

        this.zoomBox = null;
    }

    /**
     *
     * @type {string}
     */
    get cursor () {
        return 'zoom-in';
    }

    onActivate (e) {

    }

    onDeactivate (e) {
        this.deleteZoomBox();
    }

    onMouseDown (e) {

    }

    onMouseDrag (e) {
        this.deleteZoomBox();
        this.createZoomBox(e);
    }

    onMouseUp (e) {
        if(this.zoomBox && this.zoomBoxIsValidSize()) {
            var bounds = this.zoomBox.bounds;
            this.paper.view.center = bounds.center;
            this.paper.view.zoom = this.paper.view.bounds.height / bounds.height;
        } else {
            var zoomAmount = e.modifiers.alt ? this.ZOOM_OUT_AMOUNT : this.ZOOM_IN_AMOUNT;
            this.paper.view.scale(zoomAmount, e.point);
        }

        this.deleteZoomBox();

        this.fireEvent('canvasViewTransformed');
    }

    createZoomBox (e) {
        var bounds = new this.paper.Rectangle(e.downPoint, e.point);
        bounds.x += 0.5;
        bounds.y += 0.5;
        this.zoomBox = new this.paper.Path.Rectangle(bounds);
        this.zoomBox.strokeColor = 'black';
        this.zoomBox.strokeWidth = 1.0 / this.paper.view.zoom;
    }

    deleteZoomBox () {
        if(this.zoomBox) {
            this.zoomBox.remove();
            this.zoomBox = null;
        }
    }

    zoomBoxIsValidSize () {
        return this.zoomBox.bounds.width > 5
            && this.zoomBox.bounds.height > 5;
    }
}
