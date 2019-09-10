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
     * How fast the timeline should auto-scroll when something is dragged outside of the GUI.
     * @type {number}
     */
    static get AUTO_SCROLL_SPEED () {
        return 1;
    }

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
            this.model.project.guiElement.updateMousePosition(e);
            this.lastMouseDrag = this.mouseDragEnd;
            this.mouseDragEnd = {x: this.globalMouse.x, y: this.globalMouse.y};

            // Auto scroll when objects are dragged outside of the GUI
            if(!this.isScrollbarGrabber) {
                var dragX = this.model.project.guiElement.mousePosition.x;
                var dragY = this.model.project.guiElement.mousePosition.y;
                var dragWidth = this.paper.view.element.width;
                var dragHeight = this.paper.view.element.height;
                var horizScrollbar = this.model.project.activeTimeline.guiElement.horizontalScrollbar;
                var verticalScrollbar = this.model.project.activeTimeline.guiElement.verticalScrollbar;
                var scrollXBefore = this.model.project.activeTimeline.guiElement.scrollX;
                var scrollYBefore = this.model.project.activeTimeline.guiElement.scrollY;
                if(dragX > this.paper.view.element.width) {
                    horizScrollbar.scrollByAmount(Wick.GUIElement.Draggable.AUTO_SCROLL_SPEED);
                } else if(dragX < 0) {
                    horizScrollbar.scrollByAmount(-Wick.GUIElement.Draggable.AUTO_SCROLL_SPEED);
                }
                if(dragY > this.paper.view.element.height) {
                    verticalScrollbar.scrollByAmount(Wick.GUIElement.Draggable.AUTO_SCROLL_SPEED);
                } else if(dragY < 0) {
                    verticalScrollbar.scrollByAmount(-Wick.GUIElement.Draggable.AUTO_SCROLL_SPEED);
                }
                var scrollXAfter = this.model.project.activeTimeline.guiElement.scrollX;
                var scrollYAfter = this.model.project.activeTimeline.guiElement.scrollY;
                this.mouseDragStart.x += scrollXBefore - scrollXAfter;
                this.mouseDragStart.y += scrollYBefore - scrollYAfter;
            }

            this.fire('drag');
        };
        var onMouseUp = (e) => {
            this.isDragging = false;
            this.mouseDragStart = {x: 0, y: 0};
            this.mouseDragEnd = {x: 0, y: 0};
            this.fire('dragEnd');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onMouseUp);
    }
}
