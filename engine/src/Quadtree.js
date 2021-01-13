/*
 * Copyright 2020 WICKLETS LLC
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

/* Quadtree wrapper */
// this.quadtree: 
//   - quadtree-lib data structure (https://github.com/elbywan/quadtree-lib#readme) 
//   - elements in form {x, y, width, height, uuid, inTree}
// this.dirty:
//   - set of quadtree elements ({x, y, width, height, uuid, inTree})
// this.elements:
//   - dictionary of elements {uuid1: element1, uuid2: element2}
//   - these are the exact objects that go into this.quadtree by reference 
Wick.Quadtree = class {
    constructor (width, height) {
        this._quadtree = new Quadtree({width: width, height: height}); 
        this.dirty = new Set();
        this.elements = {};
    }

    get quadtree() {
        return this._quadtree;
    }

    clean() {
        // TODO quadtree see why this doesn't work
        // this._quadtree = this._quadtree.filter(function(element) {
        //     let clip = Wick.ObjectCache.getObjectByUUID(element.uuid);
        //     return clip.onScreen;
        // });
        let to_remove = [];
        this._quadtree.each(function(element) {
            let clip = Wick.ObjectCache.getObjectByUUID(element.uuid);
            if (!clip || !clip.onScreen) {
                to_remove.push(element);
                element.inTree = false;
            }
        });
        for (let i = 0; i < to_remove.length; i++) {
            this._quadtree.remove(to_remove[i]);
        }
    }

    resize(width, height) {
        this._quadtree.each(function(element) {
            this.dirty.add(element.uuid);
        });
        this._quadtree = new Quadtree({width: width, height: height});
    }
}
