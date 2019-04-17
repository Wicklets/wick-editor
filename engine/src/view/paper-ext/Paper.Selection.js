paper.Selection = class {
    static get BOX_STROKE_WIDTH () {
        return 1;
    }

    static get BOX_STROKE_COLOR () {
        return 'rgba(100,150,255,1.0)';
    }

    static get HANDLE_RADIUS () {
        return 5;
    }

    static get HANDLE_STROKE_WIDTH () {
        return paper.Selection.BOX_STROKE_WIDTH;
    }

    static get HANDLE_STROKE_COLOR () {
        return paper.Selection.BOX_STROKE_COLOR;
    }

    static get HANDLE_FILL_COLOR () {
        return 'rgba(255,255,255,0.3)';
    }

    static get PIVOT_STROKE_WIDTH () {
        return paper.Selection.BOX_STROKE_WIDTH;
    }

    static get PIVOT_FILL_COLOR () {
        return 'rgba(0,0,0,0)';
    }

    static get PIVOT_STROKE_COLOR () {
        return 'rgba(0,0,0,1)';
    }

    static get PIVOT_RADIUS () {
        return paper.Selection.HANDLE_RADIUS;
    }

    static get ROTATION_HOTSPOT_RADIUS () {
        return 20;
    }

    static get ROTATION_HOTSPOT_FILLCOLOR () {
        return 'rgba(100,150,255,0.5)';

        // don't show hotspots:
        //return 'rgba(255,0,0,0.0001)';
    }

    /**
     * Create a new selection.
     * Arguments:
     *  - layer: the layer to add the selection GUI to
     *  - items: the items to select
     * @param {object} args - Arguments for the selection.
     */
    constructor (args) {
        args = args || {};

        this._layer = args.layer || paper.project.activeLayer;
        this._items = args.items || [];
        this._box = new paper.Group();
        this._matrix = new paper.Matrix();
        this._pivotPoint = new paper.Point();
        this._transform = {
            x: 0,
            y: 0,
            scaleX: 1.0,
            scaleY: 1.0,
            rotation: 0,
        };
        this._handleDragMode = 'scale';

        // Default pivot point is the center of all items.
        this._pivotPoint = this._boundsOfItems(this._items).center;

        // It simplifies everything if we force applyMatrix=false on everything before doing any transforms.
        // We need to save the old data that we may lose, though.
        this._items.forEach(item => {
            item.data.originalMatrix = item.matrix.clone();
            item.applyMatrix = false;
        });

        if(this._items.length === 1) {
            var item = this._items[0];

            // Single item: Use the origin as the pivot point if its a group.
            if(item instanceof paper.Group || item instanceof paper.Raster) {
                this._pivotPoint = item.position;
            }

            // Single item: Use all transforms of the single item as the selection transforms
            this.rotation = item.rotation;
            item.rotation = 0;
            item.data.originalMatrix = item.matrix.clone();
        } else {
            // No items: We don't have to do anything
        }

        this._render();
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
     *
     */
    get box () {
        return this._box;
    }

    /**
     *
     */
    get items () {
        return this._items;
    }

    /**
     *
     */
    get x () {
        return this.topLeft.x;
    }

    set x (x) {
        var d = x - this.x;
        this._transform.x += d;
        this._render();
    }

    /**
     *
     */
    get y () {
        return this.topLeft.y;
    }

    set y (y) {
        var d = y - this.y;
        this._transform.y += d;
        this._render();
    }

    /**
     *
     */
    get rotation () {
        return this._transform.rotation;
    }

    set rotation (rotation) {
        var d = rotation - this._transform.rotation;
        this._transform.rotation += d;
        this._render();
    }

    /**
     *
     */
    get scaleX () {
        return this._transform.scaleX;
    }

    set scaleX (scaleX) {
        var d = scaleX / this._transform.scaleX;
        this._transform.scaleX *= d;
        this._render();
    }

    /**
     *
     */
    get scaleY () {
        return this._transform.scaleY;
    }

    set scaleY (scaleY) {
        var d = scaleY / this._transform.scaleY;
        this._transform.scaleY *= d;
        this._render();
    }

    /**
     *
     */
    get width () {
        return this._bounds.width * this.scaleX;
    }

    set width (width) {
        this.scaleX = width / this._bounds.width;
    }

    /**
     *
     */
    get height () {
        return this._bounds.height * this.scaleY;
    }

    set height (height) {
        this.scaleY = height / this._bounds.height;
    }

    /**
     *
     */
    get strokeWidth () {
        return this._getUniqueProperties('strokeWidth');
    }

    set strokeWidth (strokeWidth) {
        this._items.forEach(item => {
            item.strokeWidth = strokeWidth;
        });
    }

    /**
     *
     */
    get strokeColor () {
        return this._getUniqueProperties('strokeColor', color => {
            return color.toCSS();
        });
    }

    set strokeColor (strokeColor) {
        this._items.forEach(item => {
            item.strokeColor = strokeColor;
        });
    }

    /**
     *
     */
    get fillColor () {
        return this._getUniqueProperties('fillColor', color => {
            return color.toCSS();
        });
    }

    set fillColor (fillColor) {
        this._items.forEach(item => {
            item.fillColor = fillColor;
        });
    }

    /**
     *
     */
    get opacity () {
        return this._getUniqueProperties('opacity');
    }

    set opacity (opacity) {
        this._items.forEach(item => {
            item.opacity = opacity;
        });
    }

    /**
     *
     */
    get fontSize () {
        return this._getUniqueProperties('fontSize');
    }

    set fontSize (fontSize) {
        this._items.forEach(item => {
            item.fontSize = fontSize;
        });
    }

    /**
     *
     */
    get fontFamily () {
        return this._getUniqueProperties('fontFamily');
    }

    set fontFamily (fontFamily) {
        this._items.forEach(item => {
            item.fontFamily = fontFamily;
        });
    }

    /**
     *
     */
    get topLeft () {
        return this._getHandlePosition('topLeft');
    }

    set topLeft (topLeft) {
        this._setHandlePosition('topLeft', topLeft);
    }

    /**
     *
     */
    get topRight () {
        return this._getHandlePosition('topRight');
    }

    set topRight (topRight) {
        this._setHandlePosition('topRight', topRight);
    }

    /**
     *
     */
    get bottomLeft () {
        return this._getHandlePosition('bottomLeft');
    }

    set bottomLeft (bottomLeft) {
        this._setHandlePosition('bottomLeft', bottomLeft);
    }

    /**
     *
     */
    get bottomRight () {
        return this._getHandlePosition('bottomRight');
    }

    set bottomRight (bottomRight) {
        this._setHandlePosition('bottomRight', bottomRight);
    }

    /**
     *
     */
    get topCenter () {
        return this._getHandlePosition('topCenter');
    }

    set topCenter (topCenter) {
        this._setHandlePosition('topCenter', topCenter);
    }

    /**
     *
     */
    get bottomCenter () {
        return this._getHandlePosition('bottomCenter');
    }

    set bottomCenter (bottomCenter) {
        this._setHandlePosition('bottomCenter', bottomCenter);
    }

    /**
     *
     */
    get leftCenter () {
        return this._getHandlePosition('leftCenter');
    }

    set leftCenter (leftCenter) {
        this._setHandlePosition('leftCenter', leftCenter);
    }

    /**
     *
     */
    get rightCenter () {
        return this._getHandlePosition('rightCenter');
    }

    set rightCenter (rightCenter) {
        this._setHandlePosition('rightCenter', rightCenter);
    }

    /**
     *
     */
    get center () {
        return this._box.bounds.center;
    }

    /**
     * The point that all transformations will use as their origin.
     */
    get pivotPoint () {
      return this._pivotPoint;
    }

    set pivotPoint (pivotPoint) {
        this._pivotPoint = pivotPoint;
        this._render();
    }

    /**
     * Flip the selected items horizontally.
     */
    flipHorizontally () {
        this._transform.scaleX *= -1;
        this._render();
    }

    /**
     * Flip the selected items vertically.
     */
    flipVertically () {
        this._transform.scaleY *= -1;
        this._render();
    }

    /**
     * Move all selected items to be behind all other objects.
     */
    sendToBack () {
        this._getSelectedItemsSortedByZIndex().reverse().forEach(item => {
            item.sendToBack();
        });
    }

    /**
     * Move all selected items to be in front of all other objects.
     */
    bringToFront () {
        this._getSelectedItemsSortedByZIndex().forEach(item => {
            item.bringToFront();
        });
    }

    /**
     * Move all selected items backwards one place.
     */
    moveBackwards () {
        this._getSelectedItemsSortedByZIndex().reverse().forEach(item => {
            if(item.previousSibling && this._items.indexOf(item.previousSibling) === -1) {
                item.insertBelow(item.previousSibling);
            }
        });
    }

    /**
     * Move all selected items forwards one place.
     */
    moveForwards () {
        this._getSelectedItemsSortedByZIndex().forEach(item => {
            if(item.nextSibling && this._items.indexOf(item.nextSibling) === -1) {
                item.insertAbove(item.nextSibling);
            }
        });
    }

    /**
     * Destroy the selection and apply the selection transformations.
     */
    finish () {
        // Do some cleanup.
        // Reset applyMatrix to what is was before we added it to the selection
        this._items.filter(item => {
            return item instanceof paper.Path ||
                   item instanceof paper.CompoundPath;
        }).forEach(item => {
            item.applyMatrix = true;
        });

        // Delete the matrix we stored in groups/rasters so it doesn't interfere with anything later
        this._items.filter(item => {
            return item instanceof paper.Group ||
                   item instanceof paper.Raster;
        }).forEach(item => {
            delete item.data.originalMatrix;
        });

        this._box.remove();
    }

    /**
     * Check if an item is selected.
     * @param {Item} item - the item to check selection of
     */
    isItemSelected (item) {
        return this._items.indexOf(item) > -1;
    }

    _render () {
        // Reset all transforms of all items.
        this._items.forEach(item => {
            item.matrix.set(item.data.originalMatrix);
        });

        // Recalculate bounds, we need this to generate the new box GUI
        this._bounds = this._boundsOfItems(this._items);

        // Build the new matrix based on the new selection transforms, apply it to selection
        this._matrix = new paper.Matrix();
        this._matrix.translate(this._pivotPoint);
        this._matrix.translate(this._transform.x, this._transform.y);
        this._matrix.rotate(this._transform.rotation);
        this._matrix.scale(this._transform.scaleX, this._transform.scaleY);
        this._matrix.translate(new paper.Point(0,0).subtract(this._pivotPoint));
        this._items.forEach(item => {
            item.matrix.prepend(this._matrix);
        });

        // Regen box GUI
        this._box.remove();
        this._box = this._generateBox();
        this._box.matrix.prepend(this._matrix);
    }

    _generateBox () {
        var box = new paper.Group({insert:false});

        // No items - don't even put anything in the box, we don't need to
        if(this.items.length === 0) return box;

        this._layer.addChild(box);

        box.addChild(this._generateBorder());
        if(this.items.length > 1) {
            box.addChildren(this._generatePathOutlines());
            box.addChildren(this._generateGroupOutlines());
        }
        box.addChild(this._generateRotationHotspot('topLeft'));
        box.addChild(this._generateRotationHotspot('topRight'));
        box.addChild(this._generateRotationHotspot('bottomLeft'));
        box.addChild(this._generateRotationHotspot('bottomRight'));
        box.addChild(this._generateScalingHandle('topLeft'));
        box.addChild(this._generateScalingHandle('topRight'));
        box.addChild(this._generateScalingHandle('bottomLeft'));
        box.addChild(this._generateScalingHandle('bottomRight'));
        box.addChild(this._generateScalingHandle('topCenter'));
        box.addChild(this._generateScalingHandle('bottomCenter'));
        box.addChild(this._generateScalingHandle('leftCenter'));
        box.addChild(this._generateScalingHandle('rightCenter'));
        box.addChild(this._generatePivotPointHandle());

        // Set a flag just so we don't accidentily treat these GUI elements as actual paths...
        box.children.forEach(child => {
            child.data.isSelectionBoxGUI = true;
        });

        box.applyMatrix = true;

        return box;
    }

    _generateBorder () {
        var border = new paper.Path.Rectangle({
            name: 'border',
            from: this._bounds.topLeft,
            to: this._bounds.bottomRight,
            strokeWidth: paper.Selection.BOX_STROKE_WIDTH,
            strokeColor: paper.Selection.BOX_STROKE_COLOR,
            insert: false,
        });
        border.data.isBorder = true;
        return border;
    }

    _generatePathOutlines () {
        return this._items.filter(item => {
            return item instanceof paper.Path ||
                   item instanceof paper.CompoundPath;
        }).map(item => {
            var itemForBounds = item.clone({insert:false});
            itemForBounds.matrix.set(new paper.Matrix());

            var outline = new paper.Path.Rectangle(itemForBounds.bounds);
            outline.fillColor = 'rgba(0,0,0,0)';
            outline.strokeColor = paper.Selection.BOX_STROKE_COLOR;
            outline.strokeWidth = paper.Selection.BOX_STROKE_WIDTH;
            outline.data.isBorder = true;
            return outline;
        });
    }

    _generateGroupOutlines () {
        return this._items.filter(item => {
            return item instanceof paper.Group ||
                   item instanceof paper.Raster;
        }).map(item => {
            var itemForBounds = item.clone({insert:false});
            itemForBounds.matrix.set(item.data.originalMatrix);

            var outline = new paper.Path.Rectangle(itemForBounds.bounds);
            outline.fillColor = 'rgba(0,0,0,0)';
            outline.strokeColor = paper.Selection.BOX_STROKE_COLOR;
            outline.strokeWidth = paper.Selection.BOX_STROKE_WIDTH;
            outline.data.isBorder = true;
            return outline;
        });
    }

    _generateScalingHandle (edge) {
        return this._generateHandle(
            edge,
            'scale',
            this._bounds[edge],
            paper.Selection.HANDLE_FILL_COLOR,
            paper.Selection.HANDLE_STROKE_COLOR,
        );
    }

    _generatePivotPointHandle () {
        return this._generateHandle(
            'pivot',
            'pivot',
            this._pivotPoint,
            paper.Selection.PIVOT_FILL_COLOR,
            paper.Selection.PIVOT_STROKE_COLOR,
        );
    }

    _generateHandle (name, type, center, fillColor, strokeColor) {
        var circle = new paper.Path.Circle({
            center: center,
            radius: paper.Selection.HANDLE_RADIUS / paper.view.zoom,
            strokeWidth: paper.Selection.HANDLE_STROKE_WIDTH / paper.view.zoom,
            strokeColor: strokeColor,
            fillColor: fillColor,
            insert: false,
        });
        // Transform the handle a bit so it doesn't get squished when the selection box is scaled.
        circle.applyMatrix = false;
        circle.scaling.x = 1/this._transform.scaleX;
        circle.scaling.y = 1/this._transform.scaleY;
        circle.data.handleType = type;
        circle.data.handleEdge = name;
        return circle;
    }

    _generateRotationHotspot (cornerName) {
        var r = paper.Selection.ROTATION_HOTSPOT_RADIUS / paper.view.zoom;
        var hotspot = new paper.Path([
            new paper.Point(0,0),
            new paper.Point(0, r),
            new paper.Point(r, r),
            new paper.Point(r, -r),
            new paper.Point(-r, -r),
            new paper.Point(-r, 0),
        ]);
        hotspot.fillColor = paper.Selection.ROTATION_HOTSPOT_FILLCOLOR;
        hotspot.position.x = this._bounds[cornerName].x;
        hotspot.position.y = this._bounds[cornerName].y;
        hotspot.rotate({
            'topRight': 0,
            'bottomRight': 90,
            'bottomLeft': 180,
            'topLeft': 270,
        }[cornerName]);
        if(this._transform.scaleX < 0) hotspot.scaling.x = -1;
        if(this._transform.scaleY < 0) hotspot.scaling.y = -1;
        hotspot.data.handleType = 'rotation';
        hotspot.data.handleEdge = cornerName;

        // Transform the hotspots a bit so they doesn't get squished when the selection box is scaled.
        hotspot.scaling.x = 1/this._transform.scaleX;
        hotspot.scaling.y = 1/this._transform.scaleY;

        return hotspot;
    }

    _getUniqueProperties (propName, applyFn) {
        var props = this._items.map(item => {
            return item[propName];
        }).filter(prop => {
            return prop !== undefined && prop !== null;
        }).map(applyFn || (prop => {return prop}));

        var uniqueProps = [...new Set(props)];

        if(!uniqueProps) return null;
        if(uniqueProps.length === 0) return null;
        if(uniqueProps.length === 1) return uniqueProps[0];
        return uniqueProps;
    }

    _boundsOfItems (items) {
        if(items.length === 0)
            return new paper.Rectangle();

        var bounds = null;
        items.forEach(item => {
            bounds = bounds ? bounds.unite(item.bounds) : item.bounds;
        });

        return bounds;
    }

    _getHandlePosition (handleName) {
        var child = this.box.children.find(c => {
            return c.data.handleEdge === handleName;
        });
        if(!child) {
          return new paper.Point();
        } else {
          return child.position;
        }
    }

    _setHandlePosition (handleName, position) {
        if(this._handleDragMode === 'scale') {
            this._setHandlePositionAndScale(handleName, position);
        } else if (this._handleDragMode === 'rotation') {
            this._setHandlePositionAndRotate(handleName, position);
        }
    }

    _setHandlePositionAndScale (handleName, position) {
        var lockYScale = handleName === 'leftCenter'
                      || handleName === 'rightCenter';
        var lockXScale = handleName === 'bottomCenter'
                      || handleName === 'topCenter';

        if(!lockXScale) this._transform.scaleX = 1;
        if(!lockYScale) this._transform.scaleY = 1;

        var rotation = this._transform.rotation;
        var x = this._transform.x;
        var y = this._transform.y;

        this._transform.rotation = 0;
        this._transform.x = 0;
        this._transform.y = 0;
        this._render();

        var translatedPosition = position.subtract(new paper.Point(x,y));
        var rotatedPosition = translatedPosition.rotate(-rotation, this._pivotPoint);

        var distFromHandle = rotatedPosition.subtract(this[handleName]);
        var widthHeight = this[handleName].subtract(this._pivotPoint);
        var newCornerPosition = distFromHandle.add(widthHeight);
        var scaleAmt = newCornerPosition.divide(widthHeight);

        if(!lockXScale) this._transform.scaleX = scaleAmt.x;
        if(!lockYScale) this._transform.scaleY = scaleAmt.y;
        this._transform.rotation = rotation;
        this._transform.x = x;
        this._transform.y = y;

        this._render();
    }

    _setHandlePositionAndRotate (handleName, position) {
        var x = this._transform.x;
        var y = this._transform.y;

        this._transform.rotation = 0;
        this._transform.x = 0;
        this._transform.y = 0;
        this._render();

        var orig_angle = this[handleName].subtract(this._pivotPoint).angle;
        position = position.subtract(new paper.Point(x,y));
        var angle = position.subtract(this._pivotPoint).angle;

        this._transform.x = x;
        this._transform.y = y;
        this._transform.rotation = angle - orig_angle;

        this._render();
    }

    _getOppositeHandleName (handleName) {
        return {
            'topLeft' : 'bottomRight',
            'topRight' : 'bottomLeft',
            'bottomRight' : 'topLeft',
            'bottomLeft' : 'topRight',
            'bottomCenter' : 'topCenter',
            'topCenter' : 'bottomCenter',
            'leftCenter' : 'rightCenter',
            'rightCenter' : 'leftCenter',
        }[handleDir];
    }

    _getSelectedItemsSortedByZIndex () {
        return this._items.sort(function (a,b) {
            return a.index - b.index;
        });
    }
}

paper.PaperScope.inject({
  Selection: paper.Selection,
});
