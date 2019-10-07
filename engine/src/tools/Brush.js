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
    static get CROQUIS_WAIT_AMT_MS () {
        return 100;
    }

    get doubleClickEnabled () {
        return false;
    }

    /**
     * Creates the brush tool.
     */
    constructor () {
        super();

        this.name = 'brush';

        this.BRUSH_POINT_SPACING = 0.2;
        this.BRUSH_STABILIZER_LEVEL = 3;
        this.POTRACE_RESOLUTION = 1.0;

        this.MIN_PRESSURE = 0.14;

        this.croquis;
        this.croquisDOMElement;
        this.croquisBrush;

        this.cachedCursor;

        this.lastPressure;

        this.errorOccured = false;

        this.strokeBounds = new paper.Rectangle();

        this._croquisStartTimeout = null;
    }

    get cursor () {
        // the brush cursor is done in a custom way using _regenCursor().
    }

    get isDrawingTool () {
        return true;
    }

    onActivate (e) {
        if(!this.croquis) {
            this.croquis = new Croquis();
            this.croquis.setCanvasSize(500, 500);
            this.croquis.addLayer();
            this.croquis.fillLayer('rgba(0,0,0,0)');
            this.croquis.addLayer();
            this.croquis.selectLayer(1);
            this.croquis.lockHistory();

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
        clearTimeout(this._croquisStartTimeout);
        this._isInProgress = true;

        this._updateCanvasAttributes();

        // Update croquis params
        this.croquisBrush.setSize(this._getRealBrushSize());
        this.croquisBrush.setColor(this.getSetting('fillColor').toCSS(true));
        this.croquisBrush.setSpacing(this.BRUSH_POINT_SPACING);
        this.croquis.setToolStabilizeLevel(this.BRUSH_STABILIZER_LEVEL);
        this.croquis.setToolStabilizeWeight((this.getSetting('brushStabilizerWeight') / 100.0) + 0.3);
        this.croquis.setToolStabilizeInterval(1);

        // Forward mouse event to croquis canvas
        var point = this._croquisToPaperPoint(e.point);
        this._updateStrokeBounds(point);
        try {
            this.croquis.down(point.x, point.y, this.pressure);
        } catch (e) {
            this.handleBrushError(e);
            return;
        }
    }

    onMouseDrag (e) {
        if(!this._isInProgress) return;

        // Forward mouse event to croquis canvas
        var point = this._croquisToPaperPoint(e.point);
        this._updateStrokeBounds(point);
        try {
            this.croquis.move(point.x, point.y, this.pressure);
        } catch (e) {
            this.handleBrushError(e);
            return;
        }

        this.lastPressure = this.pressure;
    }

    onMouseUp (e) {
        if(!this._isInProgress) return;
        this._isInProgress = false;

        // Forward mouse event to croquis canvas
        var point = this._croquisToPaperPoint(e.point);
        this._updateStrokeBounds(point);
        // This prevents cropping out edges of the brush stroke
        this.strokeBounds = this.strokeBounds.expand(this._getRealBrushSize());
        try {
            this.croquis.up(point.x, point.y, this.lastPressure);
        } catch (e) {
            this.handleBrushError(e);
            return;
        }

        // Give croquis just a little bit to get the canvas ready...
        this.errorOccured = false;
        var strokeBounds = this.strokeBounds.clone();
        this._croquisStartTimeout = setTimeout(() => {
            // Retrieve Croquis canvas
            var canvas = this.paper.view._element.parentElement.getElementsByClassName('croquis-layer-canvas')[1];
            if(!canvas) {
                console.warn("Croquis canvas was not found in the canvas container. Something very bad has happened.")
                this.handleBrushError('misingCroquisCanvas');
                return;
            }

            // Rip image data out of Croquis.js canvas
            // (and crop out empty space using strokeBounds - this massively speeds up potrace)
            var croppedCanvas = document.createElement("canvas");
            var croppedCanvasCtx = croppedCanvas.getContext("2d");
            croppedCanvas.width = strokeBounds.width;
            croppedCanvas.height = strokeBounds.height;
            if(strokeBounds.x < 0) strokeBounds.x = 0;
            if(strokeBounds.y < 0) strokeBounds.y = 0;
            croppedCanvasCtx.drawImage(
              canvas,
              strokeBounds.x, strokeBounds.y,
              strokeBounds.width, strokeBounds.height,
              0, 0, croppedCanvas.width, croppedCanvas.height);

            // Run potrace and add the resulting path to the project
            var svg = potrace.fromImage(croppedCanvas).toSVG(1/this.POTRACE_RESOLUTION/this.paper.view.zoom);
            var potracePath = this.paper.project.importSVG(svg);
            potracePath.fillColor = this.getSetting('fillColor');
            potracePath.position.x += this.paper.view.bounds.x;
            potracePath.position.y += this.paper.view.bounds.y;
            potracePath.position.x += strokeBounds.x / this.paper.view.zoom;
            potracePath.position.y += strokeBounds.y / this.paper.view.zoom;
            potracePath.remove();
            potracePath.closed = true;
            potracePath.children[0].closed = true;
            potracePath.children[0].applyMatrix = true;
            this.addPathToProject(potracePath.children[0]);

            // We're done potracing using the current croquis canvas, reset the stroke bounds
            this._resetStrokeBounds(point);

            // Clear croquis canvas
            this.croquis.clearLayer();
            this.fireEvent('canvasModified');
        }, Wick.Tools.Brush.CROQUIS_WAIT_AMT_MS);
    }

    /**
     * The current amount of pressure applied to the paper js canvas this tool belongs to.
     */
    get pressure () {
        if(this.getSetting('pressureEnabled')) {
            var pressure = this.paper.view.pressure;
            return convertRange(pressure, [0, 1], [this.MIN_PRESSURE, 1]);
        } else {
            return 1;
        }
    }

    /**
     * Croquis throws a lot of errrors. This is a helpful function to handle those errors gracefully.
     */
    handleBrushError (e) {
        this._isInProgress = false;
        this.croquis.clearLayer();

        if(!this.errorOccured) {
            console.error("Brush error");
            console.error(e);
        }
        this.errorOccured = true;
    }

    /**
     * Is the brush currently making a stroke?
     * @type {boolean}
     */
    isInProgress () {
        return this._isInProgress;
    }

    /**
     * Discard the current brush stroke.
     */
    discard () {
        if(!this.isInProgress) return;

        setTimeout(() => {
            this.croquis.up(0, 0, 0);
            this.croquis.clearLayer();
            this.croquisDOMElement.style.opacity = 0;
        }, Wick.Tools.Brush.CROQUIS_WAIT_AMT_MS);
    }

    /* Generate a new circle cursor based on the brush size. */
    _regenCursor () {
        var size = (this._getRealBrushSize());
        var color = this.getSetting('fillColor').toCSS(true);
        this.cachedCursor = this.createDynamicCursor(color, size, this.getSetting('pressureEnabled'));
        this.setCursor(this.cachedCursor);
    }

    /* Get the actual pixel size of the brush to send to Croquis. */
    _getRealBrushSize () {
        var size = this.getSetting('brushSize') + 1;
        if(!this.getSetting('relativeBrushSize')) {
            size *= this.paper.view.zoom;
        }
        return size;
    }

    /* Update Croquis and the div containing croquis to reflect all current options. */
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

    /* Convert a point in Croquis' canvas space to paper.js's canvas space. */
    _croquisToPaperPoint (croquisPoint) {
        var paperPoint = this.paper.view.projectToView(croquisPoint.x, croquisPoint.y);
        return paperPoint;
    }

    /* Used for calculating the crop amount for potrace. */
    _resetStrokeBounds (point) {
        this.strokeBounds = new paper.Rectangle(point.x, point.y, 1, 1);
    }

    /* Used for calculating the crop amount for potrace. */
    _updateStrokeBounds (point) {
        this.strokeBounds = this.strokeBounds.include(point);
    }
}
