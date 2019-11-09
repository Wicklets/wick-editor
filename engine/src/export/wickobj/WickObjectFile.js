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
     * @param {Blob | string} wickObjectFile - WickObject file containing object data (can be a Blob or a dataURL string)
     * @param {function} callback - Function called when the object is done being loaded
     */
    static fromWickObjectFile (wickObjectFile, callback) {
        // Convert to blob if needed
        if(typeof wickObjectFile === 'string') {
            wickObjectFile = this._dataURItoBlob(wickObjectFile);
        }

        var fr = new FileReader();

        fr.onload = () => {
            var data = JSON.parse(fr.result);
            callback(data);
        };

        fr.readAsText(wickObjectFile);
    }

    /**
     * Create a wick file from the project.
     * @param {Wick.Project} clip - the clip to create a wickobject file from
     * @param {string} format - Can be 'blob' or 'dataurl'.
     */
    static toWickObjectFile (clip, format, callback) {
        if(!format) format = 'blob';

        var data = clip.export();
        var json = JSON.stringify(data);
        var blob = new Blob([json], {type: "application/json"});

        if(format === 'blob') {
            callback(blob);
        } else if (format === 'dataurl') {
            var fr = new FileReader();
            fr.onload = function(e) {
                callback(e.target.result);
            };
            fr.readAsDataURL(blob);
        } else {
            console.error('toWickObjectFile: invalid format: ' + format);
        }
    }

    // https://stackoverflow.com/questions/12168909/blob-from-dataurl
    static _dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = atob(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);

        // create a view into the buffer
        var ia = new Uint8Array(ab);

        // set the bytes of the buffer to the correct values
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        var blob = new Blob([ab], {type: mimeString});
        return blob;
    }
}
