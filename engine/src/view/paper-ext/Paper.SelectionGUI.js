paper.SelectionGUI = class {
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

        // don't show rotation hotspots:
        //return 'rgba(255,0,0,0.0001)';
    }

    /**
     * Create a selection GUI.
     * @param {paper.Item[]} items - (required) the items to create a GUI around.
     * @param {object} transformation - (required) the transformation to apply to the selected items and to the GUI.
     */
    constructor (args) {
        if(!args) console.error('paper.SelectionGUI: args is required');
        if(!args.items) console.error('paper.SelectionGUI: args.items is required');
        if(!args.transformation) console.error('paper.SelectionGUI: args.transformation is required');
        if(!args.bounds) console.error('paper.SelectionGUI: args.bounds is required');

        this.items = args.items;
        this.transformation = args.transformation;
        this.bounds = args.bounds;

        this.item = new paper.Group({
            insert: false,
            applyMatrix: false,
        });
        this.item.addChild(this._createBorder());
    }

    /**
     * Destroy the GUI.
     */
    destroy () {
        this.item.remove();
    }

    _createBorder () {
        var border = new paper.Path.Rectangle({
            name: 'border',
            from: this.bounds.topLeft,
            to: this.bounds.bottomRight,
            strokeWidth: paper.SelectionGUI.BOX_STROKE_WIDTH,
            strokeColor: paper.SelectionGUI.BOX_STROKE_COLOR,
            insert: false,
        });
        border.data.isBorder = true;
        return border;
    }
}

paper.PaperScope.inject({
    SelectionGUI: paper.SelectionGUI,
});
