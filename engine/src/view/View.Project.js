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

Wick.View.Project = class extends Wick.View {
    static get DEFAULT_CANVAS_BG_COLOR () {
        return 'rgb(187, 187, 187)';
    }

    static get VALID_FIT_MODES () {
        return ['center', 'fill'];
    }

    static get VALID_RENDER_MODES () {
        return ['svg', 'webgl'];
    }

    static get ORIGIN_CROSSHAIR_COLOR () {
        return '#CCCCCC';
    }

    static get ORIGIN_CROSSHAIR_SIZE () {
        return 100;
    }

    static get ORIGIN_CROSSHAIR_THICKNESS () {
        return 1;
    }

    static get ZOOM_MIN () {
        return 0.1;
    }

    static get ZOOM_MAX () {
        return 10.0;
    }

    static get PAN_LIMIT () {
        return 10000;
    }

    /*
     * Create a new Project View.
     */
    constructor (model) {
        super(model);

        this._fitMode = null;
        this._renderMode = null;

        this.fitMode = 'center';
        this.renderMode = 'svg';

        this._canvasContainer = null;
        this._canvasBGColor = null;

        this._svgCanvas = null;
        this._svgBackgroundLayer = null;

        this._webGLCanvas = null;
        this._pixiRootContainer = null;

        this._pan = {x: 0, y: 0};
        this._zoom = 1;

        this._keysDown = [];
        this._isMouseDown = false;
    }

    /*
     * Determines the way the project will scale itself based on its container.
     * 'center' will keep the project at its original resolution, and center it inside its container.
     * 'fill' will stretch the project to fit the container (while maintaining its original aspect ratio).
     *
     * Note: For these changes to be reflected after setting fitMode, you must call Project.View.resize().
     */
    set fitMode (fitMode) {
        if(Wick.View.Project.VALID_FIT_MODES.indexOf(fitMode) === -1) {
            console.error("Invalid fitMode: " + fitMode);
            console.error("Supported fitModes: " + Wick.View.Project.VALID_FIT_MODES.join(','));
        } else {
            this._fitMode = fitMode;
        }
    }

    get fitMode () {
        return this._fitMode;
    }

    /**
     * The renderer to use.
     * Options:
     * - 'svg': Render the project as SVG, enables drawing tools, but decreases performance
     * - 'webgl': Render the project using WebGL, this increases performance, but disables drawing tools.
     */
    get renderMode () {
        return this._renderMode;
    }

    set renderMode (renderMode) {
        if(Wick.View.Project.VALID_RENDER_MODES.indexOf(renderMode) === -1) {
            console.error("Invalid renderMode: " + renderMode);
            console.error("Supported renderModes: " + Wick.View.Project.VALID_RENDER_MODES.join(','));
        } else {
            this._renderMode = renderMode;
        }
    }

    /**
     * The current canvas being rendered to.
     */
    get canvas () {
        if(this.renderMode === 'webgl') {
            return this._webGLCanvas;
        } else if (this.renderMode === 'svg') {
            return this._svgCanvas;
        } else {
            console.error('No canvas for renderMode: ' + this.renderMode);
        }
    }

    /**
     * The zoom amount. 1 = 100% zoom
     */
    get zoom () {
        return this._zoom;
    }

    set zoom (zoom) {
        this._zoom = zoom;
    }

    /**
     * The amount to pan the view. (0,0) is the center.
     */
    get pan () {
        var pan = {
            x: -this.paper.view.center.x,
            y: -this.paper.view.center.y,
        };
        if(this.model.focus.isRoot) {
            pan.x += this.model.width / 2;
            pan.y += this.model.height / 2;
        }
        return pan;
    }

    set pan (pan) {
        this._pan = {
            x: pan.x,
            y: pan.y,
        };
        if(this.model.focus.isRoot) {
            this._pan.x -= this.model.width / 2;
            this._pan.y -= this.model.height / 2;
        }
    }

    /*
     * The element to insert the project's canvas into.
     */
    set canvasContainer (canvasContainer) {
        this._canvasContainer = canvasContainer;
    }

    get canvasContainer () {
        return this._canvasContainer;
    }

    /**
     * The background color of the canvas.
     */
    set canvasBGColor (canvasBGColor) {
        this._canvasBGColor = canvasBGColor;
    }

    get canvasBGColor () {
        return this._canvasBGColor;
    }

    /**
     * Render the view.
     */
    render () {
        this.zoom = this.model.zoom;
        this.pan = this.model.pan;

        if(this.renderMode === 'webgl') {
            this._buildWebGLCanvas();
            this._displayCanvasInContainer(this._webGLCanvas);
            this.resize();
            this._renderWebGLCanvas();
        } else if (this.renderMode === 'svg') {
            this._buildSVGCanvas();
            this._displayCanvasInContainer(this._svgCanvas);
            this.resize();
            this._renderSVGCanvas();
        }
        this._updateCanvasContainerBGColor();
    }

    /**
     *
     */
    processInput () {
        this.model.keysDown = this._keysDown;
        this.model.isMouseDown = this._isMouseDown;
    }

    /*
     * Resize the canvas to fit it's container div.
     * Resize is called automatically before each render, but you must call it if you manually change the size of the container div.
     */
    resize () {
        if(!this.canvasContainer) return;

        var containerWidth = this.canvasContainer.offsetWidth;
        var containerHeight = this.canvasContainer.offsetHeight;

        if(this._renderMode === 'svg' && this._svgCanvas) {
            this.paper.view.viewSize.width = containerWidth;
            this.paper.view.viewSize.height = containerHeight;
        } else if (this._renderMode === 'webgl' && this._webGLCanvas) {
            this._pixiApp.renderer.resize(containerWidth, containerHeight);
        }
    }

    /**
     * Write the SVG data in the view to the project.
     */
    applyChanges () {
        if(this.renderMode !== 'svg') return;

        this.model.selection.view.applyChanges();

        this.model.focus.timeline.activeFrames.forEach(frame => {
            frame.view.applyChanges();
        });
    }

    /**
     * Rasterizes all the SVGs in the project.
     * Use this before rendering a project if you want to make sure all SVGs will show up immediately in the WebGL renderer.
     */
    prerasterize (done) {
        var loadedFrames = [];
        var allFrames = this.model.getAllFrames().filter(frame => {
            return frame.paths.length > 0;
        });

        function rasterizeNextFrame () {
            if(allFrames.length === 0) {
                done();
                return;
            }

            var frame = allFrames.pop();
            frame.view.onFinishRasterize(() => {
                rasterizeNextFrame();
            });
            frame.view.rasterize();
        }

        rasterizeNextFrame();
    }

    /**
     * Destroy the renderer. Call this when the view will no longer be used to save memory/webgl contexts.
     */
    destroy () {
        if(this._pixiApp) {
            this._pixiApp.destroy();
        }
    }

    _setupTools () {
        // This is a hacky way to create scroll-to-zoom functionality.
        // (Using https://github.com/jquery/jquery-mousewheel for cross-browser mousewheel event)
        var _scrollTimeout = null;
        $(this._svgCanvas).on('mousewheel', e => {
            e.preventDefault();
            var d = e.deltaY * e.deltaFactor * 0.001;
            this.paper.view.zoom = Math.max(0.1, this.paper.view.zoom + d);
            this._applyZoomAndPanChangesFromPaper();
        });

        for (var toolName in this.model.tools) {
            var tool = this.model.tools[toolName];
            tool.project = this.model;
            tool.on('canvasModified', (e) => {
                this.applyChanges();
                this.fireEvent('canvasModified', e);
            });
            tool.on('canvasViewTransformed', (e) => {
                this._applyZoomAndPanChangesFromPaper();
                this.fireEvent('canvasModified', e);
            });
            tool.on('error', (e) => {
                this.fireEvent('error', e);
            })
        }

        this.model.tools.none.activate();
    }

    _displayCanvasInContainer (canvas) {
        if(!this.canvasContainer) return;

        if(canvas !== this.canvasContainer.children[0]) {
            if(this.canvasContainer.children.length === 0) {
                this.canvasContainer.appendChild(canvas);
            } else {
                this.canvasContainer.innerHTML = '';
                this.canvasContainer.appendChild(canvas);
            }
            this.resize();
        }
    }

    _updateCanvasContainerBGColor () {
        if(this.model.focus === this.model.root) {
            // We're in the root timeline, use the color given to us from the user (or use a default)
            this.canvas.style.backgroundColor = this.canvasBGColor || Wick.View.Project.DEFAULT_CANVAS_BG_COLOR;
        } else {
            // We're inside a clip, so use the project background color as the container background color
            this.canvas.style.backgroundColor = this.model.backgroundColor;
        }
    }

    _buildSVGCanvas () {
        if(this._svgCanvas) return;

        this._svgCanvas = document.createElement('canvas');
        this._svgCanvas.style.width = '100%';
        this._svgCanvas.style.height = '100%';
        this._svgCanvas.tabIndex = 0;
        this._svgCanvas.onclick = () => { this._svgCanvas.focus(); };
        this.paper.setup(this._svgCanvas);

        this._svgBackgroundLayer = new paper.Layer();
        this._svgBackgroundLayer.name = 'wick_project_bg';
        this._svgBackgroundLayer.remove();

        this.paper.project.clear();
    }

    _renderSVGCanvas () {
        this.paper.project.clear();

        if(!this._toolsSetup) {
            this._toolsSetup = true;
            this._setupTools();
        }
        if(!this.model.activeFrame || this.model.activeLayer.locked || this.model.activeLayer.hidden) {
            this.model.tools.none.activate();
        } else {
            this.model.activeTool.activate();
        }

        // Update zoom and pan
        if(this._fitMode === 'center') {
            this.paper.view.zoom = this.model.zoom;
        } else if (this._fitMode === 'fill') {
            // Fill mode: Try to fit the wick project's canvas inside the container canvas by
            // scaling it as much as possible without changing the project's original aspect ratio
            this.paper.view.zoom = this._calculateFitZoom();
        }
        var pan = this._pan;
        this.paper.view.center = new paper.Point(-pan.x, -pan.y);

        // Generate background layer
        this._svgBackgroundLayer.removeChildren();
        this._svgBackgroundLayer.locked = true;
        this.paper.project.addLayer(this._svgBackgroundLayer);

        if(this.model.focus.isRoot) {
            // We're in the root timeline, render the canvas normally
            var stage = this._generateSVGCanvasStage();
            this._svgBackgroundLayer.addChild(stage);
        } else {
            // We're inside a clip, don't render the canvas BG, instead render a crosshair at (0,0)
            var originCrosshair = this._generateSVGOriginCrosshair();
            this._svgBackgroundLayer.addChild(originCrosshair);
        }

        // Generate frame layers
        this.model.focus.timeline.view.render();
        this.model.focus.timeline.view.activeFrameLayers.forEach(layer => {
            this.paper.project.addLayer(layer);
            if(this.model.project &&
               this.model.project.activeFrame &&
               layer.data.wickType === 'paths' &&
               layer.data.wickUUID === this.model.project.activeFrame.uuid) {
                layer.activate();
            }
        });
        this.model.focus.timeline.view.onionSkinnedFramesLayers.forEach(layer => {
            this.paper.project.addLayer(layer);
        });

        // TODO replace
        // Render selection
        this.model.selection.view.render();
        this.paper.project.addLayer(this.model.selection.view.layer);
    }

    _generateSVGCanvasStage () {
        var stage = new paper.Path.Rectangle(
            new this.paper.Point(0,0),
            new this.paper.Point(this.model.width, this.model.height),
        );
        stage.remove();
        stage.fillColor = this.model.backgroundColor;

        return stage;
    }

    _generateSVGOriginCrosshair () {
        var originCrosshair = new this.paper.Group({insert:false});

        var vertical = new paper.Path.Line(
            new this.paper.Point(0,-Wick.View.Project.ORIGIN_CROSSHAIR_SIZE),
            new this.paper.Point(0,Wick.View.Project.ORIGIN_CROSSHAIR_SIZE)
        );
        vertical.strokeColor = Wick.View.Project.ORIGIN_CROSSHAIR_COLOR;
        vertical.strokeWidth = Wick.View.Project.ORIGIN_CROSSHAIR_THICKNESS / this.paper.view.zoom;

        var horizontal = new paper.Path.Line(
            new this.paper.Point(-Wick.View.Project.ORIGIN_CROSSHAIR_SIZE,0),
            new this.paper.Point(Wick.View.Project.ORIGIN_CROSSHAIR_SIZE,0)
        );
        horizontal.strokeColor = Wick.View.Project.ORIGIN_CROSSHAIR_COLOR;
        horizontal.strokeWidth = Wick.View.Project.ORIGIN_CROSSHAIR_THICKNESS / this.paper.view.zoom;

        originCrosshair.addChild(vertical);
        originCrosshair.addChild(horizontal);

        originCrosshair.position.x = 0;
        originCrosshair.position.y = 0;

        return originCrosshair;
    }

    _buildWebGLCanvas () {
        if(this._pixiApp) return;

        // Create the PIXI.js application
        this._pixiApp = new PIXI.Application({
           autoStart: false,
           transparent: true,
        });
        this._pixiApp.ticker.stop();

        // Create the PIXI stage that we'll add things to render // TODO:
        this._pixiRootContainer = new PIXI.Container();

        // Get the canvas from the PIXI app
        this._webGLCanvas = this._pixiApp.view;

        // Attach input handlers
        this._attachKeyListeners();
        this._attachMouseListeners();
    }

    _renderWebGLCanvas () {
        // Calculate pan and zoom
        var zoom = this._zoom;
        var pan = {
            x: this.pan.x,
            y: this.pan.y
        };
        if(!this.model.focus.isRoot) {
            pan.x += this.model.width / 2;
            pan.y += this.model.height / 2;
        }

        if (this._fitMode === 'fill') {
            // Change pan/zoom if needed depending on fit mode
            zoom = this._calculateFitZoom();
            pan.x = 0;
            pan.y = 0;
        }

        // Reset cursor (button views will change the cursor style if the mouse is over a button)
        this._webGLCanvas.style.cursor = 'default';
        this._pixiRootContainer.removeChildren();

        // Set zoom and pan in Pixi
        this._pixiRootContainer.pivot = new PIXI.Point(this.model.width/2, this.model.height/2);
        this._pixiRootContainer.scale.x = zoom;
        this._pixiRootContainer.scale.y = zoom;
        this._pixiRootContainer.x = pan.x*zoom + this._pixiApp.renderer.width/2;
        this._pixiRootContainer.y = pan.y*zoom + this._pixiApp.renderer.height/2;

        // Update mouse position (and adjust based on fit mode)
        var pixiMouse = this._pixiApp.renderer.plugins.interaction.mouse.getLocalPosition(this._pixiRootContainer);
        this.model.mousePosition = {
            x: pixiMouse.x,
            y: pixiMouse.y,
        };

        if(this.model.focus.isRoot) {
            // We're in the root timeline, render the canvas normally
            this._pixiRootContainer.addChild(this._generateWebGLCanvasStage());
        } else {
            // We're inside a clip, don't render the canvas BG, instead render a crosshair at (0,0)
            this._pixiRootContainer.addChild(this._generateWebGLOriginCrosshair());
        }

        // Add active frame containers
        this.model.focus.timeline.view.render();
        this.model.focus.timeline.view.activeFrameContainers.forEach(container => {
            this._pixiRootContainer.addChild(container);
        });

        // Render Pixi
        this._pixiApp.ticker.update(1);
        this._pixiApp.renderer.render(this._pixiRootContainer);
    }

    _generateWebGLCanvasStage () {
        let graphics = new PIXI.Graphics();
        graphics._wickDebugData = {type: 'canvas_stage'};

        graphics.beginFill(this._convertCSSColorToPixiColor(this.model.backgroundColor));
        graphics.drawRect(0, 0, this.model.width, this.model.height);

        return graphics;
    }

    _generateWebGLOriginCrosshair () {
        let graphics = new PIXI.Graphics();
        graphics._wickDebugData = {type: 'origin_crosshair'};

        // crosshair style
        var pixiColor = this._convertCSSColorToPixiColor(Wick.View.Project.ORIGIN_CROSSHAIR_COLOR);
        graphics.lineStyle(Wick.View.Project.ORIGIN_CROSSHAIR_THICKNESS, pixiColor);

        // vertical line
        graphics.moveTo(0, -Wick.View.Project.ORIGIN_CROSSHAIR_SIZE)
                .lineTo(0, Wick.View.Project.ORIGIN_CROSSHAIR_SIZE)

        // horizontal line
        graphics.moveTo(-Wick.View.Project.ORIGIN_CROSSHAIR_SIZE, 0)
                .lineTo(Wick.View.Project.ORIGIN_CROSSHAIR_SIZE, 0);

        return graphics;
    }

    _getCenteredPan () {
        if(this.model.focus.isRoot) {
            return {
                x: this.model.pan.x - this.model.width/2,
                y: this.model.pan.y - this.model.height/2
            };
        } else {
            return {
                x: this.model.pan.x,
                y: this.model.pan.y,
            };
        }
    }

    _convertCSSColorToPixiColor (cssColor) {
        cssColor = new paper.Color(cssColor).toCSS(true);
        return parseInt(cssColor.replace("#", "0x"))
    }

    _calculateFitZoom () {
        var w = 0;
        var h = 0;

        if(this._renderMode === 'svg') {
            w = this.paper.view.viewSize.width;
            h = this.paper.view.viewSize.height;
        } else if (this._renderMode === 'webgl') {
            w = this._pixiApp.renderer.width;
            h = this._pixiApp.renderer.height;
        }

        var wr = w / this.model.width;
        var hr = h / this.model.height;

        return Math.min(wr, hr);
    }

    _attachKeyListeners () {
        window.onkeydown = this._onKeyDown.bind(this);
        window.onkeyup = this._onKeyUp.bind(this);
    }

    _detachKeyListeners () {

    }

    _cleanKeyName (keyString) {
        return keyString.toLowerCase().replace("arrow", "");
    }

    _onKeyDown (e) {
        let cleanKey = this._cleanKeyName(e.key);
        if(this._keysDown.indexOf(cleanKey) === -1) {
            this._keysDown.push(cleanKey);
        }
    }

    _onKeyUp (e) {
        let cleanKey = this._cleanKeyName(e.key);
        this._keysDown = this._keysDown.filter(key => {
            return key !== cleanKey;
        });
    }

    _attachMouseListeners () {
        window.onmousedown = () => {
            this._onMouseDown();
        };
        window.onmouseup = () => {
            this._onMouseUp();
        };
    }

    _onMouseDown () {
        this._isMouseDown = true;
    }

    _onMouseUp () {
        this._isMouseDown = false;
    }

    _applyZoomAndPanChangesFromPaper () {
        // limit zoom to min and max
        this.paper.view.zoom = Math.min(Wick.View.Project.ZOOM_MAX, this.paper.view.zoom);
        this.paper.view.zoom = Math.max(Wick.View.Project.ZOOM_MIN, this.paper.view.zoom);

        // limit pan
        this.pan.x = Math.min( Wick.View.Project.PAN_LIMIT, this.pan.x);
        this.pan.x = Math.max(-Wick.View.Project.PAN_LIMIT, this.pan.x);
        this.pan.y = Math.min( Wick.View.Project.PAN_LIMIT, this.pan.y);
        this.pan.y = Math.max(-Wick.View.Project.PAN_LIMIT, this.pan.y);

        this.model.pan = {
            x: this.pan.x,
            y: this.pan.y,
        };

        this.zoom = this.paper.view.zoom;
        this.model.zoom = this.zoom;
    }

    _uuidsAreDifferent (uuids1, uuids2) {
        //https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality
        var a = new Set(uuids1);
        var b = new Set(uuids2);
        var isSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));
        return !isSetsEqual(a,b);
    }
}
