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
 * Utility class for creating and parsing wickobject files.
 */
Wick.WickObjectFile = class {
    /**
     * Create a project from a wick file.
     * @param {File} wickObjectFile - WickObject file containing object data
     * @param {function} callback - Function called when the object is done being loaded
     */
    static fromWickObjectFile (wickObjectFile, callback) {
        
    }

    /**
     * Create a wick file from the project.
     * @param {Wick.Project} clip - the clip to create a wickobject file from
     * @param {function} callback - Function called when the file is created
     */
    static toWickObjectFile (clip, callback) {
        var data = clip.export();
        var json = JSON.stringify(data);
        var blob = new Blob([json], {type: "application/json"});
        callback(blob);
    }
}
