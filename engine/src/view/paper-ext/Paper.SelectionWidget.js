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
     * Build a new SelectionWidget GUI around some items.
     * @param {number} rotation - the rotation of the selection. Optional, defaults to 0
     * @param {paper.Item[]} items - the items to build the GUI around
     */
    build (args) {
        if(!args) args = {};
        if(!args.rotation) args.rotation = 0;
        if(!args.items) args.items = [];

        this._itemsInSelection = args.items;
        this._rotation = args.rotation;

        // TODO build.
    }
};

paper.PaperScope.inject({
    SelectionWidget: SelectionWidget,
});
