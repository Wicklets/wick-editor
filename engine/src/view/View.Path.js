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

    }

    /**
     *
     */
    render () {
        this.importJSON(this.model.json);
        this._item.remove();
    }

    /**
     * Import paper.js path data into this Wick Path, replacing the current path data.
     * @param {object} json - Data for the path created with paper.js exportJSON({asString:false})
     */
    importJSON (json) {
        if(json[0] === "Raster") {
            this._assetUUID = json[1].asset;
            var src = Wick.FileCache.getFile(this._assetUUID).src;
            json[1].source = src;
        }

        this._item = paper.importJSON(json);
        this._item.onLoad = () => {
            this._loaded = true;
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
