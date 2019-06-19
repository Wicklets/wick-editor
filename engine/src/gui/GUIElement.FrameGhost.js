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

Wick.GUIElement.FrameGhost = class extends Wick.GUIElement {
    /**
     *
     */
    constructor (model) {
        super(model);
        this.active = false;
        this.position = new paper.Point(0,0);
        this.width = 0;
    }

    /**
     *
     */
    get active () {
        return this._active;
    }

    set active (active) {
        this._active = active;
    }

    /**
     *
     */
    get position () {
        return this._position;
    }

    set position (position) {
        this._position = position;
    }

    /**
     *
     */
    get height () {
        return this.gridCellHeight;
    }

    /**
     *
     */
    build() {
        super.build();
        if (!this.active) return;
        var frameRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(this.position.x, this.position.y),
            to: new this.paper.Point(this.position.x + this.width, this.position.y + this.height),
            strokeColor: Wick.GUIElement.FRAME_GHOST_CAN_DROP_COLOR,
            fillColor: Wick.GUIElement.FRAME_GHOST_CAN_DROP_COLOR,
            strokeWidth: Wick.GUIElement.FRAME_GHOST_STROKE_WIDTH,
            opacity:0.8,
            radius: Wick.GUIElement.FRAME_BORDER_RADIUS
        });
        this.item.position = new paper.Point();
        this.item.addChild(frameRect);
    }
}
