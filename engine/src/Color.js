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

/* Small utility class for colors. */
Wick.Color = class {
    /**
     * Creates a Transformation.
     * @param {string} color - (Optional) Hex or Rgba color to create a Wick.Color from.
     */
    constructor (color) {
        if(color) {
            this._color = new paper.Color(color);
        } else {
            this._color = new paper.Color();
        }
    }

    /**
     *
     */
    get r () {
        return this._color.red;
    }

    set r (r) {
        this._color.red = r;
    }

    /**
     *
     */
    get g () {
        return this._color.green;
    }

    set g (g) {
        this._color.green = g;
    }

    /**
     *
     */
    get b () {
        return this._color.blue;
    }

    set b (b) {
        this._color.blue = b;
    }

    /**
     *
     */
    get a () {
        return this._color.alpha;
    }

    set a (a) {
        this._color.alpha = a;
    }

    /**
     *
     */
    get hex () {
        return this._color.toCSS(true);
    }

    /**
     *
     */
    get rgba () {
        return this._color.toCSS();
    }

    /**
     *
     */
    add (color) {
        var newColor = new Wick.Color();
        newColor.r = this.r + color.r;
        newColor.g = this.g + color.g;
        newColor.b = this.b + color.b;
        return newColor;
    }

    /**
     *
     */
    multiply (n) {
        var newColor = new Wick.Color();
        newColor.r = this.r * n;
        newColor.g = this.g * n;
        newColor.b = this.b * n;
        return newColor;
    }

    /**
     *
     */
    static average (a, b) {
        return a.multiply(0.5).add(b.multiply(0.5));
    }
}
