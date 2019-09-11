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
     * Create a new GUIElement.
     */
    constructor (model) {
        super(model);

        this._canvas = document.createElement('canvas');
        this._ctx = this._canvas.getContext('2d');

        this._canvasContainer = document.createElement('div');
        this._canvasContainer.appendChild(this._canvas);
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
        containerWidth = Math.floor(containerWidth)-2;
        containerHeight = Math.floor(containerHeight)-1;

        if(this._canvas.width !== containerWidth) {
            this._canvas.width = containerWidth;
        }
        if(this._canvas.height !== containerHeight) {
            this._canvas.height = containerHeight;
        }
    };

    /**
     * Draw the GUIElement
     */
    draw () {
        var ctx = this.ctx;
        console.log('drawing the timeline GUI')

        this.resize();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.model.activeTimeline.guiElement.draw();
    }
}
