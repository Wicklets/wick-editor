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
 * A clipboard utility class for copy/paste functionality.
 */
Wick.Clipboard = class {
    static get LOCALSTORAGE_KEY () {
        return 'wick_engine_clipboard';
    }

    static get PASTE_OFFSET () {
        // how many pixels should we shift objects over when we paste (canvas only)
        return 20;
    }

    /**
     * Create a new Clipboard object.
     */
    constructor () {

    }

    /**
     *
     */
    get clipboardData () {
        var json = localStorage[Wick.Clipboard.LOCALSTORAGE_KEY];
        if(!json) return null;
        return JSON.parse(json);
    }

    set clipboardData (clipboardData) {
        localStorage[Wick.Clipboard.LOCALSTORAGE_KEY] = JSON.stringify(clipboardData);
    }

    /**
     * Replace the current contents of the clipboard with new objects.
     * @param {Wick.Base[]} objects - the objects to copy to the clipboard
     */
    copyObjectsToClipboard (project, objects) {
        if(!project || (!project instanceof Wick.Project)) console.error('copyObjectsToClipboard(): project is required');

        // Get the playhead position of the "first" frame in the list of objects
        var playheadCopyOffset = null;
        objects.filter(object => {
            return object instanceof Wick.Frame;
        }).forEach(frame => {
            if(playheadCopyOffset === null || frame.start < playheadCopyOffset) {
                playheadCopyOffset = frame.start;
            }
        });

        // Keep track of where objects were originally copied from
        this._copyLocation = project.activeFrame && project.activeFrame.uuid;

        // Prepare objects for
        var objects = objects.map(object => {
            var copy = object.copy();

            // Copy frame positions relative to the current playhead position
            if(copy instanceof Wick.Frame) {
                copy.start -= playheadCopyOffset - 1;
                copy.end -= playheadCopyOffset - 1;
            }

            return copy;
        });

        this.clipboardData = objects.map(object => {
            return object.export();
        });
    }

    /**
     * Paste the content of the clipboard into the project.
     * @param {Wick.Project} project - the project to paste objects into.
     * @returns {boolean} True if there is something to paste in the clipboard, false if the clipboard is empty.
     */
    pasteObjectsFromClipboard (project) {
        if(!project || (!project instanceof Wick.Project)) console.error('pasteObjectsFromClipboard(): project is required');

        if(!this.clipboardData) {
            return false;
        }

        // Always paste in-place if we're pasting to a different frame than where we copied from.
        var pasteInPlace = project.activeFrame && this._copyLocation !== project.activeFrame.uuid;

        project.selection.clear();

        this.clipboardData.map(data => {
            return Wick.Base.import(data);
        }).forEach(object => {
            // Paste frames at the position of the playhead
            if(object instanceof Wick.Frame) {
                object.start += project.focus.timeline.playheadPosition - 1;
                object.end += project.focus.timeline.playheadPosition - 1;
            }

            project.addObject(object);

            // Add offset to Paths and Clips if pasteInPlace is NOT enabled.
            if(!pasteInPlace && (object instanceof Wick.Path || object instanceof Wick.Clip)) {
                object.x += Wick.Clipboard.PASTE_OFFSET;
                object.y += Wick.Clipboard.PASTE_OFFSET;
            }

            project.selection.select(object);
        });

        return true;
    }
}
