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

/**
 * Transformables are any object that can be represented on the canvas, selected, or trasnformed.
 */
Wick.Transformable = class extends Wick.Base {
  constructor(args) {
      if (!args) args = {};
      super(args);

      this.init(args);
  }

  init (data) {
    if (!data) data = {};

    this._x = data.x === undefined ? 0 : data.x;
    this._y = data.y === undefined ? 0 : data.y;
    this._width = data.width === undefined ? 1 : data.width;
    this._height = data.height === undefined ? 1 : data.height;
    this._scaleX = data.scaleX === undefined ? 1 : data.scaleX;
    this._scaleY = data.scaleY === undefined ? 1 : data.scaleY;
    this._lockedScale = data.lockedScale === undefined ? false : data.lockedScale;
    this._rotation = data.rotation === undefined ? 0 : data.rotation;
    this._pivotX = data.pivotX === undefined ? 0 : data.pivotX;
    this._pivotY = data.pivotY === undefined ? 0 : data.pivotY;
    this._lockedPivot = data.lockedPivot === undefined ? true : data.lockedPivot;
    this._opacity = data.opacity === undefined ? 1 : data.opacity;
  }

  _serialize (args) {
    var data = super._serialize(args);

    data.x = this.x;
    data.y = this.y;
    data.width = this.width;
    data.height = this.height;
    data.scaleX = this.scaleX;
    data.scaleY = this.scaleY;
    data.lockedScale = this.lockedScale;
    data.rotation = this.rotation;
    data.pivotX = this.pivotX;
    data.pivotY = this.pivotY;
    data.lockedPivot = this.lockedPivot;
    data.opacity = this.opacity;

    return data;
  }

  _deserialize (data) {
    super._deserialize(data);
    this.init(data);
  }

  get x () {
    return this._x;
  }

  set x (x) {
    this._x = x;
    this.onTransformableChange();
  }

  get y () {
    return this._y;
  }

  set y (y) {
    this._y = y;
    this.onTransformableChange();
  }

  get width () {
    return this._width;
  }

  set width (width) {
    this._width = width;
    this.onTransformableChange();
  }

  get height () {
    return this._height;
  }

  set height (height) {
    this._height = height;
    this.onTransformableChange();
  }

  get scaleX () {
    return this._scaleX;
  }

  set scaleX (scaleX) {
    this._scaleX = scaleX;
    this.onTransformableChange();
  }

  get scaleY () {
    return this._scaleY;
  }

  set scaleY (scaleY) {
    this._scaleY = scaleY;
    this.onTransformableChange();
  }

  get lockedScale () {
    return this._lockedScale;
  }

  set lockedScale (lockedScale) {
    this._lockedScale = lockedScale;
    this.onTransformableChange();
  }

  get rotation () {
    return this._rotation;
  }

  set rotation (rotation) {
    this._rotation = rotation;
    this.onTransformableChange();
  }

  get opacity () {
    return this._opacity;
  }

  set opacity (opacity) {
    this._opacity = opacity;
    this.onTransformableChange();
  }

  get pivotX () {
    return this._pivotX;
  }

  set pivotX (pivotX) {
    this._pivotX = pivotX;
    this.onTransformableChange();
  }

  get pivotY () {
    return this._pivotY;
  }

  set pivotY (pivotY) {
    this._pivotY = pivotY;
    this.onTransformableChange();
  }

  get lockedPivot () {
    return this._lockedPivot;
  }

  set lockedPivot (lockedPivot) {
    this._lockedPivot = lockedPivot;
    this.onTransformableChange();
  }

  /**
   * Runs once whenever a transformable property is changed.
   */
  onTransformableChange () {
    // To be changed wehn subclassed
  }
}
