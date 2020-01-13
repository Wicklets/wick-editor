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
        this._files = {};
    }
}

Wick.FileCache = new WickFileCache();
