/*
 * Copyright 2020 WICKLETS LLC
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
        this._isClickTarget = false;

        this._scripts = [];

        this.cursor = 'default';

        this.addScript('default', '');

        this._onEventFns = {};
        this._cachedScripts = {};
    }

    _deserialize (data) {
        super._deserialize(data);

        this._onscreen = false;
        this._onscreenLastTick = false;

        this._mouseState = 'out';
        this._lastMouseState = 'out';

        this._scripts = JSON.parse(JSON.stringify(data.scripts));
        this.cursor = data.cursor;

        this._onEventFns = {};
        this._cachedScripts = {};

    }

    _serialize (args) {
        var data = super._serialize(args);

        data.scripts = JSON.parse(JSON.stringify(this._scripts));
        data.cursor = this.cursor;

        return data;
    }

    get classname () {
        return 'Tickable';
    }

    /**
     * The scripts on this object.
     * @type {object[]}
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

        for (var script of this.scripts) {
            if (this.scriptIsContentful(script.name)) {
                hasContentfulScripts = true;
            }
        }

        return hasContentfulScripts;
    }

    /**
     * Check if this object is currently visible in the project, based on its parent.
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
     * Attach a function to a given event.
     * @param {string} name - the name of the event to attach a function to.
     * @param {function} fn - the function to attach
     */
    addEventFn (name, fn) {
        this.getEventFns(name).push(fn);
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
        if (Wick.Tickable.possibleScripts.indexOf(name) === -1) {
            console.error(name + ' is not a valid script!');
            return null;
        } else {
            // Get expected script.
            let script = this._scripts.find(script => {
                return script.name === name;
            });

            if (!script) {
                // Create the script if it doesn't exist.
                script = {
                    name: name,
                    src: "",
                }

                return script;
            } 
            
            // If the script is missing, add an empty.
            if (!script.src) {
                script.src = "";
            }

            return script;
        }   
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
        let script = this.scripts.find(script => (script.name === name));

        if (script) {
            return true;
        } 

        return false;
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
        
        if (script && script.src.trim() !== '') {
            return true;
        } 

        return false;
    }

    /**
     * Changes the source of the script with the given event name.
     * @param {string} name - The name of the event that will trigger the script. See Wick.Tickable.possibleScripts
     * @param {string} src - The source code of the script.
     */
    updateScript (name, src) {
        if (!src) src = ""; // Reset script if it is not defined.
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
     * Schedule a script to run at the end of the tick.
     * @param {string} name - The name of the script to run. See Tickable.possibleScripts
     * @param {Object} parameters - An object consisting of key,value pairs which correspond to parameters to pass to the script.
     */
    scheduleScript (name, parameters) {
        if(!this.project) return;

        this.project.scheduleScript(this.uuid, name, parameters);
    }

    /**
     * Run the script with the corresponding event name. Will not run the script if the object is marked as removed.
     * @param {string} name - The name of the event. See Wick.Tickable.possibleScripts
     * @param {Object} parameters - An object containing key,value pairs of parameters to send to the script.
     * @returns {object} object containing error info if an error happened. Returns null if there was no error (script ran successfully)
     */
    runScript (name, parameters) {
        if (this.removed) {
            return;
        }

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
            eventFnError = this._runFunction(eventFn, name, parameters);
        });

        if (eventFnError) {
            this.project.error = eventFnError;
            return;
        }


        // Run function inside tab
        if(this.scriptIsContentful(name)) {
            var script = this.getScript(name);
            var fn = this._cachedScripts[name] || this._evalScript(name, script.src);
            if(!(fn instanceof Function)) {
                return fn; // error
            }

            this._cachedScripts[name] = fn;
            var error = this._runFunction(fn, name, parameters);

            if (error && this.project) {
                this.project.error = error;
                return;
            }
        }
    }

    /**
     * The tick routine to be called when the object ticks.
     * @returns {object} - An object with information about the result from ticking. Null if no errors occured, and the script ran successfully.
     */
    tick () {
        // Update named child references
        this._attachChildClipReferences();

        // Update onScreen flags.
        this._onscreenLastTick = this._onscreen;
        this._onscreen = this.onScreen;

        // Update mouse states.
        this._lastMouseState = this._mouseState;
        if(this.project && this.project.objectIsMouseTarget(this)) {
            if(this.project.isMouseDown) {
                this._mouseState = 'down';
            } else {
                this._mouseState = 'over';
            }
        } else {
            this._mouseState = 'out';
        }

        // Call tick event function that corresponds to state.
        if(!this._onscreen && !this._onscreenLastTick) {
            this._onInactive();
        } else if (this._onscreen && !this._onscreenLastTick) {
            this._onActivated();
        } else if (this._onscreen && this._onscreenLastTick) {
            this._onActive();
        } else if (!this._onscreen && this._onscreenLastTick) {
            this._onDeactivated();
        }
    }

    _onInactive () {
        // Do nothing.
    }

    _onActivated () {
        this.runScript('default'); // Run the script immediately.
        this.scheduleScript('load');
    }

    _onActive () {
        this.scheduleScript('update');

        var current = this._mouseState;
        var last = this._lastMouseState;

        // Mouse enter
        if(last === 'out' && current !== 'out') {
            this.scheduleScript('mouseenter');
        }

        // Mouse down
        if(current === 'down') {
            this.scheduleScript('mousedown');
        }

        // Mouse pressed
        if(last === 'over' && current === 'down') {
            this._isClickTarget = true;
            this.scheduleScript('mousepressed');
        }

        // Mouse click
        if(last === 'down' && current === 'over' && this._isClickTarget) {
            this.scheduleScript('mouseclick');
        }

        // Mouse released
        if(last === 'down' && current === 'over') {
            this._isClickTarget = false;
            this.scheduleScript('mousereleased');
        }

        // Mouse leave
        if(last !== 'out' && current === 'out') {
            this.scheduleScript('mouseleave');
        }

        // Mouse hover
        if(current === 'over') {
            this.scheduleScript('mousehover');
        }

        // Mouse drag
        if(last === 'down' && current === 'down') {
            this.scheduleScript('mousedrag');
        }

        // Key down
        this.project.keysDown.forEach(key => {
            this.project.currentKey = key;
            this.scheduleScript('keydown', {key: key});
        });

        // Key press
        this.project.keysJustPressed.forEach(key => {
            this.project.currentKey = key;
            this.scheduleScript('keypressed', {key: key});
        });

        // Key released
        this.project.keysJustReleased.forEach(key => {
            this.project.currentKey = key;
            this.scheduleScript('keyreleased', {key: key});
        });
    }

    _onDeactivated () {
        this._isClickTarget = false;
        this.scheduleScript('unload');
    }

    _evalScript (name, src) {
        var fn = null;

        // Check for syntax/parsing errors
        try {
            esprima.parseScript(src);
        } catch (e) {
            this.project.error = this._generateEsprimaErrorInfo(e, name);
            return;
        }

        // Attempt to create valid function...
        try {
            fn = new Function([], src);
        } catch (e) {
            // This should almost never be thrown unless there is an attempt to use syntax
            // that the syntax checker (esprima) does not understand.
            this.project.error = this._generateErrorInfo(e, name);
            return;
        }

        return fn;
    }

    /**
     * _runFunction runs an event function while passing in necessary global and local parameters.
     * @param {string} fn - Function to run.
     * @param {string} name - Name of the event function being run (i.e. keyDown)
     * @param {Object} parameters - An object of key,value pairs to be passed as parameters to the function.
     */
    _runFunction (fn, name, parameters) {
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

          // Add in parameters, if necessary.
          if (parameters) {
            Object.keys(parameters).forEach(parameter => {
                apiMembers.push({
                    name: parameter,
                    fn: parameters[parameter],
                })
            });
          }

          apiMembers.forEach(apiMember => {
              window[apiMember.name] = apiMember.fn;
          });

          // These are currently hacked in here for performance reasons...
          var project = this.project;
          var root = project && project.root;
          window.project = root;
          if(project) {
              window.project.resolution = {x: project.width, y: project.height};
              window.project.framerate = project.framerate;
              window.project.backgroundColor = project.backgroundColor;
              //window.project.hitTestOptions = project.hitTestOptions;
          }
          window.root = root;
          window.parent = this.parentClip;
          window.parentObject = this.parentObject;

          // Run the function
          var thisScope = this instanceof Wick.Frame ? this.parentClip : this;
          try {
              fn.bind(thisScope)();
          } catch (e) {
              // Catch runtime errors
              console.error(e);
              error = this._generateErrorInfo(e, name);
          }

          // These are currently hacked in here for performance reasons...
          delete window.project;
          delete window.root;
          delete window.parent;
          delete window.parentObject;

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
            uuid: this.isClone ? this.sourceClipUUID : this.uuid,
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
                lineNumber = lineInt - 2;
                lineNumber = lineInt;
                lineNumber = lineNumber - 2;
            }
        });

        return lineNumber;
    }

    _attachChildClipReferences () {
        // Implemented by Wick.Clip and Wick.Frame.
    }
}
