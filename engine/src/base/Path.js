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

 // NOTE:
 // Why can't we only export JSON on serialize, and remove the idea of a View for a path?
 // In this way there will never be issues with "is the JSON synced with the paper.Path instance?" questions
 // This gets annoying sometimes (see what we have to do in the getters for path attributes?)
 // Please try this later -zj

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
        } else {
            this.json = new paper.Path({insert:false}).exportJSON({asString:false});
        }
    }

    /**
     *
     */
    static createImagePath (asset, callback) {
        var img = new Image();
        img.src = asset.src;
        img.onload = () => {
            var raster = new paper.Raster(img);
            raster.remove();
            var path = new Wick.Path({
                json: Wick.View.Path.exportJSON(raster),
            });
            callback(path);
        }
    }

    get classname () {
        return 'Path';
    }

    serialize (args) {
        var data = super.serialize(args);
        data.json = this.json;
        delete data.json[1].data;
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
            width: paperBounds.width,
            height: paperBounds.height,
        };
    }

    /**
     * The position of the path.
     */
    get x () {
        return this.view.item.position.x;
    }

    set x (x) {
        this.view.item.position.x = x;
        this.json = this.view.exportJSON();
    }

    /**
     * The position of the path.
     */
    get y () {
        return this.view.item.position.y;
    }

    set y (y) {
        this.view.item.position.y = y;
        this.json = this.view.exportJSON();
    }

    /**
     * The fill color, in hex format (example "#FFFFFF"), of the path
     * @type {string}
     */
    get fillColorHex () {
        return this._getColorAsHex(this.view.item.fillColor);
    }

    set fillColorHex (fillColorHex) {
        this.view.item.fillColor = fillColorHex;
        this.json = this.view.exportJSON();
    }

    /**
     * The fill color, in rgba format (example "rgba(255,255,255,1.0)"), of the path
     * @type {object}
     */
    get fillColorRGBA () {
        return this._getColorAsRGBA(this.view.item.fillColor);
    }

    /**
     * The stroke color, in hex format (example "#FFFFFF"), of the path
     * @type {string}
     */
    get strokeColorHex () {
        return this._getColorAsHex(this.view.item.strokeColor);
    }

    set strokeColorHex (strokeColorHex) {
        this.view.item.strokeColor = strokeColorHex;
        this.json = this.view.exportJSON();
    }

    /**
     * The stroke color, in rgba format (example "rgba(255,255,255,1.0)"), of the path
     * @type {object}
     */
    get strokeColorRGBA () {
        this._getColorAsRGBA(this.view.item.strokeColor);
    }

    _getColorAsHex (color) {
        return color.toCSS(true);
    }

    _getColorAsRGBA (color) {
        return {
            r: color.red * 255,
            g: color.green * 255,
            b: color.blue * 255,
            a: color.alpha,
        };
    }

    /**
     * The stroke width of the shape.
     */
    get strokeWidth () {
        return this.view.item.strokeWidth;
    }

    set strokeWidth (strokeWidth) {
        this.view.item.strokeWidth = strokeWidth;
        this.json = this.view.exportJSON();
    }

    /**
     * The opacity of the clip.
     */
    get opacity () {
        if(this.view.item.opacity === undefined || this.view.item.opacity === null) {
            return 1.0;
        }
        return this.view.item.opacity;
    }

    set opacity (opacity) {
        this.view.item.opacity = opacity;
        this.json = this.view.exportJSON();
    }

    /**
     * Removes this path from its parent frame.
     */
    remove () {
        this.parentFrame.removePath(this);
    }
}
