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

Wick.View = class {
    /**
     * The paper.js scope that all Wick.View subclasses will use to render to.
     */
    static get paperScope () {
        if(!this._paperScope) {
            this._paperScope = new paper.PaperScope();

            // Create dummy paper.js instance so we can access paper classes
            var canvas = window.document.createElement('canvas');
            this._paperScope.setup(canvas);
        }

        // Use active paper scope for window.paper alias
        window.paper = this._paperScope;

        // Activate the paper scope
        this._paperScope.activate();

        return this._paperScope;
    }

    /**
     *
     */
    constructor (model) {
        this.model = model;
        this._eventHandlers = {};
    }

    /**
     *
     */
    set model (model) {
        this._model = model;
    }

    get model () {
        return this._model;
    }

    /**
     *
     */
    get renderMode () {
        return this.model.project && this.model.project.view.renderMode;
    }

    /**
     *
     */
    get paper () {
        return Wick.View.paperScope;
    }

    /**
     *
     */
    render () {
        if(this.renderMode === 'svg') {
            this._renderSVG();
        } else if (this.renderMode === 'webgl') {
            this._renderWebGL();
        }
    }

    /**
     *
     */
    on (eventName, fn) {
        if(!this._eventHandlers[eventName]) {
            this._eventHandlers[eventName] = [];
        }
        this._eventHandlers[eventName].push(fn);
    }

    /**
     *
     */
    fireEvent (eventName, e) {
        var eventFns = this._eventHandlers[eventName];
        if(!eventFns) return;
        eventFns.forEach(fn => {
            fn(e);
        });
    }
}
