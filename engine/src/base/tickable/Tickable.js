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
 * A class that is extended by any wick object that ticks.
 */
Wick.Tickable = class extends Wick.Base {
    /**
     * Returns a list of all possible events for this object.
     * @return {string[]} Array of all possible scripts.
     */
    static get possibleScripts () {
        return [
            'load',
            'update',
            'unload',
            'mouseenter',
            'mousedown',
            'mousepressed',
            'mousereleased',
            'mouseleave',
            'mousehover',
            'mousedrag',
            'mouseclick',
            'keypressed',
            'keyreleased',
            'keydown',
        ];
    }

    /**
     * Create a new tickable object.
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        this._onscreen = false;
        this._onscreenLastTick = false;

        this._scripts = [];

        this._mouseState = 'out';
        this._lastMouseState = 'out';

        this.cursor = 'default';
    }

    deserialize (data) {
        super.deserialize(data);

        this._scripts = [].concat(data.scripts || []);
        this.cursor = data.cursor;

    }

    serialize (args) {
        var data = super.serialize(args);

        data.scripts = [].concat(this._scripts);
        data.cursor = this.cursor;

        return data;
    }

    get classname () {
        return 'Tickable';
    }

    /**
     * The scripts on this object.
     * @type {Wick.Script[]}
     */
    get scripts () {
        return this._scripts;
    }

    /**
     * Check if this object is currently visible in the project.
     * @type {boolean}
     */
    get onScreen () {
        if(!this.parent) return false;
        return this.parent.onScreen;
    }

    /**
     * Check if an object can have scripts attached to it. Helpful when iterating through a lot of different wick objects that may or may not be tickables. Always returns true.
     * @type {boolean}
     */
    get isScriptable () {
        return true;
    }

    /**
     * Add a new script to an object.
     * @param {string} name - The name of the event that will trigger the script. See Wick.Tickable.possibleScripts
     * @param {string} src - The source code of the new script.
     */
    addScript (name, src) {
        if(Wick.Tickable.possibleScripts.indexOf(name) === -1) console.error(name + ' is not a valid script!');
        if(this.hasScript(name)) return;

        this._scripts.push({
            name: name,
            src: '',
        });

        // Sort scripts by where they appear in the possibleScripts list
        var possibleScripts = Wick.Tickable.possibleScripts;
        this._scripts.sort((a,b) => {
            return possibleScripts.indexOf(a.name) - possibleScripts.indexOf(b.name);
        });

        if(src) {
            this.updateScript(name, src);
        }
    }

    /**
     * Get the script of this object that is triggered when the given event name happens.
     * @param {string} name - The name of the event. See Wick.Tickable.possibleScripts
     * @returns {object} the script with the given name. Can be null if the object doesn't have that script.
     */
    getScript (name) {
        if(Wick.Tickable.possibleScripts.indexOf(name) === -1) console.error(name + ' is not a valid script!');
        return this._scripts.find(script => {
            return script.name === name;
        });
    }

    /**
     * Returns a list of script names which are not currently in use for this object.
     * @return {string[]} Available script names.
     */
    getAvailableScripts () {
      return Wick.Tickable.possibleScripts.filter(script => !this.hasScript(script));
    }

    /**
     * Check if the object has a script with the given event name.
     * @param {string} name - The name of the event. See Wick.Tickable.possibleScripts
     */
    hasScript (name) {
        return this.getScript(name) !== undefined;
    }

    /**
     * Changes the source of the script with the given event name.
     * @param {string} name - The name of the event that will trigger the script. See Wick.Tickable.possibleScripts
     * @param {string} src - The source code of the script.
     */
    updateScript (name, src) {
        this.getScript(name).src = src;
    }

    /**
     * Remove the script that corresponds to a given event name.
     * @param {string} name - The name of the event. See Wick.Tickable.possibleScripts
     */
    removeScript (name) {
        this._scripts = this._scripts.filter(script => {
            return script.name !== name;
        });
    }

    /**
     * Run the script with the corresponding event name.
     * @param {string} name - The name of the event. See Wick.Tickable.possibleScripts
     */
    runScript (name) {
        if(!Wick.Tickable.possibleScripts.indexOf(name) === -1) console.error(name + ' is not a valid script!');
        if(!this.hasScript(name)) return null;

        // Dont' run scripts if this object is the focus
        // (so that preview play will always play)
        if(this.project && this.project.focus === this) {
            return;
        }

        var script = this.getScript(name);

        var api = new GlobalAPI(this);
        var otherObjects = this.parentClip ? this.parentClip.activeNamedChildren : [];
        var otherObjectNames = otherObjects.map(obj => obj.identifier);

        // Catch syntax/parsing errors.
        try {
            esprima.parseScript(script.src)
        } catch (e) {
            console.log(e);
            return this._generateEsprimaErrorInfo(e, name);
        }

        // Attempt to create valid function...
        try {
            var fn = new Function(api.apiMemberNames.concat(otherObjectNames), script.src);
            fn = fn.bind(this);
        } catch (e) {
            // This should almost never be thrown unless there is an attempt to use syntax
            // that the syntax checker (esprima) does not understand.
            console.log(e);
            return this._generateErrorInfo(e, name);
        }

        // Catch runtime errors
        try {
            fn(...api.apiMembers, ...otherObjects);
        } catch (e) {
            console.log(e);
            return this._generateErrorInfo(e, name);
        }

        return null;
    }

    /**
     * The tick routine to be called when the object ticks.
     * @returns {object} - An object with information about the result from ticking.
     */
    tick () {
        // Update named child references
        this._attachChildClipReferences();

        // Update onScreen flags.
        this._onscreenLastTick = this._onscreen;
        this._onscreen = this.onScreen;

        // Update mouse states.
        this._lastMouseState = this._mouseState;
        if(this.view) this._mouseState = this.view._mouseState;

        // Call tick event function that corresponds to state.
        if(!this._onscreen && !this._onscreenLastTick) {
            return this._onInactive();
        } else if (this._onscreen && !this._onscreenLastTick) {
            return this._onActivated();
        } else if (this._onscreen && this._onscreenLastTick) {
            return this._onActive();
        } else if (!this._onscreen && this._onscreenLastTick) {
            return this._onDeactivated();
        }
    }

    _onInactive () {
        return null;
    }

    _onActivated () {
        return this.runScript('load');
    }

    _onActive () {
        var error = this.runScript('update');
        if (error) return error;

        var current = this._mouseState;
        var last = this._lastMouseState;

        // Mouse enter
        if(last === 'out' && current !== 'out') {
            var error = this.runScript('mouseenter');
            if(error) return error;
        }

        // Mouse down
        if(current === 'down') {
            var error = this.runScript('mousedown');
            if(error) return error;
        }

        // Mouse pressed
        if(last === 'over' && current === 'down') {
            var error = this.runScript('mousepressed');
            if(error) return error;
        }

        // Mouse up
        if(last === 'down' && current === 'over') {
            var error = this.runScript('mousereleased');
            if(error) return error;
        }

        // Mouse leave
        if(last !== 'out' && current === 'out') {
            var error = this.runScript('mouseleave');
            if(error) return error;
        }

        // Mouse hover
        if(current === 'over') {
            var error = this.runScript('mousehover');
            if(error) return error;
        }

        // Mouse drag
        if(last === 'down' && current === 'down') {
            var error = this.runScript('mousedrag');
            if(error) return error;
        }

        // Mouse click
        if(last === 'down' && current === 'over') {
            var error = this.runScript('mouseclick');
            if(error) return error;
        }

        // Key events require the Tickable object to be inside of a project. Don't run them if there is no project
        if(!this.project) return null;

        // Key down
        this.project.keysDown.forEach(key => {
            this.project.currentKey = key;
            var error = this.runScript('keydown');
            if(error) return error;
        });

        // Key press
        this.project.keysJustPressed.forEach(key => {
            this.project.currentKey = key;
            var error = this.runScript('keypressed');
            if(error) return error;
        });

        // Key released
        this.project.keysJustReleased.forEach(key => {
            this.project.currentKey = key;
            var error = this.runScript('keyreleased');
            if(error) return error;
        });
    }

    _onDeactivated () {
        return this.runScript('unload');
    }

    _generateLineNumberFromStackTrace (trace) {
        var lineNumber = null;

        trace.split('\n').forEach(line => {
            if(lineNumber !== null) return;

            var split = line.split(':');
            var lineString = split[split.length-2];
            var lineInt = parseInt(lineString);
            if(!isNaN(lineInt)) {
                lineNumber = lineInt-2;
            }
        });

        return lineNumber;
    }

    _generateEsprimaErrorInfo (error, name) {
        return {
            name: name !== undefined ? name : '',
            lineNumber: error.lineNumber,
            message: error.description,
            uuid: this.uuid,
        }
    }

    _generateErrorInfo (error, name) {
        return {
            name: name !== undefined ? name : '',
            lineNumber: this._generateLineNumberFromStackTrace(error.stack),
            message: error.message,
            uuid: this.uuid,
        }
    }

    _attachChildClipReferences () {
        // Implemented by Wick.Clip and Wick.Frame.
    }
}
