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

class Ordering {
    /**
     * Moves the selected items forwards.
     */
    moveForwards () {
        paper.Selection._sortItemsByLayer(this._items).forEach(items => {
            paper.Selection._sortItemsByZIndex(items).reverse().forEach(item => {
                if(item.nextSibling && this._items.indexOf(item.nextSibling) === -1) {
                    item.insertAbove(item.nextSibling);
                }
            });
        });
    }

    /**
     * Moves the selected items backwards.
     */
    moveBackwards () {
        paper.Selection._sortItemsByLayer(this._items).forEach(items => {
            paper.Selection._sortItemsByZIndex(items).forEach(item => {
                if(item.previousSibling && this._items.indexOf(item.previousSibling) === -1) {
                    item.insertBelow(item.previousSibling);
                }
            });
        });
    }

    /**
     * Brings the selected objects to the front.
     */
    bringToFront () {
        paper.Selection._sortItemsByLayer(this._items).forEach(items => {
            paper.Selection._sortItemsByZIndex(items).forEach(item => {
                item.bringToFront();
            });
        });
    }

    /**
     * Sends the selected objects to the back.
     */
    sendToBack () {
        paper.Selection._sortItemsByLayer(this._items).forEach(items => {
            paper.Selection._sortItemsByZIndex(items).reverse().forEach(item => {
                item.sendToBack();
            });
        });
    }

    /* helper function for ordering */
    static _sortItemsByLayer (items) {
        var layerLists = {};

        items.forEach(item => {
            // Create new list for the item's layer if it doesn't exist
            var layerID = item.layer.id;
            if(!layerLists[layerID]) {
                layerLists[layerID] = [];
            }

            // Add this item to its corresponding layer list
            layerLists[layerID].push(item);
        });

        // Convert id->array object to array of arrays
        var layerItemsArrays = [];
        for (var layerID in layerLists) {
            layerItemsArrays.push(layerLists[layerID])
        }
        return layerItemsArrays;
    }

    /* helper function for ordering */
    static _sortItemsByZIndex (items) {
        return items.sort(function (a,b) {
            return a.index - b.index;
        });
    }
};

paper.PaperScope.inject({
    Ordering: Ordering,
});
