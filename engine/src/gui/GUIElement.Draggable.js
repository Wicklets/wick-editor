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

Wick.GUIElement.Draggable = class extends Wick.GUIElement.Clickable {
    /**
     *
     */
    constructor (model) {
        super(model);
        this.isDragging = false;
        this.mouseDragStart = {x: 0, y: 0};
        this.mouseDragEnd = {x: 0, y: 0};
    }

    /**
     *
     */
    get isDraggable () {
        return true;
    }

    /**
     *
     */
    get isDragging () {
        return this._isDragging;
    }

    set isDragging (isDragging) {
        this._isDragging = isDragging;
    }

    /**
     *
     */
    get mouseDelta () {
        return {
            x: this.mouseDragEnd.x - this.mouseDragStart.x,
            y: this.mouseDragEnd.y - this.mouseDragStart.y,
        };
    }

    /**
     *
     */
    get mouseMovement () {
        return {
            x: this.mouseDragEnd.x - this.lastMouseDrag.x,
            y: this.mouseDragEnd.y - this.lastMouseDrag.y,
        };
    }

    /**
     *
     */
    handleMouseDown (e) {
        super.handleMouseDown(e);

        this.isDragging = true;
        this.fire('dragStart');
        this.mouseDragStart = {x: this.globalMouse.x, y: this.globalMouse.y};
        this.mouseDragEnd = {x: this.globalMouse.x, y: this.globalMouse.y};

        var onMouseMove = (e) => {
            console.log(e)
            this.model.project.guiElement.updateMousePosition(e);
            this.lastMouseDrag = this.mouseDragEnd;
            this.mouseDragEnd = {x: this.globalMouse.x, y: this.globalMouse.y};
            this.fire('drag');
        };
        var onMouseUp = (e) => {
            this.isDragging = false;
            this.mouseDragStart = {x: 0, y: 0};
            this.mouseDragEnd = {x: 0, y: 0};
            this.fire('dragEnd');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onMouseUp);
    }
}
