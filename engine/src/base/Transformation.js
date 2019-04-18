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

/** Class representing a transformation. */
Wick.Transformation = class extends Wick.Base {
    /**
     * Creates a Transformation.
     * @param {number} x - 
     * @param {number} y - 
     * @param {number} scaleX - 
     * @param {number} scaleY - 
     * @param {number} rotation -
     * @param {number} opacity -  
     */
    constructor (x, y, scaleX, scaleY, rotation, opacity) {
        super();

        this.x = x === undefined ? 0 : x;
        this.y = y === undefined ? 0 : y;
        this.scaleX = scaleX === undefined ? 1 : scaleX;
        this.scaleY = scaleY === undefined ? 1 : scaleY;
        this.rotation = rotation === undefined ? 0 : rotation;
        this.opacity = opacity === undefined ? 1 : opacity;
    }

    serialize () {
        var data = super.serialize();

        data.x = this.x;
        data.y = this.y;
        data.scaleX = this.scaleX;
        data.scaleY = this.scaleY;
        data.rotation = this.rotation;
        data.opacity = this.opacity;

        return data;
    }

    static _deserialize (data, object) {
        super._deserialize(data, object);
        
        object.x = data.x;
        object.y = data.y;
        object.scaleX = data.scaleX;
        object.scaleY = data.scaleY;
        object.rotation = data.rotation;
        object.opacity = data.opacity;

        return object;
    }

    get classname () {
        return 'Transformation';
    }
}
