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

Wick.Tools.Brush = class extends Wick.Tool {
    /**
     *
     */
    constructor () {
        super();

        this.name = 'brush';

        this.BRUSH_POINT_SPACING = 0.2;

        this.croquis;
        this.croquisDOMElement;
        this.croquisBrush;

        this.cachedCursor;

        this.lastPressure;

        this.BRUSH_STABILIZER_LEVEL = 3;
        this.POTRACE_RESOLUTION = 1.0;

        this.errorOccured = false;
    }

    /**
     *
     * @type {string}
     */
    get cursor () {

    }

    onActivate (e) {
        if(!this.croquis) {
            this.croquis = new Croquis();
            this.croquis.setCanvasSize(500, 500);
            this.croquis.addLayer();
            this.croquis.fillLayer('rgba(0,0,0,0)');
            this.croquis.addLayer();
            this.croquis.selectLayer(1);

            this.croquisBrush = new Croquis.Brush();
            this.croquis.setTool(this.croquisBrush);

            this.croquisDOMElement = this.croquis.getDOMElement();
            this.croquisDOMElement.style.position = 'absolute';
            this.croquisDOMElement.style.left = '0px';
            this.croquisDOMElement.style.top = '0px';
            this.croquisDOMElement.style.width = '100%';
            this.croquisDOMElement.style.height = '100%';
            this.croquisDOMElement.style.display = 'block';
            this.croquisDOMElement.style.pointerEvents = 'none';
        }
    }

    onDeactivate (e) {

    }

    onMouseMove (e) {
        super.onMouseMove(e);

        this._updateCanvasAttributes();
    }

    onMouseDown (e) {
        this._updateCanvasAttributes();

        // Update croquis params
        this.croquisBrush.setSize(this.getSetting('brushSize') + 1);
        this.croquisBrush.setColor(this.getSetting('fillColor').toCSS(true));
        this.croquisBrush.setSpacing(this.BRUSH_POINT_SPACING);
        this.croquis.setToolStabilizeLevel(this.BRUSH_STABILIZER_LEVEL);
        this.croquis.setToolStabilizeWeight((this.getSetting('brushStabilizerWeight') / 100.0) + 0.3);

        // Forward mouse event to croquis canvas
        var point = this.paper.view.projectToView(e.point.x, e.point.y);
        try {
            this.croquis.down(point.x, point.y, this.pressure);
        } catch (e) {
            this.handleBrushError(e);
            return;
        }
    }

    onMouseDrag (e) {
        // Forward mouse event to croquis canvas
        var point = this.paper.view.projectToView(e.point.x, e.point.y)
        try {
            this.croquis.move(point.x, point.y, this.pressure);
        } catch (e) {
            this.handleBrushError(e);
            return;
        }

        this.lastPressure = this.pressure;

        // Regen cursor
        this._regenCursor();
    }

    onMouseUp (e) {
        // Forward mouse event to croquis canvas
        var point = this.paper.view.projectToView(e.point.x, e.point.y);
        try {
            this.croquis.up(point.x, point.y, this.lastPressure);
        } catch (e) {
            this.handleBrushError(e);
            return;
        }

        this.errorOccured = false;

        setTimeout(() => {
            var img = new Image();
            img.onload = () => {
                var svg = potrace.fromImage(img).toSVG(1/this.POTRACE_RESOLUTION/this.paper.view.zoom);
                var potracePath = this.paper.project.importSVG(svg);
                potracePath.fillColor = this.getSetting('fillColor');
                potracePath.position.x += this.paper.view.bounds.x;
                potracePath.position.y += this.paper.view.bounds.y;
                potracePath.remove();
                potracePath.closed = true;
                potracePath.children[0].closed = true;
                potracePath.children[0].applyMatrix = true;
                this.paper.project.activeLayer.addChild(potracePath.children[0]);
                this.croquis.clearLayer();
                this.fireEvent('canvasModified');
            }
            var canvas = this.paper.view._element.parentElement.getElementsByClassName('croquis-layer-canvas')[1];
            if(!canvas) {
                console.warn("Croquis canvas was not found in the canvas container. Something very bad has happened.")
                this.handleBrushError('misingCroquisCanvas');
                return;
            }
            var resizedCanvas = document.createElement("canvas");
            var resizedContext = resizedCanvas.getContext("2d");
            resizedCanvas.width = canvas.width * this.POTRACE_RESOLUTION;
            resizedCanvas.height = canvas.height * this.POTRACE_RESOLUTION;
            resizedContext.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
            img.src = resizedCanvas.toDataURL();
        }, 20);
    }

    /**
     * The current amount of pressure applied to the paper js canvas this tool belongs to.
     */
    get pressure () {
        return this.getSetting('pressureEnabled') ? this.paper.view.pressure : 1;
    }

    /**
     * Croquis throws a lot of errrors. This is a helpful function to handle those errors gracefully.
     */
    handleBrushError (e) {
        if(!this.errorOccured) {
            console.error("Brush error");
            console.error(e);
            this.fireEvent('error', {
                croquisError: e,
            });
        }
        this.errorOccured = true;
    }

    _regenCursor () {
        var size = (this.getSetting('brushSize') + 1) * this.pressure;
        var color = this.getSetting('fillColor').toCSS(true);
        this.cachedCursor = this.createDynamicCursor(color, size);
        this.setCursor(this.cachedCursor);
    }

    _updateCanvasAttributes () {
        // Update croquis element and pressure options
        if(!this.paper.view._element.parentElement.contains(this.croquisDOMElement)) {
            this.paper.view.enablePressure();
            this.paper.view._element.parentElement.appendChild(this.croquisDOMElement);
        }

        // Update croquis element canvas size
        if(this.croquis.getCanvasWidth() !== this.paper.view._element.width ||
           this.croquis.getCanvasHeight() !== this.paper.view._element.height) {
            this.croquis.setCanvasSize(this.paper.view._element.width, this.paper.view._element.height);
        }

        // Generate new cursor
        this._regenCursor();

        // Fake brush opacity in croquis by changing the opacity of the croquis canvas
        this.croquisDOMElement.style.opacity = this.getSetting('fillColor').alpha;
    }
}
