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
        this.model.rotation = this.widget.rotation;
    }

    _renderSVG () {
        this._widget.build({
            rotation: this.model.rotation,
            items: this._getSelectedObjectViews(),
            pivot: null,
        });
    }

    _getSelectedObjectViews () {
        return this.model.getSelectedObjects('Canvas').map(object => {
            return object.view.item || object.view.group;
        });
    }
}
