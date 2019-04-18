/*
 * Copyright 2018 WICKLETS LLC
 *
 * This file is part of Paper.js-drawing-tools.
 *
 * Paper.js-drawing-tools is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Paper.js-drawing-tools is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Paper.js-drawing-tools.  If not, see <https://www.gnu.org/licenses/>.
 */

paper.SelectionBox = class {
    /*
     *
     */
    constructor (paperContext) {
        this.paper = paperContext;

        this._start = new this.paper.Point();
        this._end = new this.paper.Point();
        this._items = [];
        this._active = false;
        this._box = new this.paper.Path.Rectangle({insert:false});
        this._mode = 'intersects';
    }

    /*
     *
     */
    start (point) {
        this._active = true;
        this._start = point;
        this._end = point;
        this._rebuildBox();
    }

    /*
     *
     */
    drag (point) {
        this._end = point;
        this._rebuildBox();
    }

    /*
     *
     */
    end (point) {
        this._end = point;
        this._active = false;

        this._rebuildBox();
        this._box.remove();

        this._items = this._itemsInBox(this._box);
    }

    /*
     *
     */
    get items () {
        return this._items;
    }

    /*
     *
     */
    get active () {
        return this._active;
    }

    /*
     *
     */
    get mode () {
        return this._mode;
    }

    set mode (mode) {
        if(mode !== 'contains' && mode !== 'intersects') {
            throw new Error("SelectionBox.mode: invalid mode");
        }
        this._mode = mode;
    }

    _rebuildBox () {
        this._box.remove();
        this._box = new this.paper.Path.Rectangle({
            from: this._start,
            to: this._end,
            strokeWidth: 1,
            strokeColor: 'black',
        });
    }

    _itemsInBox (box) {
        var checkItems = [];
        this._getSelectableLayers().forEach(layer => {
            layer.children.forEach(child => {
                checkItems.push(child);
            });
        });

        var items = [];
        checkItems.forEach(item => {
            if(this.mode === 'contains') {
                if(this._box.bounds.contains(item.bounds)) {
                    items.push(item);
                }
            } else if (this.mode === 'intersects') {
                if(this._shapesIntersect(item, this._box)) {
                    items.push(item);
                }
            }
        });

        return items;
    }

    _shapesIntersect (itemA, itemB) {
        if(itemA instanceof this.paper.Group) {
            var intersects = false;
            var itemBClone = itemB.clone();
            itemBClone.transform(itemA.matrix.inverted());
            itemA.children.forEach(child => {
                if(!intersects && this._shapesIntersect(child, itemBClone)) {
                    intersects = true;
                }
            });
            return intersects;
        } else {
            var shapesDoIntersect = itemB.intersects(itemA);
            var boundsContain = itemB.bounds.contains(itemA.bounds);
            if(shapesDoIntersect || boundsContain) {
                return true;
            }
        }
    }

    _getSelectableLayers () {
        var self = this;
        return this.paper.project.layers.filter(layer => {
            return !layer.locked;
        });
    }
};

paper.PaperScope.inject({
    SelectionBox: paper.SelectionBox,
});
