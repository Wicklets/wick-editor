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
 * History utility class for undo/redo functionality.
 */
Wick.History = class {
    /**
     *
     * @type {boolean}
     */
    static get VERBOSE () {
        return false;
    }

    /**
     * An Enum of all types of state saves.
     */
    static get StateType () {
        return {
            ALL_OBJECTS: 1,
            ALL_OBJECTS_WITHOUT_PATHS: 2,
            ONLY_VISIBLE_OBJECTS: 3,
        };
    }

    /**
     * Creates a new history object
     */
    constructor () {
        this._undoStack = [];
        this._redoStack = [];
        this._snapshots = {};
    }

    /**
     * Push the current state of the ObjectCache to the undo stack.
     * @param {number} filter - the filter to choose which objects to serialize. See Wick.History.StateType
     * @param {string} actionName - Optional: Name of the action conducted to generate this state. If no name is presented, "Unknown Action" is presented in its place.
     */
    pushState (filter, actionName) {
        this._redoStack = [];

        let stateObject = {
            state: this._generateState(filter), 
            actionName: actionName || "Unknown Action",
        }

        this._undoStack.push(stateObject);
    }

    /**
     * Pop the last state in the undo stack off and apply the new last state to the project.
     * @returns {boolean} True if the undo stack is non-empty, false otherwise
     */
    popState () {
        if(this._undoStack.length <= 1) {
            return false;
        }

        var lastState = this._undoStack.pop();
        this._redoStack.push(lastState);

        var currentStateObject = this._undoStack[this._undoStack.length - 1];

        // 1.17.1 History update, pull actual state information out, aside from names.
        var currentState = currentStateObject; 

        if (currentStateObject.state) {
            currentState = currentStateObject.state;
        }

        this._recoverState(currentState);

        return true;
    }

    /**
     * Recover a state that was undone.
     * @returns {boolean} True if the redo stack is non-empty, false otherwise
     */
    recoverState () {
        if(this._redoStack.length === 0) {
            return false;
        }

        var recoveredState = this._redoStack.pop().state;
        this._undoStack.push(recoveredState);

        this._recoverState(recoveredState);

        return true;
    }

    /**
     *
     * @param {string} name - the name of the snapshot
     * @param {number} filter - the filter to choose which objects to serialize. See Wick.History.StateType
     */
    saveSnapshot (name, filter) {
        this._snapshots[name] = this._generateState(filter || Wick.History.StateType.ALL_OBJECTS_WITHOUT_PATHS);
    }

    /**
     * Save a state to the list of snapshots to be recovered at any time.
     * @param {string} name - the name of the snapshot to recover
     */
    loadSnapshot (name) {
        this._recoverState(this._snapshots[name]);
    }

    /**
     * The number of states currently stored for undoing.
     * @type {number}
     */
    get numUndoStates () {
        return this._undoStack.length;
    }

    /**
     * The number of states currently stored for redoing.
     * @type {number}
     */
    get numRedoStates () {
        return this._redoStack.length;
    }

    // NOTE: State saving/recovery can be greatly optimized by only saving the state of the things that were actually changed.
    _generateState (stateType) {
        var objects = [];

        if(stateType === undefined) {
            stateType = Wick.History.StateType.ALL_OBJECTS;
        }

        if(stateType === Wick.History.StateType.ALL_OBJECTS) {
            objects = this._getAllObjects();
        } else if (stateType === Wick.History.StateType.ALL_OBJECTS_WITHOUT_PATHS) {
            objects = this._getAllObjectsWithoutPaths();
        } else if(stateType === Wick.History.StateType.ONLY_VISIBLE_OBJECTS) {
            objects = this._getVisibleObjects();
        } else {
            console.error('Wick.History._generateState: A valid stateType is required.');
            return;
        }

        if(Wick.History.VERBOSE) {
            console.log('Wick.History._generateState: Serializing ' + objects.length + ' objects using mode=' + stateType);
        }

        return objects.map(object => {
            // The object most likely was altered in some way, make sure those changes will be reflected in the autosave.
            object.needsAutosave = true;

            return object.serialize();
        });
    }

    _recoverState (state) {
        state.forEach(objectData => {
            var object = Wick.ObjectCache.getObjectByUUID(objectData.uuid);
            object.deserialize(objectData);
        });
    }

    _getAllObjects () {
        var objects = Wick.ObjectCache.getActiveObjects(this.project);
        objects.push(this.project);
        return objects;
    }

    // this is used for an optimization when snapshots are saved for preview playing.
    _getAllObjectsWithoutPaths () {
        return this._getAllObjects().filter(object => {
            return !(object instanceof Wick.Path);
        });
    }

    _getVisibleObjects () {
        var stateObjects = [];

        // the project itself (for focus, options, etc)
        stateObjects.push(this.project);

        // the assets in the project
        this.project.getAssets().forEach(asset => {
            stateObjects.push(asset);
        });

        // the focused clip
        stateObjects.push(this.project.focus);

        // the focused timeline
        stateObjects.push(this.project.focus.timeline);

        // the selection
        stateObjects.push(this.project.selection);

        // layers on focused timeline
        this.project.activeTimeline.layers.forEach(layer => {
            stateObjects.push(layer);
        });

        // frames on focused timeline
        this.project.activeTimeline.frames.forEach(frame => {
            stateObjects.push(frame);
        });

        // objects+tweens on active frames
        this.project.activeFrames.forEach(frame => {
            frame.paths.forEach(path => {
                stateObjects.push(path);
            });
            frame.clips.forEach(clip => {
                stateObjects.push(clip);
            });
            frame.tweens.forEach(tween => {
                stateObjects.push(tween);
            })
        });

        return stateObjects;
    }
}
