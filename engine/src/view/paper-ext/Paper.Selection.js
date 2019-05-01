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

        paper.Selection._prepareItemsForSelection(this._items);

        this._gui = new paper.SelectionGUI({
            items: this._items,
            transformation: this._transformation,
            bounds: this._bounds,
        });
        this._layer.addChild(this._gui.item);

        paper.Selection._transformItems(this._items.concat(this._gui.item), this._transformation);
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
        return this._transformation;
    }

    /**
     * The bounds of selected items, i.e., the smallest rectangle that contains all items in the selection.
     * @type {paper.Rectangle}
     */
    get bounds () {
        return this._bounds;
    }

    /**
     * Finish and destroy the selection.
     * @param {boolean} discardTransformation - If set to true, will reset all items to their original transforms before the selection was made.
     */
    finish (discardTransformation) {
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
        // Reset applyMatrix to what is was before we added it to the selection
        items.filter(item => {
            return item instanceof paper.Path ||
                   item instanceof paper.CompoundPath;
        }).forEach(item => {
            if(item.data.originalMatrix && discardTransforms) {
                item.matrix.set(item.data.originalMatrix);
            }
            item.applyMatrix = true;
        });

        // Delete the matrix we stored in groups/rasters so it doesn't interfere with anything later
        items.filter(item => {
            return item instanceof paper.Group ||
                   item instanceof paper.Raster;
        }).forEach(item => {
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
