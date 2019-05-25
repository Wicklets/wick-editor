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

Wick.FontAsset = class extends Wick.FileAsset {
    /**
     * Valid MIME types for font assets.
     * @returns {string[]} Array of strings representing MIME types in the form font/filetype.
     */
    static getValidMIMETypes () {
        return ['font/ttf'];
    }

    /**
     * Valid extensions for font assets.
     * @returns {string[]} Array of strings representing extensions.
     */
    static getValidExtensions () {
        return ['.ttf'];
    }

    /**
     * The default font to use if a font couldn't load, or if a FontAsset was deleted
     */
    static get MISSING_FONT_DEFAULT () {
        return 'Helvetica, Arial, sans-serif';
    }

    /**
     * Create a new FontAsset.
     * @param {string} fontFamily - the name of the font
     */
    constructor (args) {
        super(args);

        this.fontFamily = args.fontFamily;
    }

    serialize (args) {
        var data = super.serialize(args);
        data.fontFamily = this.fontFamily;
        return data;
    }

    deserialize (data) {
        super.deserialize(data);
        this.fontFamily = data.fontFamily;
    }

    get classname () {
        return 'FontAsset';
    }

    /**
     * Loads the font into the window.
     */
    load (src) {
        super.load(src);

        var fontDataArraybuffer = this._base64ToArrayBuffer(this.src.split(';')[1]);

    		var font = new FontFace('ABeeZee', fontDataArraybuffer);
    		font.load().then(loaded_face => {
    		    document.fonts.add(loaded_face);
    		    //document.body.style.fontFamily = '"ABeeZee", Arial';
            this._onLoadCallback && this._onLoadCallback();
    		}).catch(error => {
            console.error('FontAsset.load(): An error occured while loading a font.');
            console.error(error);
    		});
    }

    /**
     * Check if there are any objects in the project that use this asset.
     * @returns {boolean}
     */
    hasInstances () {
        // TODO
    }

    /**
     * Finds all PointText paths using this font as their fontFamily and replaces that font with a default font.
     */
    removeAllInstances () {
        // TODO
    }

    // https://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer/21797381
    _base64ToArrayBuffer (base64) {
        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
