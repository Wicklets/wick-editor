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

/**
 * The Frames Container contains the following GUI elements:
 * - All frames in the current timeline
 * - The Frames Strips for each layer
 * - The Selection Box
 */
Wick.GUIElement.FramesContainerBG = class extends Wick.GUIElement.Draggable {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.on('mouseDown', (e) => {
            if(!e.modifiers.shift) {
                this.model.project.selection.clear();
            }
            this.model.project.guiElement.build();
            this.model.project.guiElement.fire('projectModified');
        });
    }

    /**
     *
     */
    build () {
        super.build();

        // Build BG
        var bgRect = new paper.Path.Rectangle({
            fillColor: Wick.GUIElement.TIMELINE_BACKGROUND_COLOR,
            from: new paper.Point(-5,-5),
            to: new paper.Point(paper.view.element.width, paper.view.element.height),
        });
        bgRect.position.x += this.globalScrollX;
        bgRect.position.y += this.globalScrollY;
        this.item.addChild(bgRect);
    }
}
