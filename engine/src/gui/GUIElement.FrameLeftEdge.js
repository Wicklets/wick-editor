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

Wick.GUIElement.FrameLeftEdge = class extends Wick.GUIElement.FrameEdge {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.on('drag', () => {
            this.model.guiElement.ghost.active = true;
            this.model.guiElement.leftEdgeStretch = this.mouseDelta.x;
            this.model.guiElement.build();
        });

        this.on('dragEnd', () => {
            this.model.guiElement._tryToDropFrames();
        });
    }

    get width () {
        return this.model.guiElement.width;
    }

    get height () {
        return this.model.guiElement.height;
    }

    /**
     *
     */
    build () {
        super.build();

        var edgeRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(0, 0),
            to: new this.paper.Point(Wick.GUIElement.FrameEdge.DEFAULT_HANDLE_WIDTH, this.height),
            fillColor: this.isHoveredOver ? Wick.GUIElement.FRAME_HANDLE_HOVER_FILL_COLOR : 'rgba(0,0,0,0.001)',
        });
        this.item.addChild(edgeRect);
    }
}
