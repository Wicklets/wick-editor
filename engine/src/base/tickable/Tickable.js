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
     * Debugging feature. Logs errors as they happen
     */
    static get LOG_ERRORS () {
        return false;
    }

    /**
     * Returns a list of all possible events for this object.
     * @return {string[]} Array of all possible scripts.
     */
    static get possibleScripts () {
        return [
            'default',
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
            'load',
            'update',
            'unload',
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

        this._mouseState = 'out';
        this._lastMouseState = 'out';

        this._scripts = [];

        this.cursor = 'default';

        this.addScript('default', '');

        this._onEventFns = {};
        this._cachedScripts = {};
    }

    deserialize (data) {
        super.deserialize(data);

        this._onscreen = false;
        this._onscreenLastTick = false;

        this._mouseState = 'out';
        this._lastMouseState = 'out';

        this._scripts = JSON.parse(JSON.stringify(data.scripts));
        this.cursor = data.cursor;

        this._onEventFns = {};
        this._cachedScripts = {};

    }

    serialize (args) {
        var data = super.serialize(args);

        data.scripts = JSON.parse(JSON.stringify(this._scripts));
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
     * Checks if this object has a non-empty script.
     * @type {boolean}
     */
    get hasContentfulScripts () {
        var hasContentfulScripts = false;
        this._scripts.forEach(script => {
            if(hasContentfulScripts) return;
            if(script.src !== '') {
                hasContentfulScripts = true;
            }
        })
        return hasContentfulScripts;
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
     * Add a function to be called when an event happens.
     * @param {string} name - The name of the event to attach the function to.
     * @param {function} fn - The function to call when the given event happens.
     */
    onEvent (name, fn) {
        if(Wick.Tickable.possibleScripts.indexOf(name) === -1) {
            console.warn("onEvent: " + name + " is not a valid event name.");
            return;
        }

        this.addEventFn(name, fn);
    }

    /**
     * Gets all functions attached to an event with a given name.
     * @param {string} - The name of the event
     */
    getEventFns (name) {
        if(!this._onEventFns[name]) {
            this._onEventFns[name] = [];
        }

        return this._onEventFns[name];
    }

    /**
     *
     */
    addEventFn (name, fn) {
        this.getEventFns(name).push(fn);
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
        if(this.hasScript(name)) {
            this.updateScript(name, src);
            return;
        }

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
     * @returns {boolean} True if the script with the given name exists
     */
    hasScript (name) {
        return this.getScript(name) !== undefined;
    }

    /**
     * Check if the object has a non-empty script with a given name.
     * @param {string} name - The name of the event. See Wick.Tickable.possibleScripts
     * @returns {boolean} True if the script with the given name has code
     */
    scriptIsContentful (name) {
        if(!this.hasScript(name)) {
            return false;
        }

        var script = this.getScript(name);
        return script.src.trim() !== '';
    }

    /**
     * Changes the source of the script with the given event name.
     * @param {string} name - The name of the event that will trigger the script. See Wick.Tickable.possibleScripts
     * @param {string} src - The source code of the script.
     */
    updateScript (name, src) {
        this.getScript(name).src = src;
        delete this._cachedScripts[name];
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
     * @returns {object} object containing error info if an error happened. Returns null if there was no error (script ran successfully)
     */
    runScript (name) {
        if(!Wick.Tickable.possibleScripts.indexOf(name) === -1) {
            console.error(name + ' is not a valid script!');
        }

        // Don't run scripts if this object is the focus
        // (this makes it so preview play will always play, even if the parent Clip of the timeline has a stop script)
        if(this.project && this.project.focus === this) {
            return null;
        }

        // Run functions attached using onEvent
        var eventFnError = null;
        this.getEventFns(name).forEach(eventFn => {
            if(eventFnError) return;
            eventFnError = this._runFunction(eventFn);
        });
        if(eventFnError) return eventFnError;

        // Run function inside tab
        if(this.scriptIsContentful(name)) {
            var script = this.getScript(name);
            var fn = this._cachedScripts[name] || this._evalScript(name, script.src);
            if(!(fn instanceof Function)) {
                return fn; // error
            }
            this._cachedScripts[name] = fn;
            var error = this._runFunction(fn);
            if(error) return error;
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
        var error = this.runScript('default');
        if(error) return error;

        error = this.runScript('load');
        return error;
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

    _evalScript (name, src) {
        var fn = null;

        // Check for syntax/parsing errors
        try {
            esprima.parseScript(src);
        } catch (e) {
            return this._generateEsprimaErrorInfo(e, name);
        }

        // Attempt to create valid function...
        try {
            fn = new Function([], src);
            fn = fn.bind(this);
        } catch (e) {
            // This should almost never be thrown unless there is an attempt to use syntax
            // that the syntax checker (esprima) does not understand.
            return this._generateErrorInfo(e, name);
        }

        return fn;
    }

    _runFunction (fn) {
          var error = null;

          // Attach API methods
          var globalAPI = new GlobalAPI(this);
          var otherObjects = this.parentClip ? this.parentClip.activeNamedChildren : [];
          var apiMembers = globalAPI.apiMembers.concat(otherObjects.map(otherObject => {
              return {
                  name: otherObject.identifier,
                  fn: otherObject,
              }
          }));
          apiMembers.forEach(apiMember => {
              window[apiMember.name] = apiMember.fn;
          });

          // Run the function
          try {
              fn.bind(this)();
          } catch (e) {
              // Catch runtime errors
              error = this._generateErrorInfo(e, name);
          }

          // Detatch API methods
          apiMembers.forEach(apiMember => {
              delete window[apiMember.name];
          });

          return error;
    }

    _generateErrorInfo (error, name) {
        if(Wick.Tickable.LOG_ERRORS) console.log(error);
        return {
            name: name !== undefined ? name : '',
            lineNumber: this._generateLineNumberFromStackTrace(error.stack),
            message: error.message,
            uuid: this.uuid,
        }
    }

    _generateEsprimaErrorInfo (error, name) {
        if(Wick.Tickable.LOG_ERRORS) console.log(error);
        return {
            name: name !== undefined ? name : '',
            lineNumber: error.lineNumber,
            message: error.description,
            uuid: this.uuid,
        }
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

    _attachChildClipReferences () {
        // Implemented by Wick.Clip and Wick.Frame.
    }
}
