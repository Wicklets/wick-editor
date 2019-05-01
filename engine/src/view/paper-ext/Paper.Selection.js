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
        };

        this._bounds = this._getBoundsOfItems(this._items);

        this._gui = new paper.SelectionGUI({
            items: this._items,
            transformation: this._transformation,
            bounds: this._bounds,
        });
        this._layer.addChild(this._gui.item);
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
     * @param {boolean} applyTransformation - If set to true, will apply the current transformation to all selected items. Otherwise, the transformation will be scrapped and items will be unchanged.
     */
    finish (applyTransformation) {

    }

    /* helper function: calculate the bounds of the smallest rectangle that contains all given items. */
    _getBoundsOfItems (items) {
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
