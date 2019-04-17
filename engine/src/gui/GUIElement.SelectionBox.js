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

Wick.GUIElement.SelectionBox = class extends Wick.GUIElement {
    /**
     *
     */
    constructor (model) {
        super(model);

        this._active = false;

        this._start = new paper.Point(0,0);
        this._end = new paper.Point(0,0);
    }

    /**
     *
     */
    get active () {
        return this._active;
    }

    set active (active) {
        this._active = active;
    }

    /**
     *
     */
    get start () {
        return this._start;
    }

    set start (start) {
        this._start = start;
    }

    /**
     *
     */
    get end () {
        return this._end;
    }

    set end (end) {
        this._end = end;
    }

    /**
     *
     */
    touches (item) {
        return this.item.bounds.intersects(item.bounds)
            || this.item.bounds.contains(item.bounds);
    }

    /**
     *
     */
    build () {
        super.build();

        if(this.active) {
            var frameRect = new this.paper.Path.Rectangle({
                from: this.start,
                to: this.end,
                fillColor: '#aaccff',
                strokeColor: '#0000ff',
                opacity: 0.3,
            });
            this.item.addChild(frameRect);
        }
    }
}
