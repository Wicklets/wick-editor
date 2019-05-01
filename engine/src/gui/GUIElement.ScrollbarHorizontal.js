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

Wick.GUIElement.ScrollbarHorizontal = class extends Wick.GUIElement.Scrollbar {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.width = 0;
        this.grabber = new Wick.GUIElement.ScrollbarGrabberHorizontal(model);
        this.grabber.on('scroll', (e) => {
            this.fire('scroll', e);
        });
    }

    /**
     *
     */
    build () {
        super.build();

        this.grabber.containerWidth = this.width;
        if(this.grabber.grabberWidth > this.grabber.contentWidth) {
            return;
        }

        var scrollbar = new this.paper.Path.Rectangle({
            from: new this.paper.Point(0, 0),
            to: new this.paper.Point(this.width, Wick.GUIElement.SCROLLBAR_SIZE),
            fillColor: Wick.GUIElement.SCROLLBAR_BACKGROUND_COLOR,
        });
        this.item.addChild(scrollbar);

        this.grabber.build();
        this.item.addChild(this.grabber.item);
    }
}
