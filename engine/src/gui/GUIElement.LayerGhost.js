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

Wick.GUIElement.LayerGhost = class extends Wick.GUIElement {
    /**
     *
     */
    constructor (model) {
        super(model);
        this.active = false;
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
    get x () {
        return this._x;
    }

    set x (x) {
        this._x = x;
    }

    /**
     *
     */
    get y () {
        return this._y;
    }

    set y (y) {
        this._y = y;
    }

    /**
     *
     */
    get width () {
        return this._width;
    }

    set width (width) {
        this._width = width;
    }

    /**
     *
     */
    get height () {
        return 0;
    }

    /**
     *
     */
    build () {
        super.build();

        if(!this.active) return;

        var layerGhostRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(this.x, this.y),
            to: new this.paper.Point(this.x + this.width, this.y + this.height),
            fillColor: 'rgba(0,0,0,0.1)',
            strokeColor: Wick.GUIElement.LAYER_LABEL_GHOST_COLOR,
            strokeWidth: 3,
        });
        this.item.position = this.position;

        this.item.addChild(layerGhostRect);
    }
}
