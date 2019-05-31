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
            return;
        }
        this.importJSON(this.model.json);
    }

    /**
     * Import paper.js path data into this Wick Path, replacing the current path data.
     * @param {object} json - Data for the path created with paper.js exportJSON({asString:false})
     */
    importJSON (json) {
        // Backwards compatibility check for old raster formats:
        if(json[0] === 'Raster' && this.model.project) {
            if(json[1].source.startsWith('data')) {
                // Bug: Raw dataURL was saved, need find asset with that data
                this.model.project.getAssets('Image').forEach(imageAsset => {
                    if(imageAsset.src === json[1].source) {
                        json[1].source = 'asset:' + imageAsset.uuid;
                    }
                })
            } else if (json[1].source.startsWith('asset:')) {
                // Current format, no fix needed
            } else if (json[1].source === 'asset') {
                // Old format: Asset UUID is stored in 'data'
                if(!json[1].data || !json[1].data.asset) {
                    console.error("could not salvage old raster source format:")
                    console.log(json);
                    return;
                }
                json[1].source = 'asset:' + json[1].data.asset;
            } else {
                console.error('WARNING: raster source format not recognized:');
                console.log(json);
                return;
            }
        }

        // Set raster asset source
        var assetUUID = null;
        if(json[0] === 'Raster' && this.model.project) {
            assetUUID = json[1].source.split(':')[1];
            json[1].source = this.model.project.getAssetByUUID(assetUUID).src;
            this._item.data.wickAssetUUID = assetUUID;
        }

        // Import JSON data into paper.js
        this._item = this.paper.importJSON(json);
        if(assetUUID) this._item.data.assetUUID = assetUUID;
        this._item.remove();

        // Check if we need to recover the UUID from the paper path
        if(this._item.data.wickUUID) {
            this.model.uuid = this._item.data.wickUUID;
        } else {
            this._item.data.wickUUID = this.model.uuid;
            this._item.data.wickType = 'path';
        }

        // Extra text options
        if(this._item instanceof paper.TextItem) {
            // https://github.com/paperjs/paper.js/issues/937
            this._item.fontWeight = this.model.fontWeight + ' ' + this.model.fontStyle;
        }
    }

    /**
     * Export this path as paper.js Path json data.
     */
    exportJSON () {
        return Wick.View.Path.exportJSON(this.item);
    }

    /**
     * Export a path as paper.js Path json data.
     */
    static exportJSON (item) {
        var json = item.exportJSON({asString:false});
        if(json[0] === 'Raster') {
            json[1].source = 'asset:' + item.data.wickAssetUUID;
        }
        return json;
    }
}
