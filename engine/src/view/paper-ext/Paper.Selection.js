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

paper.Selection = class {
    /**
     * Create a new paper.js selection.
     * @param {paper.Layer} layer - the layer to add the selection GUI to. Defaults to the active layer.
     * @param {paper.Item[]} items - the items to select.
     * @param {number} x - the amount the selection is translated on the x-axis
     * @param {number} y - the amount the selection is translated on the y-axis
     * @param {number} scaleX - the amount the selection is scaled on the x-axis
     * @param {number} scaleY - the amount the selection is scaled on the y-axis
     * @param {number} rotation - the amount the selection is rotated
     * @param {number} originX - the origin point of all transforms. Defaults to the center of selected items.
     * @param {number} originY - the origin point of all transforms. Defaults to the center of selected items.
     */
    constructor (args) {
        if(!args) args = {};

        this._lockScalingToAspectRatio = false;

        this._layer = args.layer || paper.project.activeLayer;
        this._items = args.items || [];
        this._transformation = {
            x: args.x || 0,
            y: args.y || 0,
            scaleX: args.scaleX || 1.0,
            scaleY: args.scaleY || 1.0,
            rotation: args.rotation || 0,
            originX: 0,
            originY: 0,
        };

        this._untransformedBounds = paper.Selection._getBoundsOfItems(this._items);
        if(args.originX !== undefined) {
            this._transformation.originX = args.originX;
        } else {
            this._transformation.originX = this._untransformedBounds.center.x;
        }

        if(args.originY !== undefined) {
            this._transformation.originY = args.originY;
        } else {
            this._transformation.originY = this._untransformedBounds.center.y;
        }

        this._create();
    }

    /**
     * The layer where the selection GUI was created.
     * @type {paper.Layer}
     */
    get layer () {
        return this._layer;
    }

    /**
     * The items in this selection.
     * @type {paper.Item[]}
     */
    get items () {
        return this._items;
    }

    /**
     * The transformation applied to the selected items.
     * @type {object}
     */
    get transformation () {
        // deep copy to protect transformation.
        return JSON.parse(JSON.stringify(this._transformation));
    }

    set transformation (transformation) {
        this._destroy(true);
        this._transformation = transformation;
        this._create();
    }

    /**
     * Update the transformation with new values.
     * @param {object} newTransformation - an object containing new values for the transformation.
     */
    updateTransformation (newTransformation) {
        this.transformation = Object.assign(this.transformation, newTransformation);
    }

    /**
     * Toggles if scaling will preserve aspect ratio.
     * @type {boolean}
     */
    get lockScalingToAspectRatio () {
        return this._lockScalingToAspectRatio;
    }

    set lockScalingToAspectRatio (lockScalingToAspectRatio) {
        this._lockScalingToAspectRatio = lockScalingToAspectRatio;
    }

    /**
     * The absolute position of the top-left handle of the selection.
     * @type {paper.Point}
     */
    get position () {
        return this._untransformedBounds.topLeft.transform(this._matrix);
    }

    set position (position) {
        var d = position.subtract(this.position);
        this.updateTransformation({
            x: this.transformation.x + d.x,
            y: this.transformation.y + d.y,
        });
    }

    /**
     * The absolute position of the origin of the selection.
     * @type {paper.Point}
     */
    get origin () {
        return new paper.Point(
            this._transformation.originX,
            this._transformation.originY
        ).transform(this._matrix);
    }

    set origin (origin) {
        var d = origin.subtract(this.origin);
        this.updateTransformation({
            x: this.transformation.x + d.x,
            y: this.transformation.y + d.y,
        });
    }

    /**
     * The width of the selection.
     * @type {number}
     */
    get width () {
        return this._untransformedBounds.width * this.transformation.scaleX;
    }

    set width (width) {
        var d = this.width / width;
        this.updateTransformation({
            scaleX: this.transformation.scaleX / d,
        });
    }

    /**
     * The height of the selection.
     * @type {number}
     */
    get height () {
        return this._untransformedBounds.height * this.transformation.scaleY;
    }

    set height (height) {
        var d = this.height / height;
        this.updateTransformation({
            scaleY: this.transformation.scaleY / d,
        });
    }

    /**
     * The x-scale of the selection.
     * @type {number}
     */
    get scaleX () {
        return this.transformation.scaleX;
    }

    set scaleX (scaleX) {
        this.updateTransformation({
            scaleX: scaleX,
        });
    }

    /**
     * The y-scale of the selection.
     * @type {number}
     */
    get scaleY () {
        return this.transformation.scaleY;
    }

    set scaleY (scaleY) {
        this.updateTransformation({
            scaleY: scaleY,
        });
    }

    /**
     * The rotation of the selection.
     * @type {number}
     */
    get rotation () {
        return this.transformation.rotation;
    }

    set rotation (rotation) {
        this.updateTransformation({
            rotation: rotation,
        });
    }

    /**
     * Return a paper.js path attribute of the selection.
     * @param {string} attributeName - the name of the attribute
     */
    getPathAttribute (attributeName) {
        if(this.items.length === 0) {
            console.error('getPathAttribute(): Nothing in the selection!');
        }
        return this.items[0][attributeName];
    }

    /**
     * Update a paper.js path attribute of the selection.
     * @param {string} attributeName - the name of the attribute
     * @param {object} attributeValue - the value of the attribute to change
     */
    setPathAttrribute (attributeName, attributeValue) {
        this.items.forEach(item => {
            item[attributeName] = attributeValue;
        });
    }

    /**
     * The fill color of the selection.
     */
    get fillColor () {
        return this.getPathAttribute('fillColor');
    }

    set fillColor (fillColor) {
        this.setPathAttrribute('fillColor', fillColor);
    }

    /**
     * The stroke color of the selection.
     */
    get strokeColor () {
        return this.getPathAttribute('strokeColor');
    }

    set strokeColor (strokeColor) {
        this.setPathAttrribute('strokeColor', strokeColor);
    }

    /**
     * The stroke color of the selection.
     */
    get strokeWidth () {
        return this.getPathAttribute('strokeWidth');
    }

    set strokeWidth (strokeWidth) {
        this.setPathAttrribute('strokeWidth', strokeWidth);
    }

    /**
     * Flip the selection horizontally.
     */
    flipHorizontally () {
        this.updateTransformation({
            scaleX: -this.transformation.scaleX,
        });
    }

    /**
     * Flip the selection vertically.
     */
    flipVertically () {
        this.updateTransformation({
            scaleY: -this.transformation.scaleY,
        });
    }

    /**
     * Moves the selected items forwards.
     */
    moveForwards () {
        paper.Selection._sortItemsByLayer(this._items).forEach(items => {
            paper.Selection._sortItemsByZIndex(items).reverse().forEach(item => {
                if(item.nextSibling && this._items.indexOf(item.nextSibling) === -1) {
                    item.insertAbove(item.nextSibling);
                }
            });
        });
    }

    /**
     * Moves the selected items backwards.
     */
    moveBackwards () {
        paper.Selection._sortItemsByLayer(this._items).forEach(items => {
            paper.Selection._sortItemsByZIndex(items).forEach(item => {
                if(item.previousSibling && this._items.indexOf(item.previousSibling) === -1) {
                    item.insertBelow(item.previousSibling);
                }
            });
        });
    }

    /**
     * Brings the selected objects to the front.
     */
    bringToFront () {
        paper.Selection._sortItemsByLayer(this._items).forEach(items => {
            paper.Selection._sortItemsByZIndex(items).forEach(item => {
                item.bringToFront();
            });
        });
    }

    /**
     * Sends the selected objects to the back.
     */
    sendToBack () {
        paper.Selection._sortItemsByLayer(this._items).forEach(items => {
            paper.Selection._sortItemsByZIndex(items).reverse().forEach(item => {
                item.sendToBack();
            });
        });
    }

    /**
     * Nudge the selection by a specified amount.
     */
    nudge (x, y) {
        this.position = this.position.add(new paper.Point(x, y));
    }

    /**
     * wip
     */
    moveHandleAndScale (handleName, position) {
        var newHandlePosition = position;
        var currentHandlePosition = this._untransformedBounds[handleName];

        currentHandlePosition = currentHandlePosition.add(new paper.Point(this.transformation.x, this.transformation.y));

        newHandlePosition = newHandlePosition.subtract(this.origin);
        currentHandlePosition = currentHandlePosition.subtract(this.origin);

        newHandlePosition = newHandlePosition.rotate(-this.rotation, new paper.Point(0,0));

        var newScale = newHandlePosition.divide(currentHandlePosition);

        var lockYScale = handleName === 'leftCenter'
                      || handleName === 'rightCenter';
        var lockXScale = handleName === 'bottomCenter'
                      || handleName === 'topCenter';

        if(!lockXScale) newScale.x = this.transformation.x;
        if(!lockYScale) newScale.y = this.transformation.y;

        this.updateTransformation({
            scaleX: newScale.x,
            scaleY: this.lockScalingToAspectRatio ? newScale.x : newScale.y,
        });
    }

    /**
     * wip
     */
    moveHandleAndRotate (handleName, position) {
        var newHandlePosition = position;
        var currentHandlePosition = this._untransformedBounds[handleName];

        currentHandlePosition = currentHandlePosition.transform(this._matrix);

        newHandlePosition = newHandlePosition.subtract(this.origin);
        currentHandlePosition = currentHandlePosition.subtract(this.origin);

        var angleDiff = newHandlePosition.angle - currentHandlePosition.angle;

        this.updateTransformation({
            rotation: this.transformation.rotation + angleDiff,
        });
    }

    /**
     * Finish and destroy the selection.
     * @param {boolean} discardTransformation - If set to true, will reset all items to their original transforms before the selection was made.
     */
    finish (args) {
        if(!args) args = {};
        if(args.discardTransformation === undefined) args.discardTransformation = false;

        this._destroy(args.discardTransformation);
    }

    _create () {
        paper.Selection._prepareItemsForSelection(this._items);

        this._gui = new paper.SelectionGUI({
            items: this._items,
            transformation: this._transformation,
            bounds: this._untransformedBounds,
        });

        // Don't add GUI to paper if nothing is selected...
        if(this._items.length > 0) {
            this._layer.addChild(this._gui.item);
        }

        // Build transform matrix
        this._matrix = paper.Selection._buildTransformationMatrix(this._transformation)

        paper.Selection._transformItems(this._items.concat(this._gui.item), this._matrix);
    }

    _destroy (discardTransformation) {
        paper.Selection._freeItemsFromSelection(this.items, discardTransformation);
        this._gui.destroy();
    }

    static _prepareItemsForSelection (items) {
        items.forEach(item => {
            item.data.originalMatrix = item.matrix.clone();
            item.applyMatrix = false;
        });
    }

    static _freeItemsFromSelection (items, discardTransforms) {
        // Reset matrix and applyMatrix to what is was before we added it to the selection
        items.forEach(item => {
            if(item.data.originalMatrix && discardTransforms) {
                item.matrix.set(item.data.originalMatrix);
            }
        });

        items.filter(item => {
            return item instanceof paper.Path ||
                   item instanceof paper.CompoundPath;
        }).forEach(item => {
            item.applyMatrix = true;
        });

        // Delete the matrix we stored so it doesn't interfere with anything later
        items.forEach(item => {
            delete item.data.originalMatrix;
        });
    }

    static _transformItems (items, matrix) {
        items.forEach(item => {
            if(item.data.originalMatrix) {
                item.matrix.set(item.data.originalMatrix);
            } else {
                item.matrix.set(new paper.Matrix());
            }
            item.matrix.prepend(matrix);
        });
    }

    static _buildTransformationMatrix (transformation) {
        var matrix = new paper.Matrix();

        matrix.translate(transformation.originX, transformation.originY);
        matrix.translate(transformation.x, transformation.y);
        matrix.rotate(transformation.rotation);
        matrix.scale(transformation.scaleX, transformation.scaleY);
        matrix.translate(new paper.Point(0,0).subtract(new paper.Point(transformation.originX, transformation.originY)));

        return matrix;
    }

    /* helper function: calculate the bounds of the smallest rectangle that contains all given items. */
    static _getBoundsOfItems (items) {
        if(items.length === 0)
            return new paper.Rectangle();

        var bounds = null;
        items.forEach(item => {
            bounds = bounds ? bounds.unite(item.bounds) : item.bounds;
        });

        return bounds;
    }

    static _sortItemsByLayer (items) {
        var layerLists = {};

        items.forEach(item => {
            // Create new list for the item's layer if it doesn't exist
            var layerID = item.layer.id;
            if(!layerLists[layerID]) {
                layerLists[layerID] = [];
            }

            // Add this item to its corresponding layer list
            layerLists[layerID].push(item);
        });

        // Convert id->array object to array of arrays
        var layerItemsArrays = [];
        for (var layerID in layerLists) {
            layerItemsArrays.push(layerLists[layerID])
        }
        return layerItemsArrays;
    }

    static _sortItemsByZIndex (items) {
        return items.sort(function (a,b) {
            return a.index - b.index;
        });
    }
};

paper.PaperScope.inject({
    Selection: paper.Selection,
});
