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
 * A clipboard utility class for copy/paste functionality.
 */
Wick.Clipboard = class {
    /**
     * Create a new Clipboard object.
     */
    constructor () {
        this._objects = [];
    }

    /**
     * Replace the current contents of the clipboard with new objects.
     * @param {Wick.Base[]} objects - the objects to copy to the clipboard
     */
    copyObjectsToClipboard (objects) {
        this._objects = objects.map(object => {
            return object.clone();
        });
    }

    /**
     * Paste the content of the clipboard into the project.
     * @param {Wick.Project} project - the project to paste objects into.
     * @returns {boolean} True if there is something to paste in the clipboard, false if the clipboard is empty.
     */
    pasteObjectsFromClipboard (project) {
        if(this._objects.length === 0) {
            return false;
        }

        project.selection.clear();

        this._objects.map(object => {
            return object.clone();
        }).forEach(object => {
            project.addObject(object);
            project.selection.select(object);
        });

        return true;
    }
}
