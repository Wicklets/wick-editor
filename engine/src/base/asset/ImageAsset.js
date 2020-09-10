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

Wick.ImageAsset = class extends Wick.FileAsset {
    /**
     * Valid MIME types for image assets.
     * @returns {string[]} Array of strings representing MIME types in the form image/filetype.
     */
    static getValidMIMETypes () {
        let jpgTypes = ['image/jpeg']
        let pngTypes = ['image/png']
        return jpgTypes.concat(pngTypes);
    }

    /**
     * Valid extensions for image assets.
     * @returns {string[]} Array of strings representing extensions.
     */
    static getValidExtensions () {
        return ['.jpeg', '.jpg', '.png'];
    }

    /**
     * Create a new ImageAsset.
     * @param {object} args - Asset constructor args. see constructor for Wick.Asset
     */
    constructor (args) {
        super(args);

        this.gifAssetUUID = null;
    }

    _serialize (args) {
        var data = super._serialize(args);
        data.gifAssetUUID = this.gifAssetUUID;
        return data;
    }

    _deserialize (data) {
        super._deserialize(data);
        this.gifAssetUUID = data.gifAssetUUID;
    }

    get classname () {
        return 'ImageAsset';
    }

    /**
     * A list of Wick Paths that use this image as their image source.
     * @returns {Wick.Path[]}
     */
    getInstances () {
        var paths = [];
        this.project.getAllFrames().forEach(frame => {
            frame.paths.forEach(path => {
                if(path.getLinkedAssets().indexOf(this) !== -1) {
                    paths.push(path);
                }
            });
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
     * Removes all paths using this asset as their image source from the project.
     * @returns {boolean}
     */
    removeAllInstances () {
        this.getInstances().forEach(path => {
            path.remove();
        });
    }

    /**
     * Load data in the asset
     * @param {function} callback - function to call when the data is done being loaded.
     */
    load (callback) {
        // Try to get paper.js to cache the image src.
        var img = new Image();
        img.src = this.src;
        img.onload = () => {
            var raster = new paper.Raster(img);
            raster.remove();
            callback();
        }

        img.onerror = () => {
            this.project.errorOccured("Error loading image " + this.filename + ". Check that this is loaded properly.");
            callback();
        }
    }

    /**
     * Creates a new Wick Path that uses this asset's image data as it's image source.
     * @param {function} callback - called when the path is done loading.
     */
    createInstance (callback) {
        Wick.Path.createImagePath(this, path => {
            callback(path);
        });
    }

    /**
     * Is this image asset part of a GIF? (if this is set to true, this asset won't appear in the asset library GUI)
     * @type {boolean}
     */
    get isGifImage () {
        return this.gifAssetUUID;
    }
}
