/*
 * Copyright 2018 WICKLETS LLC
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
 * Represents a Wick Path.
 */
Wick.Path = class extends Wick.Base {
    /**
     * Create a Wick Layer.
     * @param {object} pathData - Data for the path, see paper.js exportAsJSON for format info.
     * @param {Wick.Asset[]} assets - Assets to load image source from (for rasters).
     */
    constructor (pathData) {
        super();

        this._assetUUID = null;

        // If no path data is given, create an empty paper path, otherwise import the path data
        if(!pathData) {
            this._paperPath = new paper.Path({insert:false});
        } else {
            this.importJSON(pathData);
        }

        // Check if we need to recover the UUID from the paper path
        if(this._paperPath.data.wickUUID) {
            this._uuid = this._paperPath.data.wickUUID;
        } else {
            this._paperPath.data.wickUUID = this.uuid;
            this._paperPath.data.wickType = 'path';
        }

        this._loaded = false;
        this._paperPath.onLoad = () => {
            this._loaded = true;
        }

        this._cachedJSONExport = null;
    }

    static _deserialize (data, object) {
        super._deserialize(data, object);
        object.importJSON(data.pathJSON);
        return object;
    }

    serialize () {
        var data = super.serialize();
        data.pathJSON = this._getCachedJSONExport();
        return data;
    }

    get classname () {
        return 'Path';
    }

    /**
     * The paper.js representation of this path.
     * @type {paper.Path}
     */
    get paperPath () {
        return this._paperPath;
    }

    /**
     * The bounding box of this path.
     */
    get bounds () {
        return this.paperPath.bounds;
    }

    /**
     * Remove this path from its parent frame.
     */
    remove () {
        this.parent.removePath(this);
    }

    /**
     * Import paper.js path data into this Wick Path, replacing the current path data.
     * @param {object} pathData - Data for the path, see paper.js exportAsJSON for format info.
     */
    importJSON (json) {
        if(json[0] === "Raster") {
            this._assetUUID = json[1].asset;
            var src = Wick.FileCache.getFile(this._assetUUID).src;
            json[1].source = src;
        }

        this._paperPath = paper.importJSON(json);
        this._paperPath.onLoad = () => {
            this._loaded = true;
        }
    }

    /**
     * Export the Wick Path as paper.js Path json data.
     */
    exportJSON () {
        var json = this._paperPath.exportJSON({asString:false});

        if(json[0] === "Raster") {
            json[1].asset = this._assetUUID;
            json[1].source = 'asset';
        }

        return json;
    }

    _getCachedJSONExport () {
        /*
        if(this.project && this.project.serializeOnScreenObjectsOnly) {
            if(this.parentFrame.onScreen) {
                var json = this.exportJSON();
                this._cachedJSONExport = json;
                return json;
            } else {
                if(this._cachedJSONExport === null) this._cachedJSONExport = this.exportJSON();
                return this._cachedJSONExport;
            }
        } else {
            return this.exportJSON();
        }
        */
        if(!this.parentFrame || this.parentFrame.onScreen) {
            var json = this.exportJSON();
            this._cachedJSONExport = json;
            return json;
        } else {
            if(this._cachedJSONExport === null) this._cachedJSONExport = this.exportJSON();
            return this._cachedJSONExport;
        }
    }
}
