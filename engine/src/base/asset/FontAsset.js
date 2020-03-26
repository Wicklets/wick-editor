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

Wick.FontAsset = class extends Wick.FileAsset {
    /**
     * Valid MIME types for font assets.
     * @returns {string[]} Array of strings representing MIME types in the form font/filetype.
     */
    static getValidMIMETypes () {
        return ['font/ttf', 'application/x-font-ttf', 'application/x-font-truetype'];
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
     */
    constructor (args) {
        super(args);
    }

    _serialize (args) {
        var data = super._serialize(args);
        return data;
    }

    _deserialize (data) {
        super._deserialize(data);
    }

    get classname () {
        return 'FontAsset';
    }

    /**
     * Loads the font into the window.
     */
    load (callback) {
        var fontDataArraybuffer = Base64ArrayBuffer.decode(this.src.split(',')[1]);
        var fontFamily = this.fontFamily;
        if (!fontFamily) {
            console.error('FontAsset: Could not get fontFamily from filename.');
        } else if (fontFamily === "") {
            console.error('FontAsset: fontfamily not found. Showing as "".')
        }
            var font = new FontFace(fontFamily, fontDataArraybuffer);
    		font.load().then(loaded_face => {
    		    document.fonts.add(loaded_face);
                callback();
    		}).catch(error => {
                console.error('FontAsset.load(): An error occured while loading a font:');
                console.log(font);
                console.error(error);
                callback(); // Make the callback so that the page doesn't freeze.
    		});
    }

    /**
     * A list of Wick Paths that use this font as their fontFamily.
     * @returns {Wick.Path[]}
     */
    getInstances () {
        var paths = [];
        this.project.getAllFrames().forEach(frame => {
            frame.paths.forEach(path => {
                if(path.fontFamily === this.fontFamily) {
                    paths.push(path);
                }
            })
        });
        return paths;
    }

    /**
     * Check if there are any objects in the project that use this asset.
     * @returns {boolean}
     */
    hasInstances () {
        return this.getInstances().length > 0;
    }

    /**
     * Finds all PointText paths using this font as their fontFamily and replaces that font with a default font.
     */
    removeAllInstances () {
        this.getInstances().forEach(path => {
            path.fontFamily = Wick.FontAsset.MISSING_FONT_DEFAULT;
        })
    }

    /**
     *
     * @type {string}
     */
    get fontFamily () {
        return this.filename.split('.')[0];
    }
}
