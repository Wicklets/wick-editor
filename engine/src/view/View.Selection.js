/*
 * Copyright 2018 WICKLETS LLC
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
    constructor () {
        super();

        this._layer = new this.paper.Layer();

        this.paper.selection = new this.paper.Selection({
            items: [],
            layer: this._layer,
        });
    }

    get layer () {
        return this._layer;
    }

    render () {
        var project = this.model.project;

        this.paper.selection.finish();
        this.paper.selection = new this.paper.Selection({
            items: this._getViewsOfSelectedObjects(),
            layer: this._layer,
        });
    }

    selectionDidChange () {
        var newSelectedItems = this._getViewsOfSelectedObjects();
        var oldSelectedItems = this.paper.selection.items;

        return (newSelectedItems.length === 0 && oldSelectedItems.length === 0)
            || !this._arraysEqual(newSelectedItems, oldSelectedItems);
    }

    _getViewsOfSelectedObjects () {
        var project = this.model.project;

        var items = [];
        items = items.concat(project.selection.getSelectedObjects('Path').map(path => {
            return path.view.item;
        }));
        items = items.concat(project.selection.getSelectedObjects('Clip').map(clip => {
            return clip.view.group;
        }));
        return items;
    }

    // https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
    _arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
}
