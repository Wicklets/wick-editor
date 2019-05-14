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

Wick.View.Selection = class extends Wick.View {
    /**
     * Create a new Selection view.
     */
    constructor () {
        super();

        this.layer = new this.paper.Layer();

        this._widget = new paper.SelectionWidget({
            layer: this.layer,
        });
        this.paper.project.selectionWidget = this._widget;
    }

    /**
     * The selection widget
     */
    get widget () {
        if(this.dirty) {
            this.dirty = false;
            this.render();
        }
        return this._widget;
    }

    /**
     *
     */
    applyChanges () {
        this.model.widgetRotation = this.widget.rotation;
        this.model.pivotPoint = {
            x: this.widget.pivot.x,
            y: this.widget.pivot.y,
        };
    }

    /**
     *
     */
    get x () {
        return this.widget.position.x;
    }

    set x (x) {
        this.widget.position = new paper.Point(x, this.widget.position.y);
    }

    /**
     *
     */
    get y () {
        return this.widget.position.y;
    }

    set y (y) {
        this.widget.position = new paper.Point(this.widget.position.x, y);
    }

    /**
     *
     */
    get width () {
        return this.widget.width;
    }

    set width (width) {
        this.widget.width = width;
    }

    /**
     *
     */
    get height () {
        return this.widget.height;
    }

    set height (height) {
        this.widget.height = height;
    }

    /**
     *
     */
    get rotation () {
        return this.widget.rotation;
    }

    set rotation (rotation) {
        this.widget.rotation = rotation;
        this.model.widgetRotation = rotation;
    }

    /**
     *
     */
    flipHorizontally () {
        this.widget.flipHorizontally();
    }

    /**
     *
     */
    flipVertically () {
        this.widget.flipVertically();
    }

    /**
     *
     */
    sendToBack () {
        paper.OrderingUtils.sendToBack(this._getSelectedObjectViews());
    }

    /**
     *
     */
    bringToFront () {
        paper.OrderingUtils.bringToFront(this._getSelectedObjectViews());
    }

    /**
     *
     */
    moveForwards () {
        paper.OrderingUtils.moveForwards(this._getSelectedObjectViews());
    }

    /**
     *
     */
    moveBackwards () {
        paper.OrderingUtils.moveBackwards(this._getSelectedObjectViews());
    }

    _renderSVG () {
        this._widget.build({
            boxRotation: this.model.widgetRotation,
            items: this._getSelectedObjectViews(),
            pivot: new paper.Point(this.model.pivotPoint.x, this.model.pivotPoint.y),
        });
    }

    _getSelectedObjectViews () {
        return this.model.getSelectedObjects('Canvas').map(object => {
            return object.view.item || object.view.group;
        });
    }

    _getSelectedObjectsBounds () {
        return this.widget._calculateBoundingBoxOfItems(this._getSelectedObjectViews());
    }
}
