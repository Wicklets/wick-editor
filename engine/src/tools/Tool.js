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

Wick.Tool = class {
    static get EVENT_NAMES () {
        return [
            'onActivate',
            'onDeactivate',
            'onMouseMove',
            'onMouseDown',
            'onMouseDoubleClick',
            'onMouseDrag',
            'onMouseUp'
        ];
    }

    /**
     * Creates a new Wick Tool.
     */
    constructor () {
        this.paperTool = new this.paper.Tool();

        Wick.Tool.EVENT_NAMES.forEach(paperEventName => {
            this.paperTool[paperEventName] = (e) => {
                var fn = this[paperEventName];
                fn && fn.bind(this)(e);
            }
        });

        this._eventCallbacks = {};
    }

    /**
     * The paper.js scope to use.
     */
    get paper () {
        return Wick.View.paperScope;
    }

    /**
     * The CSS cursor to display for this tool.
     */
    get cursor () {
        console.warn("Warning: Tool is missing a cursor!");
    }

    /**
     * Called when the tool is activated
     */
    onActivate (e) {

    }

    /**
     * Called when the tool is deactivated (another tool is activated)
     */
    onDeactivate (e) {

    }

    /**
     * Called when the mouse moves and the tool is active.
     */
    onMouseMove (e) {
        this.setCursor(this.cursor);
    }

    /**
     * Called when the mouse clicks the paper.js canvas and this is the active tool.
     */
    onMouseDown (e) {

    }

    /**
     * Called when the mouse is dragged on the paper.js canvas and this is the active tool.
     */
    onMouseDrag (e) {

    }

    /**
     * Called when the mouse is clicked on the paper.js canvas and this is the active tool.
     */
    onMouseUp (e) {

    }

    /**
     * Activates this tool in paper.js.
     */
    activate () {
        this.paperTool.activate();
    }

    /**
     * Sets the cursor of the paper.js canvas that the tool belongs to.
     * @param {string} cursor - a CSS cursor style
     */
    setCursor (cursor) {
        this.paper.view._element.style.cursor = cursor;
    }

    /**
     * Attach a function to get called when an event happens.
     * @param {string} eventName - the name of the event
     * @param {function} fn - the function to call when the event is fired
     */
    on (eventName, fn) {
        this._eventCallbacks[eventName] = fn;
    }

    /**
     * Call the functions attached to a given event.
     * @param {string} eventName - the name of the event to fire
     * @param {object} e - (optional) an object to attach some data to, if needed
     */
    fireEvent (eventName, e) {
        if(!e) e = {};
        if(!e.layers) {
          e.layers = [this.paper.project.activeLayer];
        }
        var fn = this._eventCallbacks[eventName];
        fn && fn(e);
    }

    /**
     *
     * @param {paper.Color} color - the color of the cursor
     * @param {number} size - the width of the cursor image to generate
     */
    createDynamicCursor (color, size) {
        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        var context = canvas.getContext('2d');

        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = size/2;

        context.beginPath();
        context.arc(centerX, centerY, radius+1, 0, 2 * Math.PI, false);
        context.fillStyle = invert(color);
        context.fill();

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = color;
        context.fill();

        return 'url(' + canvas.toDataURL() + ') 64 64,default';
    }

    getSetting (name) {
        return this.project.toolSettings.getSetting(name);
    }
}

Wick.Tools = {};
