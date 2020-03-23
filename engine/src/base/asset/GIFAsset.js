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

Wick.GIFAsset = class extends Wick.ClipAsset {
    /**
     * Returns all valid MIME types for files which can be converted to GIFAssets.
     * @return {string[]} Array of strings of MIME types in the form MediaType/Subtype.
     */
    static getValidMIMETypes () {
        return ['image/gif'];
    }

    /**
     * Returns all valid extensions types for files which can be attempted to be
     * converted to GIFAssets.
     * @return  {string[]} Array of strings representing extensions.
     */
    static getValidExtensions () {
        return ['.gif']
    }

    /**
     * Create a new GIFAsset from a series of images.
     * @param {Wick.ImageAsset} images -
     * @param {function} callback -
     */
    static fromImages (images, project, callback) {
        var clip = new Wick.Clip();
        clip.activeFrame.remove();

        var imagesCreatedCount = 0;
        var processNextImage = () => {
            images[imagesCreatedCount].createInstance(imagePath => {
                // Create a frame for every image
                var frame = new Wick.Frame({start: imagesCreatedCount+1});
                frame.addPath(imagePath);
                clip.activeLayer.addFrame(frame);

                // Check if all images have been created
                imagesCreatedCount++;
                if(imagesCreatedCount === images.length) {
                    Wick.ClipAsset.fromClip(clip, project, clipAsset => {
                        // Attach a reference to the resulting clip to all images
                        images.forEach(image => {
                            image.gifAssetUUID = clip.uuid;
                        });

                        clip.remove();
                        callback(clipAsset);
                    });
                } else {
                    processNextImage();
                }
            });
        }

        processNextImage();
    }

    /**
     * Create a new GIFAsset.
     * @param {object} args
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
        return 'GIFAsset';
    }

    /**
     * A list of objects that use this asset as their source.
     * @returns {Wick.Clip[]}
     */
    getInstances () {
        return []; // TODO
    }

    /**
     * Check if there are any objects in the project that use this asset.
     * @returns {boolean}
     */
    hasInstances () {
        return false; // TODO
    }

    /**
     * Removes all objects using this asset as their source from the project.
     * @returns {boolean}
     */
    removeAllInstances () {
        // TODO
    }

    /**
     * Load data in the asset
     */
    load (callback) {
        // We don't need to do anything here, the data for ClipAssets/GIFAssets is just json
        callback();
    }
}
