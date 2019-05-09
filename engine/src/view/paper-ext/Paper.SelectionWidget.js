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

SelectionWidget = class {
    /**
     * Creates a SelectionWidget
     */
    constructor (args) {
        if(!args) args = {};
        if(!args.layer) args.layer = paper.project.activeLayer;

        this._layer = args.layer;
        this._item = new paper.Group({ insert:false });
    }

    /**
     * The item containing the widget GUI
     */
    get item () {
        return this._item;
    }

    /**
     * The layer to add the widget GUI item to.
     */
    get layer () {
        return this._layer;
    }

    set layer (layer) {
        this._layer = layer;
    }

    /**
     *
     */
    get rotation () {
        return this._rotation;
    }

    set rotation (rotation) {
        this._rotation = rotation;
    }

    /**
     * The items currently inside the selection widget
     */
    get itemsInSelection () {
        return this._itemsInSelection;
    }

    /**
     * The point to rotate/scale the widget around.
     */
    get pivot () {
        return this._pivot;
    }

    set pivot (pivot) {
        this._pivot = pivot;
    }

    /**
     * The bounding box of the widget.
     */
    get boundingBox () {
        return this._boundingBox
    }

    /**
     * The current transformation being done to the selection widget.
     * @type {string}
     */
    get currentTransformation () {
        return this._currentTransformation;
    }

    set currentTransformation (currentTransformation) {
        if(['translate', 'scale', 'rotate'].indexOf(currentTransformation)) {
            console.error('Paper.SelectionWidget: Invalid transformation type: ' + currentTransformation);
            currentTransformation = null;
        } else {
            this._currentTransformation = currentTransformation;
        }
    }

    /**
     * Build a new SelectionWidget GUI around some items.
     * @param {number} rotation - the rotation of the selection. Optional, defaults to 0
     * @param {paper.Item[]} items - the items to build the GUI around
     * @param {paper.Point|string} pivot
     */
    build (args) {
        if(!args) args = {};
        if(!args.rotation) args.rotation = 0;
        if(!args.items) args.items = [];
        if(!args.pivot) args.pivot = 'center';

        this._itemsInSelection = args.items;
        this._rotation = args.rotation;

        this._boundingBox = this._calculateBoundingBox();

        // Calculate pivot/rotation point

        if(args.pivot === 'center') {
            // TODO Use center of bounds.
        } else if (args.pivot instanceof paper.Point) {
            this.pivot = args.pivot;
        } else {
            console.error('Paper.SelectionWidget.build(): Invalid pivot: ' + args.pivot);
            this.pivot = new paper.Point(0,0);
        }

        // Rebuild GUI

        this.item.remove();
        this.item.removeChildren();

        if(this._itemsInSelection.length > 0) {
            this.item.addChild(this._buildBorder());
        }

        var center = this._calculateBoundingBoxOfItems(this._itemsInSelection).center;
        //var clone = this.item.clone();
        //clone.opacity = 0.5;
        //clone.rotate(-this.rotation, center);
        //this.layer.addChild(clone)
        this.item.rotate(this.rotation, center);

        this.layer.addChild(this.item);
    }

    /**
     *
     */
    moveSelection (delta) {

    }

    /**
     *
     */
    moveHandleAndScale (handleName, point) {

    }

    /**
     *
     */
    moveHandleAndRotate (handleName, point) {

    }

    _buildBorder () {
        var border = new paper.Path.Rectangle({
            name: 'border',
            from: this.boundingBox.topLeft,
            to: this.boundingBox.bottomRight,
            strokeWidth: paper.SelectionWidget.BOX_STROKE_WIDTH,
            strokeColor: paper.SelectionWidget.BOX_STROKE_COLOR,
            insert: false,
        });
        border.data.isBorder = true;
        return border;
    }

    _calculateBoundingBox () {
        if(this._itemsInSelection.length === 0) {
            return new paper.Rectangle();
        }

        var center = this._calculateBoundingBoxOfItems(this._itemsInSelection).center;

        console.log(center)
        var itemsForBoundsCalc = this._itemsInSelection.map(item => {
            var clone = item.clone();
            clone.rotate(-this.rotation, center);
            clone.remove();
            //clone.opacity = 0.5;
            return clone;
        });

        return this._calculateBoundingBoxOfItems(itemsForBoundsCalc);
    }

    _calculateBoundingBoxOfItems (items) {
        var bounds = null;
        items.forEach(item => {
            bounds = bounds ? bounds.unite(item.bounds) : item.bounds;
        });
        return bounds || new paper.Rectangle();
    }
};

SelectionWidget.BOX_STROKE_WIDTH = 1;
SelectionWidget.BOX_STROKE_COLOR = 'rgba(100,150,255,1.0)';

paper.PaperScope.inject({
    SelectionWidget: SelectionWidget,
});
