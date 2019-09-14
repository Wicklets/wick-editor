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

/**
 * The Project GUIElement handles the creation of the canvas and drawing the rest of the GUIElements.
 */
Wick.GUIElement.Project = class extends Wick.GUIElement {
    /**
     * Create a new GUIElement and build the canvas.
     */
    constructor (model) {
        super(model);

        this._canvas = document.createElement('canvas');
        this._canvas.addEventListener('mousemove', this._onMouseMove.bind(this), false);
        this._canvas.addEventListener('mousedown', this._onMouseDown.bind(this), false);
        this._canvas.addEventListener('mouseup',this._onMouseUp.bind(this), false);
        this._ctx = this._canvas.getContext('2d');

        this._canvasContainer = document.createElement('div');
        this._canvasContainer.style.width = "100%";
        this._canvasContainer.style.height = "100%";
        this._canvasContainer.appendChild(this._canvas);

        this._drawnElements = [];

        this._mouse = {x: 0, y: 0};
        this._mouseHoverTargets = [];

        this._scrollX = 0;
        this._scrollY = 0;

        Wick.GUIElement.Icons.loadIcon('eye_open', Wick.GUIElement.LAYER_LABEL_SHOW_BUTTON_ICON);
        Wick.GUIElement.Icons.loadIcon('eye_closed', Wick.GUIElement.LAYER_LABEL_HIDDEN_BUTTON_ICON);
        Wick.GUIElement.Icons.loadIcon('lock_open', Wick.GUIElement.LAYER_LABEL_UNLOCK_BUTTON_ICON);
        Wick.GUIElement.Icons.loadIcon('lock_closed', Wick.GUIElement.LAYER_LABEL_LOCK_BUTTON_ICON);
        Wick.GUIElement.Icons.loadIcon('trashcan', Wick.GUIElement.TIMELINE_DELETE_BUTTON_ICON);
    }

    /**
     * The div containing the GUI canvas
     */
    get canvasContainer () {
        return this._canvasContainer;
    }

    set canvasContainer (canvasContainer) {
        this._canvasContainer = canvasContainer;

        if(this._canvas !== this._canvasContainer.children[0]) {
            this._canvasContainer.innerHTML = '';
            this._canvasContainer.appendChild(this._canvas);
        }
    }

    /**
     * Resize the canvas so that it fits inside the canvas container, call this when the size of the canvas container changes.
     */
    resize () {
        if(!this._canvasContainer || !this._canvas) return;

        var containerWidth = this.canvasContainer.offsetWidth;
        var containerHeight = this.canvasContainer.offsetHeight;

        // Round off canvas size to avoid blurryness.
        containerWidth = Math.floor(containerWidth) - 2;
        containerHeight = Math.floor(containerHeight) - 1;

        if(this._canvas.width !== containerWidth) {
            this._canvas.width = containerWidth;
        }
        if(this._canvas.height !== containerHeight) {
            this._canvas.height = containerHeight;
        }
    };

    /**
     * Draw this GUIElement and update the mouse state
     */
    draw () {
        var ctx = this.ctx;

        // Make sure canvas is the correct size
        this.resize();

        // Reset drawn objects list
        this._drawnElements = [];

        // Draw the entire GUI
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.model.activeTimeline.guiElement.draw();

        // Draw tooltips
        this._mouseHoverTargets.forEach(target => {
            if(target.tooltip) {
                target.tooltip.draw(target.localTranslation.x, target.localTranslation.y);
            }
        });
    }

    /**
     * Add a GUIElement to the list of objects that were drawn in the last draw call.
     * @param {Wick.GUIElement} elem - the GUIElement to add
     */
    markElementAsDrawn (elem) {
        this._drawnElements.push(elem);
    }

    /**
     * The amount the timeline is scrolled horizontally.
     * @type {number}
     */
    get scrollX () {
        return this._scrollX;
    }

    set scrollX (scrollX) {
        this._scrollX = scrollX;
    }

    /**
     * The amount the timeline is scrolled vertically.
     * @type {number}
     */
    get scrollY () {
        return this._scrollY;
    }

    set scrollY (scrollY) {
        this._scrollY = scrollY;
    }

    _onMouseMove (e) {
        // Update mouse position
        var rect = this._canvas.getBoundingClientRect();
        this._mouse = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        // Update mouse targets
        if(e.buttons === 0) {
            this._mouseHoverTargets = this._drawnElements.filter(elem => {
                return elem.mouseInBounds(this._mouse);
            });
        }

        this.draw();
    }

    _onMouseDown (e) {
        this._mouseHoverTargets.forEach(elem => {
            elem.onMouseDown(e);
        });

        // Clicked nothing - clear the selection
        if(this._mouseHoverTargets.length === 0) {
            this.model.selection.clear();
        }

        this.draw();
    }

    _onMouseUp (e) {
        this._onMouseMove(e);
    }
}
