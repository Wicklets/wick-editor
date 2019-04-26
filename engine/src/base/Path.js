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
     * Create a Wick Path.
     * @param {array} json - Path data exported from paper.js using exportJSON({asString:false}).
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        if(args.json) {
            this.json = args.json;
        } else if (args.asset) {
            this.asset = args.asset;
        } else {
            console.warn('Warning: Paths require either "json" or "asset" to be passed in as args');
        }
    }

    get classname () {
        return 'Path';
    }

    serialize (args) {
        var data = super.serialize(args);
        data.json = this.json;
        return data;
    }

    deserialize (data) {
        super.deserialize(data);
        this.json = data.json;
    }

    /**
     * Path data exported from paper.js using exportJSON({asString:false}).
     */
    get json () {
        return this._json;
    }

    set json (json) {
        this._json = json;
        this.view.render();
    }

    /**
     * Asset to use for image data.
     */
    get asset () {
        return this._asset;
    }

    set asset (asset) {
        this._asset = asset;
        this.json = [
            "Raster",
            {
                "applyMatrix": false,
                "crossOrigin": "",
                "source": "asset",
                "asset": asset.uuid,
                "data": {
                    "asset" : asset.uuid
                }
            }
        ];
    }

    /**
     * Flag that is set to true when the path is fully loaded.
     * @type {boolean}
     */
    get isLoaded () {
        return this._isLoaded;
    }

    /**
     * Callback to listen for when a raster path is done being loaded
     * @param {function} fn - the function to call when a path is loaded
     */
    set onLoad (fn) {
        this._onLoad = fn;
    }

    /**
     * The bounding box of the path.
     * @type {object}
     */
    get bounds () {
        var paperBounds = this.view.item.bounds;
        return {
            top: paperBounds.top,
            bottom: paperBounds.bottom,
            left: paperBounds.left,
            right: paperBounds.right,
        };
    }

    /**
     * The fill color, in hex format, of the path
     * @type {string}
     */
    get fillColorHex () {
        return this.view.item.fillColor.toCSS(true);
    }

    /**
     * The fill color, in rgba format, of the path
     * @type {object}
     */
    get fillColorRGBA () {
        return {
            r: this.view.item.fillColor.red * 255,
            g: this.view.item.fillColor.green * 255,
            b: this.view.item.fillColor.blue * 255,
            a: this.view.item.fillColor.alpha,
        };
    }

    /**
     * Removes this path from its parent frame.
     */
    remove () {
        this.parentFrame.removePath(this);
    }
}
