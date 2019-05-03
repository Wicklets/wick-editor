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

        this.handleDragMode = 'scale';

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

        this._bounds = paper.Selection._getBoundsOfItems(this._items);
        if(args.originX !== undefined) {
            this._transformation.originX = args.originX;
        } else {
            this._transformation.originX = this._bounds.center.x;
        }

        if(args.originY !== undefined) {
            this._transformation.originY = args.originY;
        } else {
            this._transformation.originY = this._bounds.center.y;
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
     * The bounds of selected items, i.e., the smallest rectangle that contains all items in the selection.
     * @type {paper.Rectangle}
     */
    get bounds () {
        return this._bounds;
    }

    /**
     * The type of transformation to use while dragging handles. Can be 'scale' or 'rotation'.
     */
    get handleDragMode () {
        return this._handleDragMode;
    }

    set handleDragMode (handleDragMode) {
        if(handleDragMode === 'scale' || handleDragMode === 'rotation') {
            this._handleDragMode = handleDragMode;
        } else {
            console.error('Paper.Selection: Invalid handleDragMode: ' + handleDragMode);
            console.error('Valid handleDragModes: "scale", "rotation"')
        }
    }

    /**
     * Drag a handle to scale or rotate the selection. Will scale if handleDragMode is set to 'scale', and will rotate if handleDragMode is set to 'rotate'.
     * @param {paper.Point} point - the point to drag the handle to.
     * @param {string} handleName - the name of the handle to drag. Can be 'topLeft', 'topCenter', 'topRight', 'rightCenter', 'bottomRight', 'bottomCenter', 'bottomLeft', or 'leftCenter'.
     */
    setHandlePosition (args) {
        if(!args) console.error('setHandlePosition(): args is required');
        if(!args.point) console.error('setHandlePosition(): args.point is required');
        if(!args.handleName) console.error('setHandlePosition(): args.handleName is required');

        if(this._handleDragMode === 'scale') {
            this._setHandlePositionAndScale(args.handleName, args.point);
        } else if(this._handleDragMode === 'rotation') {
            this._setHandlePositionAndRotate(args.handleName, args.point);
        }
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
            bounds: this._bounds,
        });

        // Don't add GUI to paper if nothing is selected...
        if(this._items.length > 0) {
            this._layer.addChild(this._gui.item);
        }

        paper.Selection._transformItems(this._items.concat(this._gui.item), this._transformation);
    }

    _destroy (discardTransformation) {
        paper.Selection._freeItemsFromSelection(this.items, discardTransformation);
        this._gui.destroy();
    }

    _setHandlePositionAndScale (handleName, point) {
        /*
        var lockYScale = handleName === 'leftCenter'
                      || handleName === 'rightCenter';
        var lockXScale = handleName === 'bottomCenter'
                      || handleName === 'topCenter';

        var rotation = this.transformation.rotation;
        var x = this.transformation.x;
        var y = this.transformation.y;

        var resetTransform = {
            x: 0,
            y: 0,
            rotation: 0
        };

        if(!lockXScale) resetTransform.scaleX = 1;
        if(!lockYScale) resetTransform.scaleY = 1;

        this.updateTransformation(resetTransform)

        var origin = new paper.Point(this.transformation.originX, this.transformation.originY);
        var translatedPosition = point.subtract(new paper.Point(x,y));
        var rotatedPosition = translatedPosition.rotate(-rotation, origin);

        var distFromHandle = rotatedPosition.subtract(this._getHandlePosition(handleName));
        var widthHeight = this._getHandlePosition(handleName).subtract(origin);
        var newCornerPosition = distFromHandle.add(widthHeight);
        var scaleAmt = newCornerPosition.divide(widthHeight);

        var newTransform = {
            x: x,
            y: y,
            rotation: rotation,
        };

        this.lockScalingToAspectRatio = false;

        if(!lockXScale) newTransform.scaleX = scaleAmt.x;
        if(!lockYScale) newTransform.scaleY = this.lockScalingToAspectRatio ? scaleAmt.x : scaleAmt.y;

        this.updateTransformation(newTransform);
        */
    }

    _setHandlePositionAndRotate (handleName, point) {
        /*
        var point_origin = new paper.Point(this.transformation.originX, this.transformation.originY);
        var point_drag = point;
        var point_handle = this._getHandlePosition(handleName);

        var angle_current = point_handle.subtract(point_origin).angle;
        var angle_new = point_drag.subtract(point_origin).angle;
        var angle_diff = angle_new - angle_current;

        this.updateTransformation({
            rotation: this.transformation.rotation + angle_diff,
        });
        */
    }

    _getHandlePosition (handleName) {
        // Find child with name in selection GUI
        var child = this._gui.item.children.find(c => {
            return c.data.handleEdge === handleName;
        });

        if(!child) {
            console.error('Could not find handle with name: ' + handleName);
            return new paper.Point();
        } else {
            // Apply the current transform to get the absolute position of the handle
            //var matrix = paper.Selection._buildTransformationMatrix(this.transformation)
            //return child.position.transform(matrix);

            return child.position;
        }
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

    static _transformItems (items, transformation) {
        var matrix = paper.Selection._buildTransformationMatrix(transformation)

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
};

paper.PaperScope.inject({
    Selection: paper.Selection,
});
