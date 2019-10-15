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
        this._copyLocation = null;
        this._copyLayerIndex = 0;
    }

    /**
     * The data of copied objects, stored as JSON.
     * @type {Object}
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

        // Keep track of the topmost layer of the selection (we use this later to position frames)
        this._copyLayerIndex = objects.filter(object => {
            return object instanceof Wick.Frame;
        }).map(frame => {
            return frame.parentLayer.index;
        }).reduce((a,b) => {
            return Math.min(a,b);
        });

        // Make deep copies of every object
        var exportedData = objects.map(object => {
            return object.export();
        });

        // Shift frames so that they copy from the relative position of the first frame
        var startPlayheadPosition = Number.MAX_SAFE_INTEGER;
        exportedData.forEach(data => {
            if(data.object.classname !== 'Frame') return;
            if(data.object.start < startPlayheadPosition) {
                startPlayheadPosition = data.object.start;
            }
        });
        exportedData.forEach(data => {
            if(data.object.classname !== 'Frame') return;
            data.object.start -= startPlayheadPosition - 1;
            data.object.end -= startPlayheadPosition - 1;
        });

        // Set the new clipboard data
        this.clipboardData = exportedData;
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

        // Use this value later to position frames on the corrent pasted layer
        var layerIndicesMoved = project.activeLayer.index - this._copyLayerIndex;

        project.selection.clear();

        this.clipboardData.map(data => {
            return Wick.Base.import(data, project).copy();
        }).forEach(object => {
            // Paste frames at the position of the playhead
            if(object instanceof Wick.Frame) {
                object._originalLayerIndex += layerIndicesMoved;
                object.start += project.focus.timeline.playheadPosition - 1;
                object.end += project.focus.timeline.playheadPosition - 1;
            }

            project.addObject(object);
            object.identifier = object._getUniqueIdentifier(object.identifier);

            // Add offset to Paths and Clips if pasteInPlace is NOT enabled.
            if(!pasteInPlace && (object instanceof Wick.Path || object instanceof Wick.Clip)) {
                object.view.render();//This render call updates the json, I think... so without this call the path loses its data somehow :(
                object.x += Wick.Clipboard.PASTE_OFFSET;
                object.y += Wick.Clipboard.PASTE_OFFSET;
            }

            project.selection.select(object);
        });

        return true;
    }
}
