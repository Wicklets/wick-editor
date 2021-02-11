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

/**
 * Represents a Wick Path.
 */
Wick.Path = class extends Wick.Transformable {
    /**
     * Create a Wick Path.
     * @param {array} json - Path data exported from paper.js using exportJSON({asString:false}).
     * @param {Paper.Path} path - A Paper.js Path object to use as this Path's svg data. Optional if json was not passed in.
     */
    constructor(args) {
        if (!args) args = {};
        super(args);

        // Generic Path Information
        this._fillColor = args.fillColor === undefined ? new Wick.Color() : new Wick.Color(args.fillColor);
        this._strokeColor = args.strokeColor === undefined ? new Wick.Color() : new Wick.Color(args.strokeColor);
        this._strokeWidth = args.strokeWidth === undefined ? 1 : args.strokeWidth;

        this._fontStyle = 'normal';
        this._fontWeight = 400;
        this._isPlaceholder = args.isPlaceholder;
        this._originalStyle = null;

        if(args.path) {
            this.json = args.path.exportJSON({asString:false});
        } else if(args.json) {
            this.json = args.json;
        } else {
            this.json = new paper.Path({ insert: false }).exportJSON({ asString: false });
        }

        this.needReimport = true;
        this.needRender = true;
    }

    /**
     * Create a path containing an image from an ImageAsset.
     * @param {Wick.ImageAsset} asset - The asset from which the image src will be loaded from
     * @param {Function} callback - A function that will be called when the image is done loading.
     */
    static createImagePath(asset, callback) {
        var img = new Image();
        img.src = asset.src;
        img.onload = () => {
            var raster = new paper.Raster(img);
            raster.remove();
            var path = new Wick.Path({
                json: Wick.View.Path.exportJSON(raster),
                project: asset.project,
            });
            callback(path);
        }
    }

    /**
     * Create a path (synchronously) containing an image from an ImageAsset.
     * @param {Wick.ImageAsset} asset - The asset from which the image src will be loaded from
     */
    static createImagePathSync(asset) {
        var raster = new paper.Raster(asset.src);
        raster.remove();
        var path = new Wick.Path({
            json: Wick.View.Path.exportJSON(raster),
            project: asset.project,
        });
        return path;
    }

    get classname() {
        return 'Path';
    }

    _serialize(args) {
        var data = super._serialize(args);

        data.json = this.json;
        delete data.json[1].data;

        // optimization: replace dataurls with asset uuids
        if (data.json[0] === 'Raster' && data.json[1].source.startsWith('data:')) {
            if (!this.project) {
                console.warn('Could not replace raster image source with asset UUID, path does not belong to a project.');
            } else {
                this.project.getAssets('Image').forEach(imageAsset => {
                    if (imageAsset.src === data.json[1].source) {
                        data.json[1].source = 'asset:' + imageAsset.uuid;
                    }
                })
            }
        }

        data.fontStyle = this._fontStyle;
        data.fontWeight = this._fontWeight;
        data.isPlaceholder = this._isPlaceholder;

        data.strokeColor = this.strokeColor;
        data.fillColor = this.fillColor;
        data.strokeWidth = this.strokeWidth;

        return data;
    }

    _deserialize(data) {
        super._deserialize(data);
        this.json = data.json;
        this._fontStyle = data.fontStyle || 'normal';
        this._fontWeight = data.fontWeight || 400;
        this._isPlaceholder = data.isPlaceholder;

        this._fillColor = data.fillColor;
        this._strokeColor = data.strokeColor;
        this._strokeWidth = data.strokeWidth;
    }

    /**
     * The fill color of the path.
     * @type {Wick.Color}
     */
    get fillColor() {
        return this._fillColor;
    }

    set fillColor(fillColor) {
        this._fillColor = fillColor;
    }

    /**
     * The stroke color of the path.
     * @type {Wick.Color}
     */
    get strokeColor() {
        return this._strokeColor;
    }

    set strokeColor(strokeColor) {
        this._strokeColor = strokeColor;
    }

    /**
     * The stroke width of the path.
     * @type {number}
     */
    get strokeWidth() {
        return this._strokeWidth;
    }

    set strokeWidth(strokeWidth) {
        this._strokeWidth = strokeWidth;
    }

    /**
     * Determines if this Path is visible in the project.
     */
    get onScreen() {
        return this.parent.onScreen;
    }

    /**
     * The type of path that this path is. Can be 'path', 'text', or 'image'
     * @returns {string}
     */
    get pathType() {
        if (this.view.item instanceof paper.TextItem) {
            return 'text';
        } else if (this.view.item instanceof paper.Raster) {
            return 'image';
        } else {
            return 'path';
        }
    }

    /**
     * Path data exported from paper.js using exportJSON({asString:false}).
     * @type {object}
     */
    get json() {
        return this._json;
    }

    set json(json) {
        this._json = json;
        this.needReimport = true;
        this.view.render();
    }

    /**
     * The bounding box of the path.
     * @type {object}
     */
    get bounds() {
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
     * The font family of the path.
     * @type {string}
     */
    get fontFamily() {
        return this.view.item.fontFamily
    }

    set fontFamily(fontFamily) {
        this.view.item.fontFamily = fontFamily;
        this.fontWeight = 400;
        this.fontStyle = 'normal';
        this.updateJSON();
    }

    /**
     * The font size of the path.
     * @type {number}
     */
    get fontSize() {
        return this.view.item.fontSize;
    }

    set fontSize(fontSize) {
        this.view.item.fontSize = fontSize;
        this.view.item.leading = fontSize * 1.2;
        this.updateJSON();
    }

    /**
     * The font weight of the path.
     * @type {number}
     */
    get fontWeight() {
        return this._fontWeight;
    }

    set fontWeight(fontWeight) {
        if (typeof fontWeight === 'string') {
            console.error('fontWeight must be a number.');
            return;
        }
        this._fontWeight = fontWeight
        this.updateJSON();
    }

    /**
     * The font style of the path ('italic' or 'oblique').
     * @type {string}
     */
    get fontStyle() {
        return this._fontStyle;
    }

    set fontStyle(fontStyle) {
        this._fontStyle = fontStyle;
        this.updateJSON();
    }

    /**
     * The content of the text.
     * @type {string}
     */
    get textContent() {
        return this.view.item.content;
    }

    set textContent(textContent) {
        this.view.item.content = textContent;
    }

    /**
     * Update the JSON of the path based on the path on the view.
     */
    updateJSON() {
        this.json = this.view.exportJSON();
    }

    /**
     * API function to change the textContent of dynamic text paths.
     */
    setText(newTextContent) {
        this.textContent = newTextContent;
    }

    /**
     * Check if this path is a dynamic text object.
     * @type {boolean}
     */
    get isDynamicText() {
        return this.pathType === 'text' &&
            this.identifier !== null;
    }

    /**
     * The image asset that this path uses, if this path is a Raster path.
     * @returns {Wick.Asset[]}
     */
    //should this also return the SVGAsset if the path is loaded from an SVGAsset
    getLinkedAssets() {
        var linkedAssets = [];

        var data = this.serialize(); // just need the asset uuid...
        if (data.json[0] === 'Raster') {
            var uuid = data.json[1].source.split(':')[1];
            linkedAssets.push(this.project.getAssetByUUID(uuid));
        }

        return linkedAssets;
    }

    /**
     * Removes this path from its parent frame.
     */
    remove() {
        this.parentFrame.removePath(this);
    }

    /**
     * Creates a new path using boolean unite on multiple paths. The resulting path will use the fillColor, strokeWidth, and strokeColor of the first path in the array.
     * @param {Wick.Path[]} paths - an array containing the paths to process.
     * @returns {Wick.Path} The path resulting from the boolean unite.
     */
    static unite(paths) {
        return Wick.Path.booleanOp(paths, 'unite');
    }

    /**
     * Creates a new path using boolean subtration on multiple paths. The resulting path will use the fillColor, strokeWidth, and strokeColor of the first path in the array.
     * @param {Wick.Path[]} paths - an array containing the paths to process.
     * @returns {Wick.Path} The path resulting from the boolean subtraction.
     */
    static subtract(paths) {
        return Wick.Path.booleanOp(paths, 'subtract');
    }

    /**
     * Creates a new path using boolean intersection on multiple paths. The resulting path will use the fillColor, strokeWidth, and strokeColor of the first path in the array.
     * @param {Wick.Path[]} paths - an array containing the paths to process.
     * @returns {Wick.Path} The path resulting from the boolean intersection.
     */
    static intersect(paths) {
        return Wick.Path.booleanOp(paths, 'intersect');
    }

    /**
     * Perform a paper.js boolean operation on a list of paths.
     * @param {Wick.Path[]} paths - a list of paths to perform the boolean operation on.
     * @param {string} booleanOpName - the name of the boolean operation to perform. Currently supports "unite", "subtract", and "intersect"
     */
    static booleanOp(paths, booleanOpName) {
        if (!booleanOpName) {
            console.error('Wick.Path.booleanOp: booleanOpName is required');
        }
        if (booleanOpName !== 'unite' && booleanOpName !== 'subtract' && booleanOpName !== 'intersect') {
            console.error('Wick.Path.booleanOp: unsupported booleanOpName: ' + booleanOpName);
        }

        if (!paths || paths.length === 0) {
            console.error('Wick.Path.booleanOp: a non-empty list of paths is required');
        }

        // Single path? Nothing to do.
        if (paths.length === 1) {
            return paths[0];
        }

        // Get paper.js path objects
        paths = paths.map(path => {
            return path.view.item;
        });

        var result = paths[0].clone({ insert: false });
        paths.forEach(path => {
            if (path === paths[0]) return;

            result = result[booleanOpName](path);
            result.remove();
        });

        var resultWickPath = new Wick.Path({
            json: result.exportJSON({ asString: false }),
        });
        return resultWickPath;
    }

    /**
     * Converts a stroke into fill. Only works with paths that have a strokeWidth and strokeColor, and have no fillColor. Does nothing otherwise.
     * @returns {Wick.Path} A flattened version of this path. Can be null if the path cannot be flattened.
     */
    flatten() {
        if (this.fillColor || !this.strokeColor || !this.strokeWidth) {
            return null;
        }

        if (!(this instanceof paper.Path)) {
            return null;
        }

        var flatPath = new Wick.Path({
            json: this.view.item.flatten().exportJSON({ asString: false }),
        });

        flatPath.fillColor = this.strokeColor;

        return flatPath;
    }

    /**
     * Is this path used as a placeholder for preventing empty clips?
     * @type {bool}
     */
    set isPlaceholder (isPlaceholder) {
        this._isPlaceholder = isPlaceholder;
    }

    get isPlaceholder () {
        return this._isPlaceholder;
    }

    // When the transform changes, signal a rerender is necessary.
    onTransformableChange () {
        this.needRender = true;
    }
}
