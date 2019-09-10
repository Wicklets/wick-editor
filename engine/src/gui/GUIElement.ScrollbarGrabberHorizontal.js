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

Wick.GUIElement.ScrollbarGrabberHorizontal = class extends Wick.GUIElement.Draggable {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.isScrollbarGrabber = true;

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
            this.scrollByAmount(this.mouseMovement.x);
        });

        this.scrollX = 0;
    }

    get contentWidth () {
        var buffer = 30;
        return ((this.model.length * 2 + buffer) * this.gridCellWidth);
    }

    get grabberWidth () {
        return Math.max((this.containerWidth / this.contentWidth) * this.containerWidth, 30);
    }

    /**
     *
     */
    build () {
        super.build();

        if(this.grabberWidth > this.contentWidth) {
            return;
        }

        var grabber = new this.paper.Path.Rectangle({
            from: new this.paper.Point(this.scrollX, Wick.GUIElement.SCROLLBAR_MARGIN),
            to: new this.paper.Point(this.scrollX + this.grabberWidth, Wick.GUIElement.SCROLLBAR_SIZE - Wick.GUIElement.SCROLLBAR_MARGIN),
            fillColor: this.isHoveredOver ? Wick.GUIElement.SCROLLBAR_ACTIVE_FILL_COLOR : Wick.GUIElement.SCROLLBAR_FILL_COLOR,
            radius: Wick.GUIElement.SCROLLBAR_BORDER_RADIUS,
        });
        this.item.addChild(grabber);
    }

    /**
     *
     */
    scrollByAmount (scrollAmount) {
        this.scrollX = this.scrollX + scrollAmount;
        this.scrollX = Math.max(0, this.scrollX);
        this.scrollX = Math.min(this.containerWidth - this.grabberWidth, this.scrollX);
        this.model.project.activeTimeline.guiElement.scrollX = (this.scrollX / this.containerWidth) * this.contentWidth;
        this.fire('scroll', {});
        this.build();
    }
}
