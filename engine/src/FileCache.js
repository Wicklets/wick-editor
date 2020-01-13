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
 * Global utility class for storing and retrieving large file data.
 */
WickFileCache = class {
    /**
     * A prefix to use in localforage so we can identify which items in localforage are files.
     * @type {string}
     */
    static get FILE_LOCALFORAGE_KEY_PREFIX () {
        return 'filesrc_'; // This should never change.
    }

    /**
     * Create a WickFileCache.
     */
    constructor () {
        this._files = {};
    }

    /**
     * Add a file to the cache.
     * @param {string} src - The file source
     * @param {string} uuid - The UUID of the file
     */
    addFile (src, uuid) {
        this._files[uuid] = {
            src: src
        };

        // Save asset to localforage
        localforage.setItem(Wick.FileCache.getLocalForageKeyForUUID(uuid), src).then(() => {});
    }

    /**
     * Get info for a file by its UUID.
     * @param {string} uuid - The UUID of the file
     * @returns {object} The file info
     */
    getFile (uuid) {
        var file = this._files[uuid];
        if(!file) {
            console.error('Asset with UUID ' + uuid + ' was not found in FileCache!');
            return null;
        } else {
            return file;
        }
    }

    /**
     * Removes a file from the FileCache with a given UUID.
     * @param {string} uuid - the UUID of the file to remove.
     */
    removeFile (uuid) {
        delete this._files[uuid];

        // Remove file from localforage
        localforage.removeItem(Wick.FileCache.getLocalForageKeyForUUID(uuid), src).then(() => {});
    }

    /**
     * Loads all files from local forage associated with a previously saved project, if possible.
     * @param {Wick.Project} project - the project that we want to load assets for.
     * @param {function} callback - called when the assets are done being loaded.
     */
    loadFilesFromLocalforage (uuids, callback) {
        project.getAssets().forEach(asset => {
            localforage.getItem(Wick.FileCache.getLocalForageKeyForUUID(uuid)).then(result => {
                this.addFile(uuid, result);
            });
        });

        Promise.all(project.getAssets().map(asset => {
            return localforage.getItem(asset.uuid);
        })).then(function(values) {
            values.forEach(val => {
                this.addFile(uuid, val);
            });
            callback();
        });
    }

    /**
     * On object containing all files in WickFileCache.
     * @returns {object} All the files in an object with the format:
     */
    getAllFiles () {
        var files = [];
        for (var uuid in this._files) {
            files.push({
                uuid: uuid,
                src: this._files[uuid].src,
            });
        }
        return files;
    }

    /**
     * Clear the cache.
     */
    clear () {
        // Clear all files from localforage
        for(var uuid in this._files) {
            localforage.removeItem(Wick.FileCache.getLocalForageKeyForUUID(uuid), src).then(() => {});
        }

        this._files = {};
    }

    static getLocalForageKeyForUUID (uuid) {
        return this.FILE_LOCALFORAGE_KEY_PREFIX + uuid;
    }
}

Wick.FileCache = new WickFileCache();
