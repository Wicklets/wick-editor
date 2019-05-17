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

        this.BRUSH_POINT_SPACING = 0.2;

        this.croquis;
        this.croquisDOMElement;
        this.croquisBrush;

        this.cachedCursor;

        this.lastPressure;

        this.pressureEnabled = true;
        this.brushSize = 10;
        this.brushStabilizerLevel = 3;
        this.brushStabilizerWeight = 0.5;
        this.potraceResolution = 1.0;
        this.fillColor = new paper.Color('#000000');
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
        this.cachedCursor = this.createDynamicCursor(this.fillColor, this.brushSize * this.pressure);
        this.setCursor(this.cachedCursor);
    }

    onMouseDown (e) {
        // Update croquis params
        this.croquisBrush.setSize(this.brushSize);
        this.croquisBrush.setColor(this.fillColor.toCSS(true));
        this.croquisBrush.setSpacing(this.BRUSH_POINT_SPACING);
        this.croquis.setToolStabilizeLevel(this.brushStabilizerLevel);
        this.croquis.setToolStabilizeWeight(this.brushStabilizerWeight);

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
        this.cachedCursor = this.createDynamicCursor(this.fillColor, this.brushSize * this.pressure);
        this.setCursor(this.cachedCursor);
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

        setTimeout(() => {
            var img = new Image();
            img.onload = () => {
                var svg = potrace.fromImage(img).toSVG(1/this.potraceResolution/this.paper.view.zoom);
                var potracePath = this.paper.project.importSVG(svg);
                potracePath.fillColor = this.fillColor;
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
            resizedCanvas.width = canvas.width * this.potraceResolution;
            resizedCanvas.height = canvas.height * this.potraceResolution;
            resizedContext.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
            img.src = resizedCanvas.toDataURL();
        }, 20);
    }

    /**
     * The current amount of pressure applied to the paper js canvas this tool belongs to.
     */
    get pressure () {
        return this.pressureEnabled ? this.paper.view.pressure : 1;
    }

    /**
     * Croquis throws a lot of errros. This is a helpful function to handle those errors gracefully.
     */
    handleBrushError (e) {
        console.error("Brush error");
        console.error(e);
        this.fireEvent('error', {
            croquisError: e,
        });
    }
}
