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

Wick.GUIElement.CreateLayerLabel = class extends Wick.GUIElement.Clickable {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.on('mouseOver', () => {
            this.build();
        });

        this.on('mouseDown', () => {
            var layer = new Wick.Layer();
            this.model.project.activeTimeline.addLayer(layer);
            layer.activate();
            this.model.project.selection.clear();
            this.model.project.selection.select(layer);
            this.model.project.guiElement.build();
            this.model.project.guiElement.fire('projectModified');
        });

        this.on('mouseLeave', () => {
            this.build();
        });
    }

    /**
     *
     */
    get index () {
        return this._index;
    }

    set index (index) {
        this._index = index;
    }

    /**
     *
     */
    get x () {
        return Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES;
    }

    /**
     *
     */
    get y () {
        return this.index * this.gridCellHeight + Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM;
    }

    /**
     *
     */
    get width () {
        return this._width - Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES*2;
    }

    set width (width) {
        this._width = width;
    }

    /**
     *
     */
    get height () {
        return this.gridCellHeight - Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM*2;
    }

    /**
     *
     */
    build () {
        super.build();

        var layerRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(0, 0),
            to: new this.paper.Point(this.width, this.height),
            fillColor: this.isHoveredOver ? '#ff0000' : 'rgba(255,255,255,0.3)',
            radius: 2,
        });
        this.item.addChild(layerRect);

        this.item.position = new paper.Point(this.x, this.y);
    }
}
