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

    constructor (args) {
        super(args);
    }

    serialize (args) {
        var data = super.serialize(args);
        return data;
    }

    deserialize (data) {
        super.deserialize(data);
    }

    get classname () {
        return 'ImageAsset';
    }

    /**
     * Removes all paths using this asset as their image source from the project.
     */
    removeAllInstances () {
        this.project.getAllFrames().forEach(frame => {
            frame.paths.forEach(path => {
                if(path.asset === this.uuid) {
                    path.remove();
                }
            });
        });
    }

    /**
     * Creates a new Wick Path that uses this asset's image data as it's image source.
     * @returns {Wick.Path} - the newly created path.
     */
    createInstance (callback) {
        var path = new Wick.Path({asset:this});
        path.onLoad = () => {
            callback && callback(path);
        }
        return path;
    }
}
