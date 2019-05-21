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

/** Class representing a transformation. */
Wick.Transformation = class {
    /**
     * Creates a Transformation.
     * @param {number} x - The translation on the x-axis
     * @param {number} y - The translation on the y-axis
     * @param {number} scaleX - The amount of scaling on the x-axis
     * @param {number} scaleY - The amount of scaling on the y-axis
     * @param {number} rotation - Rotation, in degrees
     * @param {number} opacity - Opacity, ranging from 0.0 - 1.0
     */
    constructor (args) {
        if(!args) args = {};

        this.x = args.x === undefined ? 0 : args.x;
        this.y = args.y === undefined ? 0 : args.y;
        this.scaleX = args.scaleX === undefined ? 1 : args.scaleX;
        this.scaleY = args.scaleY === undefined ? 1 : args.scaleY;
        this.rotation = args.rotation === undefined ? 0 : args.rotation;
        this.opacity = args.opacity === undefined ? 1 : args.opacity;
    }

    /**
     * An object containing the values of this transformation.
     */
    get values () {
        return {
            x: this.x,
            y: this.y,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            rotation: this.rotation,
            opacity: this.opacity,
        }
    }

    /**
     * Creates a copy of this transformation.
     * @returns {Wick.Transformation} the copied transformation.
     */
    copy () {
        return new Wick.Transformation(this.values);
    }
}
