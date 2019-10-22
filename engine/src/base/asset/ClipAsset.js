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

Wick.ClipAsset = class extends Wick.Asset {
    /**
     * Create a new ClipAsset.
     * @param {object} args
     */
    constructor (args) {
        super(args);

        this.data = args.data;
    }

    serialize (args) {
        var data = super.serialize(args);
        return data;
    }

    deserialize (data) {
        super.deserialize(data);
    }

    get classname () {
        return 'ClipAsset';
    }

    /**
     * A list of Wick Clips that use this ClipAsset as their image source.
     * @returns {Wick.Path[]}
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
     * Removes all Clips using this asset as their source from the project.
     * @returns {boolean}
     */
    removeAllInstances () {
        // TODO
    }

    /**
     * Load data in the asset
     */
    load (callback) {
        // We don't need to do anything here, the data for ClipAssets is just json
    }

    /**
     * Creates a new Wick Clip that uses this asset's data.
     * @param {function} callback - called when the Clip is done loading.
     */
    createInstance (callback, project) {
        var clip = Wick.Base.import(this.data, project).copy();
        callback(clip);
    }
}
