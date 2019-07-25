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

Wick.GUIElement.ScrollbarGrabberVertical = class extends Wick.GUIElement.Draggable {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.on('mouseOver', () => {
            this.build();
        });

        this.on('mouseDown', () => {
            this.build();
        });

        this.on('mouseLeave', () => {
            this.build();
        });

        this.on('drag', (e) => {
            this.scrollByAmount(this.mouseMovement.y);
        });

        this.scrollY = 0;
    }

    get contentHeight () {
        var buffer = 1;
        return ((this.model.layers.length * 2 + buffer) * this.gridCellHeight);
    }

    get grabberHeight () {
        return Math.max((this.containerHeight / this.contentHeight) * this.containerHeight, 30);
    }

    /**
     *
     */
    build () {
        super.build();

        var grabber = new this.paper.Path.Rectangle({
            from: new this.paper.Point(Wick.GUIElement.SCROLLBAR_MARGIN, this.scrollY),
            to: new this.paper.Point(Wick.GUIElement.SCROLLBAR_SIZE - Wick.GUIElement.SCROLLBAR_MARGIN, this.scrollY + this.grabberHeight),
            fillColor: this.isHoveredOver ? Wick.GUIElement.SCROLLBAR_ACTIVE_FILL_COLOR : Wick.GUIElement.SCROLLBAR_FILL_COLOR,
            radius: Wick.GUIElement.SCROLLBAR_BORDER_RADIUS,
        });
        this.item.addChild(grabber);
    }

    /**
     *
     */
    scrollByAmount (scrollAmount) {
        this.scrollY = this.scrollY + scrollAmount;
        this.scrollY = Math.max(0, this.scrollY);
        this.scrollY = Math.min(this.containerHeight - this.grabberHeight, this.scrollY);
        this.model.project.activeTimeline.guiElement.scrollY = (this.scrollY / this.containerHeight) * this.contentHeight;
        this.fire('scroll', {});
        this.build();
    }
}
