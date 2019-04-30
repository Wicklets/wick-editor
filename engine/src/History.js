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

/**
 * History utility class for undo/redo functionality.
 */
Wick.History = class {
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
     */
    pushState (filter) {
        this._undoStack.push(this._generateState(filter));
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

        var currentState = this._undoStack[this._undoStack.length - 1];
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

        var recoveredState = this._redoStack.pop();
        this._undoStack.push(recoveredState);

        this._recoverState(recoveredState);

        return true;
    }


    /**
     *
     * @param {string} name - the name of the snapshot
     */
    saveSnapshot (name, filter) {
        this._snapshots[name] = this._generateState(filter);
    }

    /**
     *
     * @param {string} name - the name of the snapshot to recover
     */
    loadSnapshot (name) {
        this._recoverState(this._snapshots[name]);
    }

    _generateState (filter) {
        return Wick.ObjectCache.getAllObjects().map(object => {
            return object.serialize();
        })
    }

    _recoverState (state) {
        state.forEach(objectData => {
            var object = Wick.ObjectCache.getObjectByUUID(objectData.uuid);
            object.deserialize(objectData);
        });
    }
}
