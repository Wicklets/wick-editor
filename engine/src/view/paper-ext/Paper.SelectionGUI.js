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

 /**
  * This is a utility class for creating a selection box GUI. this will give you:
  *  - a bounding box
  *  - handles for scaling
  *  - hotspots for rotating
  *  - ...and much more!
  */

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
        return paper.SelectionGUI.BOX_STROKE_WIDTH;
    }

    static get HANDLE_STROKE_COLOR () {
        return paper.SelectionGUI.BOX_STROKE_COLOR;
    }

    static get HANDLE_FILL_COLOR () {
        return 'rgba(255,255,255,0.3)';
    }

    static get PIVOT_STROKE_WIDTH () {
        return paper.SelectionGUI.BOX_STROKE_WIDTH;
    }

    static get PIVOT_FILL_COLOR () {
        return 'rgba(255,255,255,0.5)';
    }

    static get PIVOT_STROKE_COLOR () {
        return 'rgba(0,0,0,1)';
    }

    static get PIVOT_RADIUS () {
        return paper.SelectionGUI.HANDLE_RADIUS;
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
            applyMatrix: true,
        });

        this.item.addChild(this._createBorder());

        if(this.items.length > 1) {
            this.item.addChildren(this._createItemOutlines());
        }

        this.item.addChild(this._createRotationHotspot('topLeft'));
        this.item.addChild(this._createRotationHotspot('topRight'));
        this.item.addChild(this._createRotationHotspot('bottomLeft'));
        this.item.addChild(this._createRotationHotspot('bottomRight'));

        this.item.addChild(this._createScalingHandle('topLeft'));
        this.item.addChild(this._createScalingHandle('topRight'));
        this.item.addChild(this._createScalingHandle('bottomLeft'));
        this.item.addChild(this._createScalingHandle('bottomRight'));
        this.item.addChild(this._createScalingHandle('topCenter'));
        this.item.addChild(this._createScalingHandle('bottomCenter'));
        this.item.addChild(this._createScalingHandle('leftCenter'));
        this.item.addChild(this._createScalingHandle('rightCenter'));

        this.item.addChild(this._createOriginPointHandle());

        // Set a flag just so we don't accidentily treat these GUI elements as actual paths...
        this.item.children.forEach(child => {
            child.data.isSelectionBoxGUI = true;
        });
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

    _createItemOutlines () {
        return this.items.map(item => {
            var itemForBounds = item.clone({insert:false});

            var outline = new paper.Path.Rectangle(itemForBounds.bounds);
            outline.fillColor = 'rgba(0,0,0,0)';
            outline.strokeColor = paper.SelectionGUI.BOX_STROKE_COLOR;
            outline.strokeWidth = paper.SelectionGUI.BOX_STROKE_WIDTH;
            outline.data.isBorder = true;
            return outline;
        });
    }

    _createScalingHandle (edge) {
        return this._createHandle({
            name: edge,
            type: 'scale',
            center: this.bounds[edge],
            fillColor: paper.SelectionGUI.HANDLE_FILL_COLOR,
            strokeColor: paper.SelectionGUI.HANDLE_STROKE_COLOR,
        });
    }

    _createOriginPointHandle () {
        return this._createHandle({
            name: 'pivot',
            type: 'pivot',
            center: new paper.Point(this.transformation.originX, this.transformation.originY),
            fillColor: paper.SelectionGUI.PIVOT_FILL_COLOR,
            strokeColor: paper.SelectionGUI.PIVOT_STROKE_COLOR,
        });
    }

    _createHandle (args) {
        if(!args) console.error('_createHandle: args is required');
        if(!args.name) console.error('_createHandle: args.name is required');
        if(!args.type) console.error('_createHandle: args.type is required');
        if(!args.center) console.error('_createHandle: args.center is required');
        if(!args.fillColor) console.error('_createHandle: args.fillColor is required');
        if(!args.strokeColor) console.error('_createHandle: args.strokeColor is required');

        var circle = new paper.Path.Circle({
            center: args.center,
            radius: paper.SelectionGUI.HANDLE_RADIUS / paper.view.zoom,
            strokeWidth: paper.SelectionGUI.HANDLE_STROKE_WIDTH / paper.view.zoom,
            strokeColor: args.strokeColor,
            fillColor: args.fillColor,
            insert: false,
        });
        // Transform the handle a bit so it doesn't get squished when the selection box is scaled.
        circle.applyMatrix = false;
        circle.scaling.x = 1 / this.transformation.scaleX;
        circle.scaling.y = 1 / this.transformation.scaleY;
        circle.data.handleType = args.type;
        circle.data.handleEdge = args.name;
        return circle;
    }

    _createRotationHotspot (cornerName) {
        // Build the not-yet-rotated hotspot, which starts out like this:

        //       |
        //       +---+
        //       |   |
        // ---+--+   |---
        //    |      |
        //    +------+
        //       |

        var r = paper.SelectionGUI.ROTATION_HOTSPOT_RADIUS / paper.view.zoom;
        var hotspot = new paper.Path([
            new paper.Point(0,0),
            new paper.Point(0, r),
            new paper.Point(r, r),
            new paper.Point(r, -r),
            new paper.Point(-r, -r),
            new paper.Point(-r, 0),
        ]);
        hotspot.fillColor = paper.SelectionGUI.ROTATION_HOTSPOT_FILLCOLOR;
        hotspot.position.x = this.bounds[cornerName].x;
        hotspot.position.y = this.bounds[cornerName].y;

        // Orient the rotation handles in the correct direction, even if the selection is flipped
        hotspot.rotate({
            'topRight': 0,
            'bottomRight': 90,
            'bottomLeft': 180,
            'topLeft': 270,
        }[cornerName]);
        if(this.transformation.scaleX < 0) hotspot.scaling.x = -1;
        if(this.transformation.scaleY < 0) hotspot.scaling.y = -1;

        // Transform the hotspots a bit so they doesn't get squished when the selection box is scaled.
        hotspot.scaling.x = 1 / this.transformation.scaleX;
        hotspot.scaling.y = 1 / this.transformation.scaleY;

        // Some metadata.
        hotspot.data.handleType = 'rotation';
        hotspot.data.handleEdge = cornerName;

        return hotspot;
    }
}

paper.PaperScope.inject({
    SelectionGUI: paper.SelectionGUI,
});
