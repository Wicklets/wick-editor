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

Wick.View.Path = class extends Wick.View {
    /**
     * Create a path view.
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

        // Apply onion skin style if Needed
        // (This is done here in the Path code because we actually change the style of the path
        // if the current onion skin mode is set to "outlines" or "tint")
        if(this.model.parentFrame && this.model.parentFrame.onionSkinned) {
            this.applyOnionSkinStyles();
        } else {
            if(this.item.data.originalStyle) {
                this.item.strokeColor = this.item.data.originalStyle.strokeColor;
                this.item.fillColor = this.item.data.originalStyle.fillColor;
                this.item.strokeWidth = this.item.data.originalStyle.strokeWidth;
            }
        }
    }

    /**
     * Import paper.js path data into this Wick Path, replacing the current path data if necessary.
     * Uses cached data otherwise.
     * @param {object} json - Data for the path created with paper.js exportJSON({asString:false})
     */
    importJSON (json) {
        // if(this.model.project && this.model.project.playing) return;

        // Don't import the information if we don't need to...
        if (this._item && !this.model.needReimport) {
            return;
        }

        // Imports rasters if this json is a raster item.
        if (json[0] === 'Raster') {
            if (!this.importRaster(json)) return false;
        }

        // Import JSON data into paper.js
        this._item = this.paper.importJSON(json);
        this._item.remove();

        // Check if we need to recover the UUID from the paper path
        if(this._item.data.wickUUID) {
            this.model.uuid = this._item.data.wickUUID;
        } else {
            this._item.data.wickUUID = this.model.uuid;
            this._item.data.wickType = 'path';
        }

        this._item.fontWeight = `${this.model.fontWeight} ${this.model.fontStyle}`;

        this.model.needReimport = false;
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
        // Recover original style (if needed - only neccesary if style was overritten by custom onion skin style)
        if(item.data.originalStyle) {
            item.strokeColor = item.data.originalStyle.strokeColor;
            item.fillColor = item.data.originalStyle.fillColor;
            item.strokeWidth = item.data.originalStyle.strokeWidth;
        }
        return item.exportJSON({asString:false});
    }

    /**
     * Imports raster image from Wick Object cache.
     * @param {*} json 
     * @returns {boolean} True if successful import, false otherwise.
     */
    importRaster (json) {
        // Don't import if there is no project attached.
        if (!this.model.project) {
            // console.warn("Project not attached to raster path. Image will not be rendered")
            return false;
        }

        // Backwards compatibility check for old raster formats:
        let JSONsrc = json[1].source;

        if(JSONsrc.startsWith('data')) {
            // Bug: Raw dataURL was saved, need find asset with that data
            this.model.project.getAssets('Image').forEach(imageAsset => {
                if(imageAsset.src === json[1].source) {
                    JSONsrc = 'asset:' + imageAsset.uuid;
                }
            })
        } else if (JSONsrc.startsWith('asset:')) {
            // Current format, no fix needed
        } else if (JSONsrc === 'asset') {
            // Old format: Asset UUID is stored in 'data'
            JSONsrc = 'asset:' + (json[1].asset || json[1].data.asset);
        } else {
            console.error('WARNING: raster source format not recognized:');            return;
        }

        // Get image source from assets
        if(JSONsrc.startsWith('asset:')) {
            var assetUUID = JSONsrc.split(':')[1];
            var imageAsset = this.model.project.getAssetByUUID(assetUUID);
            json[1].source = imageAsset.src;
        }
        
        return true;
    }

    applyOnionSkinStyles () {
        var onionSkinStyle = this.model.project && this.model.project.toolSettings.getSetting('onionSkinStyle');
        this.item.data.originalStyle = this.item.data.originalStyle || {
            strokeColor: this.item.strokeColor,
            fillColor: this.item.fillColor,
            strokeWidth: this.item.strokeWidth,
        };

        var frame = this.model.parentFrame;
        var playheadPosition = this.model.project.focus.timeline.playheadPosition;

        var onionTintColor = new Wick.Color("#ffffff");
        if(frame.midpoint < playheadPosition) {
            onionTintColor = this.model.project.toolSettings.getSetting('backwardOnionSkinTint').rgba;
        } else if(frame.midpoint > playheadPosition) {
            onionTintColor = this.model.project.toolSettings.getSetting('forwardOnionSkinTint').rgba;
        }

        if(onionSkinStyle === 'standard') {
            // We don't have to do anything!
        } else if (onionSkinStyle === 'outlines') {
            this.item.fillColor = 'rgba(0,0,0,0)'; // Make the fills transparent.
            this.item.strokeWidth = this.model.project.toolSettings.getSetting('onionSkinOutlineWidth');
            this.item.strokeColor = onionTintColor;
        } else if (onionSkinStyle === 'tint') {
            if(this.item.fillColor) this.item.fillColor = Wick.Color.average(new Wick.Color(this.item.fillColor.toCSS()), new Wick.Color(onionTintColor)).rgba;
            if(this.item.strokeColor) this.item.strokeColor = Wick.Color.average(new Wick.Color(this.item.strokeColor.toCSS()), new Wick.Color(onionTintColor)).rgba;
        }
    }
}
