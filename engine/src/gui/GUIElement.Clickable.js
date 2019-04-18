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

Wick.GUIElement.Clickable = class extends Wick.GUIElement {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.isHoveredOver = false;
        this.isBeingClicked = false;
    }

    /**
     *
     */
    get isClickable () {
        return true;
    }

    /**
     *
     */
    get isHoveredOver () {
        return this._isHoveredOver;
    }

    set isHoveredOver (isHoveredOver) {
        this._isHoveredOver = isHoveredOver;
    }

    /**
     *
     */
    get isBeingClicked () {
        return this._isBeingClicked;
    }

    set isBeingClicked (isBeingClicked) {
        this._isBeingClicked = isBeingClicked;
    }

    /**
     *
     */
    get globalMouse () {
        return this.model.project.guiElement.mousePosition;
    }

    /**
     *
     */
    get localMouse () {
        var offset = this._mouseOffset(this.item);
        return {
            x: this.globalMouse.x - offset.x,
            y: this.globalMouse.y - offset.y
        }
    }

    /**
     *
     */
    get localMouseGrid () {
        return {
            x: Math.floor(this.localMouse.x / this.gridCellWidth),
            y: Math.floor(this.localMouse.y / this.gridCellHeight),
        }
    }

    /**
     *
     */
    handleMouseOver (e) {
        this.isHoveredOver = true;
        this.fire('mouseOver', e);
    }

    /**
     *
     */
    handleMouseLeave (e) {
        this.isHoveredOver = false;
        this.isBeingClicked = false;
        this.fire('mouseLeave', e);
    }

    /**
     *
     */
    handleMouseDown (e) {
        this.isBeingClicked = true;
        this.fire('mouseDown', e);
    }

    /**
     *
     */
    handleMouseUp (e) {
        this.isBeingClicked = false;
        this.fire('mouseUp', e);
    }

    _mouseOffset (item) {
        var offset = {
            x: item.position.x,
            y: item.position.y,
        };

        if(item.parent && !(item.parent instanceof paper.Layer)) {
            var parentOffset = this._mouseOffset(item.parent);
            offset.x += parentOffset.x;
            offset.y += parentOffset.y;
        }

        return offset;
    }
}
