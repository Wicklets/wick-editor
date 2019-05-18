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

Wick.Tools.Eraser = class extends Wick.Tool {
    /**
     *
     */
    constructor () {
        super();

        this.path = null;

        this.cursorSize = null;
        this.cachedCursor = null;
    }

    /**
     *
     * @type {string}
     */
    get cursor () {
        return this.cachedCursor || 'crosshair';
    }

    onActivate (e) {
        this.cursorSize = null;
    }

    onDeactivate (e) {
        if(this.path) {
            this.path.remove();
            this.path = null;
        }
    }

    onMouseMove (e) {
        // Don't render cursor after every mouse move, cache and only render when size changes
        var cursorNeedsRegen = this.getSetting('eraserSize') !== this.cursorSize;

        if(cursorNeedsRegen) {
            this.cachedCursor = this.createDynamicCursor(new paper.Color('#ffffff'), this.getSetting('eraserSize'));
            this.cursorSize = this.getSetting('eraserSize');
            this.setCursor(this.cachedCursor);
        }
    }

    onMouseDown (e) {
        if (!this.path) {
            this.path = new this.paper.Path({
                strokeColor: 'white',
                strokeCap: 'round',
                strokeWidth: this.getSetting('eraserSize') / this.paper.view.zoom,
            });
        }

        // Add two points so we always at least have a dot.
        this.path.add(e.point);
        this.path.add(e.point);
    }

    onMouseDrag (e) {
        this.path.add(e.point);
        this.path.smooth();
    }

    onMouseUp (e) {
        if(!this.path) return;

        var potraceResolution = 0.7;

        this.path.potrace({
            done: (tracedPath) => {
                this.path.remove();
                this.paper.project.activeLayer.erase(tracedPath,{});
                this.path = null;
                this.fireEvent('canvasModified');
            },
            resolution: potraceResolution * this.paper.view.zoom,
        });
    }
}
