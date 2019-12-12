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
    static get DOUBLE_CLICK_TIME () {
        return 300;
    }

    static get DOUBLE_CLICK_MAX_DISTANCE () {
        return 20;
    }

    /**
     * Creates a new Wick Tool.
     */
    constructor () {
        this.paperTool = new this.paper.Tool();

        // Attach onActivate event
        this.paperTool.onActivate = (e) => {
            this.onActivate(e);
        }

        // Attach onDeactivate event
        this.paperTool.onDeactivate = (e) => {
            this.onDeactivate(e);
        }

        // Attach mouse move event
        this.paperTool.onMouseMove = (e) => {
            this.onMouseMove(e);
        }

        // Attach mouse down + double click event
        this.paperTool.onMouseDown = (e) => {
            if(this.doubleClickEnabled &&
               this._lastMousedownTimestamp !== null &&
               e.timeStamp - this._lastMousedownTimestamp < Wick.Tool.DOUBLE_CLICK_TIME &&
               e.point.subtract(this._lastMousedownPoint).length < Wick.Tool.DOUBLE_CLICK_MAX_DISTANCE) {
                this.onDoubleClick(e);
            } else {
                this.onMouseDown(e);
            }
            this._lastMousedownTimestamp = e.timeStamp;
            this._lastMousedownPoint = e.point;
        }

        // Attach key events
        this.paperTool.onKeyDown = (e) => {
            this.onKeyDown(e);
        }
        this.paperTool.onKeyUp = (e) => {
            this.onKeyUp(e);
        }

        // Attach mouse move event
        this.paperTool.onMouseDrag = (e) => {
            this.onMouseDrag(e);
        }

        // Attach mouse up event
        this.paperTool.onMouseUp = (e) => {
            this.onMouseUp(e);
        }

        this._eventCallbacks = {};

        this._lastMousedownTimestamp = null;
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
     * Called when the mouse double clicks on the paper.js canvas and this is the active tool.
     */
    onDoubleClick (e) {

    }

    /**
     * Called when a key is pressed and this is the active tool.
     */
    onKeyDown (e) {

    }

    /**
     * Called when a key is released and this is the active tool.
     */
    onKeyUp (e) {

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
     * @param {boolean} transparent - if set to true, color is ignored
     */
    createDynamicCursor (color, size, transparent) {
        var radius = size/2;

        var canvas = document.createElement("canvas");
        canvas.width = radius * 2 + 2;
        canvas.height = radius * 2 + 2;
        var context = canvas.getContext('2d');

        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;

        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.strokeStyle = transparent ? 'black' : invert(color);
        context.stroke();

        if(transparent) {
            context.beginPath();
            context.arc(centerX, centerY, radius-1, 0, 2 * Math.PI, false);
            context.strokeStyle = 'white';
            context.stroke();
        } else {
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            context.fillStyle = color;
            context.fill();
        }

        return 'url(' + canvas.toDataURL() + ') '+(radius+1)+' '+(radius+1)+',default';
    }

    /**
     * Get a tool setting from the project. See Wick.ToolSettings for all options
     * @param {string} name - the name of the setting to get
     */
    getSetting (name) {
        return this.project.toolSettings.getSetting(name);
    }

    /**
     * Does this tool have a double click action? (override this in classes that extend Wick.Tool)
     * @type {boolean}
     */
    get doubleClickEnabled () {
        return true;
    }

    /**
     * Adds a paper.Path to the active frame's paper.Layer.
     * @param {paper.Path} path - the path to add
     */
    addPathToProject (path) {
        // Automatically add a frame is there isn't one
        if(!this.project.activeFrame) {
            this.project.insertBlankFrame();
            this.project.view.render();
        }

        if(path)
            this.paper.project.activeLayer.addChild(path);
    }
}

Wick.Tools = {};
