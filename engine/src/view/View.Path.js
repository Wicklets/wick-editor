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

Wick.View.Path = class extends Wick.View {
    /**
     * Create a frame view.
     */
    constructor () {
        super();

        this._item = null;
    }

    /**
     * The paper.js representation of the Wick Path.
     */
    get item () {
        if(!this._item) {
            this.render();
        }
        return this._item;
    }

    /**
     *
     */
    render () {
        if(!this.model.json) {
            console.warn('Path ' + this.model.uuid + ' is missing path JSON.');
        }
        this.importJSON(this.model.json);
    }

    /**
     * Import paper.js path data into this Wick Path, replacing the current path data.
     * @param {object} json - Data for the path created with paper.js exportJSON({asString:false})
     */
    importJSON (json) {
        // Prepare image asset data
        if(json[0] === "Raster") {
            this._assetUUID = json[1].asset;
            var src = Wick.FileCache.getFile(this._assetUUID).src;
            json[1].source = src;
        }

        // Import JSON data into paper.js
        this._item = this.paper.importJSON(json);
        this._item.remove();

        // Check if we need to recover the UUID from the paper path
        if(this._item.data.wickUUID) {
            this.model._uuid = this._item.data.wickUUID;
        } else {
            this._item.data.wickUUID = this.model.uuid;
            this._item.data.wickType = 'path';
        }

        // Listen for when the path is fully loaded
        this._item.onLoad = (e) => {
            if(this.model._onLoad) {
                this.model._onLoad(e);
            }
        }
    }

    /**
     * Export the path as paper.js Path json data.
     */
    exportJSON () {
        var json = this._paperPath.exportJSON({asString:false});

        if(json[0] === "Raster") {
            json[1].asset = this._assetUUID;
            json[1].source = 'asset';
        }

        return json;
    }
}
