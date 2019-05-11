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

class SelectionWidget {
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
        if(['translate', 'scale', 'rotate'].indexOf(currentTransformation) === -1) {
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
     * @param {paper.Point} pivot - the pivot point that the selection rotates around. Defaults to (0,0)
     */
    build (args) {
        if(!args) args = {};
        if(!args.rotation) args.rotation = 0;
        if(!args.items) args.items = [];
        if(!args.pivot) args.pivot = new paper.Point();

        this._itemsInSelection = args.items;
        this._rotation = args.rotation;
        this._pivot = args.pivot;

        this._boundingBox = this._calculateBoundingBox();

        this.item.remove();
        this.item.removeChildren();

        if(this._ghost) {
            this._ghost.remove();
        }
        if(this._pivotPointHandle) {
            this._pivotPointHandle.remove();
        }

        if(this._itemsInSelection.length > 0) {
            this._buildGUI();
            this.layer.addChild(this.item);
        }
    }

    /**
     *
     */
    startTransformation (item) {
        this._ghost = this._buildGhost();
        this._layer.addChild(this._ghost);

        if(item.data.handleType === 'rotation') {
            this.currentTransformation = 'rotate';
        } else if (item.data.handleType === 'scale') {
            this.currentTransformation = 'scale';
        } else {
            this.currentTransformation = 'translate';
        }

        this._ghost.data.initialPosition = this._ghost.position;
    }

    /**
     *
     */
    updateTransformation (item, e) {
        if(this.currentTransformation === 'translate') {
            this._ghost.position = this._ghost.position.add(e.delta);
        } else if(this.currentTransformation === 'scale') {
            var lastPoint = e.point.subtract(e.delta);
            var currentPoint = e.point;
            var pivotToLastPointVector = lastPoint.subtract(this.pivot);
            var pivotToCurrentPointVector = currentPoint.subtract(this.pivot);
            pivotToLastPointVector.rotate(-this.rotation);
            pivotToCurrentPointVector.rotate(-this.rotation);
            var scaleAmt = pivotToCurrentPointVector.divide(pivotToLastPointVector);
            this._ghost.scale(scaleAmt, this.pivot);
        } else if (this.currentTransformation === 'rotate') {
            var lastPoint = e.point.subtract(e.delta);
            var currentPoint = e.point;
            var pivotToLastPointVector = lastPoint.subtract(this.pivot);
            var pivotToCurrentPointVector = currentPoint.subtract(this.pivot);
            var pivotToLastPointAngle = pivotToLastPointVector.angle;
            var pivotToCurrentPointAngle = pivotToCurrentPointVector.angle;
            var rotation = pivotToCurrentPointAngle - pivotToLastPointAngle;
            this._ghost.rotate(rotation, this.pivot);
            this.rotation += rotation;
        }
    }

    /**
     *
     */
    finishTransformation (item) {
        this._ghost.remove();

        if(this.currentTransformation === 'translate') {
            var d = this._ghost.position.subtract(this._ghost.data.initialPosition);
            this.translateSelection(d);
        } else if(this.currentTransformation === 'scale') {
            this.scaleSelection(this._ghost.scaling);
        } else if(this.currentTransformation === 'rotate') {
            this.rotateSelection(this._ghost.rotation);
        }

        this._currentTransformation = null;
    }

    /**
     *
     */
    translateSelection (delta) {
        this._itemsInSelection.forEach(item => {
            item.position = item.position.add(delta);
        });
    }

    /**
     *
     */
    scaleSelection (scale) {
        this._itemsInSelection.forEach(item => {
            item.rotate(-this.rotation, this.pivot);
            item.scale(scale, this.pivot);
            item.rotate(this.rotation, this.pivot);
        });
    }

    /**
     *
     */
    rotateSelection (angle) {
        this._itemsInSelection.forEach(item => {
            item.rotate(angle, this.pivot);
        });
    }

    _buildGUI () {
        this.item.addChild(this._buildBorder());

        if(this._itemsInSelection.length > 1) {
            this.item.addChildren(this._buildItemOutlines());
        }

        this.item.addChild(this._buildRotationHotspot('topLeft'));
        this.item.addChild(this._buildRotationHotspot('topRight'));
        this.item.addChild(this._buildRotationHotspot('bottomLeft'));
        this.item.addChild(this._buildRotationHotspot('bottomRight'));

        this.item.addChild(this._buildScalingHandle('topLeft'));
        this.item.addChild(this._buildScalingHandle('topRight'));
        this.item.addChild(this._buildScalingHandle('bottomLeft'));
        this.item.addChild(this._buildScalingHandle('bottomRight'));
        this.item.addChild(this._buildScalingHandle('topCenter'));
        this.item.addChild(this._buildScalingHandle('bottomCenter'));
        this.item.addChild(this._buildScalingHandle('leftCenter'));
        this.item.addChild(this._buildScalingHandle('rightCenter'));

        this._pivotPointHandle = this._buildPivotPointHandle();
        this.layer.addChild(this._pivotPointHandle);

        var center = this._calculateBoundingBoxOfItems(this._itemsInSelection).center;
        this.item.rotate(this.rotation, center);

        this.item.children.forEach(child => {
            child.data.isSelectionBoxGUI = true;
        });
    }

    _buildBorder () {
        var border = new paper.Path.Rectangle({
            name: 'border',
            from: this.boundingBox.topLeft,
            to: this.boundingBox.bottomRight,
            strokeWidth: SelectionWidget.BOX_STROKE_WIDTH,
            strokeColor: SelectionWidget.BOX_STROKE_COLOR,
            insert: false,
        });
        border.data.isBorder = true;
        return border;
    }

    _buildItemOutlines () {
        return [];//TODO replace
    }

    _buildScalingHandle (edge) {
        var handle = this._buildHandle({
            name: edge,
            type: 'scale',
            center: this.boundingBox[edge],
            fillColor: SelectionWidget.HANDLE_FILL_COLOR,
            strokeColor: SelectionWidget.HANDLE_STROKE_COLOR,
        });
        return handle;
    }

    _buildPivotPointHandle () {
        var handle = this._buildHandle({
            name: 'pivot',
            type: 'pivot',
            center: this.pivot,
            fillColor: SelectionWidget.PIVOT_FILL_COLOR,
            strokeColor: SelectionWidget.PIVOT_STROKE_COLOR,
        });
        return handle;
    }

    _buildHandle (args) {
        if(!args) console.error('_createHandle: args is required');
        if(!args.name) console.error('_createHandle: args.name is required');
        if(!args.type) console.error('_createHandle: args.type is required');
        if(!args.center) console.error('_createHandle: args.center is required');
        if(!args.fillColor) console.error('_createHandle: args.fillColor is required');
        if(!args.strokeColor) console.error('_createHandle: args.strokeColor is required');

        var circle = new paper.Path.Circle({
            center: args.center,
            radius: SelectionWidget.HANDLE_RADIUS / paper.view.zoom,
            strokeWidth: SelectionWidget.HANDLE_STROKE_WIDTH / paper.view.zoom,
            strokeColor: args.strokeColor,
            fillColor: args.fillColor,
            insert: false,
        });
        // Transform the handle a bit so it doesn't get squished when the selection box is scaled.
        circle.applyMatrix = false;
        //circle.scaling.x = 1 / this.scaleX;
        //circle.scaling.y = 1 / this.scaleY;
        circle.data.handleType = args.type;
        circle.data.handleEdge = args.name;
        return circle;
    }

    _buildRotationHotspot (cornerName) {
        // Build the not-yet-rotated hotspot, which starts out like this:

        //       |
        //       +---+
        //       |   |
        // ---+--+   |---
        //    |      |
        //    +------+
        //       |

        var r = SelectionWidget.ROTATION_HOTSPOT_RADIUS / paper.view.zoom;
        var hotspot = new paper.Path([
            new paper.Point(0,0),
            new paper.Point(0, r),
            new paper.Point(r, r),
            new paper.Point(r, -r),
            new paper.Point(-r, -r),
            new paper.Point(-r, 0),
        ]);
        hotspot.fillColor = SelectionWidget.ROTATION_HOTSPOT_FILLCOLOR;
        hotspot.position.x = this.boundingBox[cornerName].x;
        hotspot.position.y = this.boundingBox[cornerName].y;

        // Orient the rotation handles in the correct direction, even if the selection is flipped
        hotspot.rotate({
            'topRight': 0,
            'bottomRight': 90,
            'bottomLeft': 180,
            'topLeft': 270,
        }[cornerName]);
        //if(this.scaleX < 0) hotspot.scaling.x = -1;
        //if(this.scaleY < 0) hotspot.scaling.y = -1;

        // Transform the hotspots a bit so they doesn't get squished when the selection box is scaled.
        //hotspot.scaling.x = 1 / this.scaleX;
        //hotspot.scaling.y = 1 / this.scaleY;

        // Some metadata.
        hotspot.data.handleType = 'rotation';
        hotspot.data.handleEdge = cornerName;

        return hotspot;
    }

    _buildGhost () {
        var ghost = new paper.Group({
            insert: false,
            applyMatrix: false,
        });

        this._itemsInSelection.forEach(item => {
            var outline = (item instanceof paper.Raster || item instanceof paper.Group)
                ? new paper.Path.Rectangle(item.bounds)
                : item.clone();
            outline.remove();
            outline.fillColor = 'rgba(0,0,0,0)';
            outline.strokeColor = 'rgba(0,0,0,0.5)';
            outline.strokeWidth = 1;
            ghost.addChild(outline);
        })

        return ghost;
    }

    _calculateBoundingBox () {
        if(this._itemsInSelection.length === 0) {
            return new paper.Rectangle();
        }

        var center = this._calculateBoundingBoxOfItems(this._itemsInSelection).center;

        var itemsForBoundsCalc = this._itemsInSelection.map(item => {
            var clone = item.clone();
            clone.rotate(-this.rotation, center);
            clone.remove();
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
SelectionWidget.HANDLE_RADIUS = 5;
SelectionWidget.HANDLE_STROKE_WIDTH = SelectionWidget.BOX_STROKE_WIDTH
SelectionWidget.HANDLE_STROKE_COLOR = SelectionWidget.BOX_STROKE_COLOR
SelectionWidget.HANDLE_FILL_COLOR = 'rgba(255,255,255,0.3)';
SelectionWidget.PIVOT_STROKE_WIDTH = SelectionWidget.BOX_STROKE_WIDTH;
SelectionWidget.PIVOT_FILL_COLOR = 'rgba(255,255,255,0.5)';
SelectionWidget.PIVOT_STROKE_COLOR = 'rgba(0,0,0,1)';
SelectionWidget.PIVOT_RADIUS = SelectionWidget.HANDLE_RADIUS
SelectionWidget.ROTATION_HOTSPOT_RADIUS = 20;
SelectionWidget.ROTATION_HOTSPOT_FILLCOLOR = 'rgba(100,150,255,0.5)';

paper.PaperScope.inject({
    SelectionWidget: SelectionWidget,
});
