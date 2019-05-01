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

Wick.GUIElement.FrameRightEdge = class extends Wick.GUIElement.FrameEdge {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.on('drag', () => {
            this.model.guiElement.ghost.active = true;
            this.model.guiElement.rightEdgeStretch = this.mouseDelta.x;
            this.model.guiElement.build();
        });

        this.on('dragEnd', () => {
            this.model.guiElement._tryToDropFrames();
            this.model.guiElement.ghost.active = false;
            this.model.guiElement.rightEdgeStretch = 0;
            this.model.guiElement.build();
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
            from: new this.paper.Point(this.width - Wick.GUIElement.FrameEdge.DEFAULT_HANDLE_WIDTH, 0),
            to: new this.paper.Point(this.width, this.height),
            fillColor: this.isHoveredOver ? Wick.GUIElement.FRAME_HANDLE_HOVER_FILL_COLOR : 'rgba(0,0,0,0.001)',
        });
        this.item.addChild(edgeRect);
    }
}
