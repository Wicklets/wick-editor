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

    /**
     *
     */
    get g () {
        return this._color.green;
    }

    /**
     *
     */
    get b () {
        return this._color.blue;
    }

    /**
     *
     */
    get a () {
        return this._color.alpha;
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
}
