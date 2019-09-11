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

/**
 * The Timeline is responsible for drawing the following GUI elements:
 * - The Breadcrumbs
 * - The Frames Container
 * - The Layers Container
 * - The Horizontal Scrollbar
 * - The Vertical Scrollbar
 * - The Number Line
 */
Wick.GUIElement.Timeline = class extends Wick.GUIElement {
    /**
     * Create a new GUIElement
     */
    constructor (model) {
        super(model);

        this.breadcrumbs = new Wick.GUIElement.Breadcrumbs(model);
        /*this.framesContainer = new Wick.GUIElement.FramesContainer(model);
        this.layersContainer = new Wick.GUIElement.LayersContainer(model);
        this.numberLine = new Wick.GUIElement.NumberLine(model);
        this.horizontalScrollbar = new Wick.GUIElement.ScrollbarHorizontal(model);
        this.verticalScrollbar = new Wick.GUIElement.ScrollbarVertical(model);
        this.addFrameButton = new Wick.GUIElement.TimelineAddFrameButton(model);
        this.deleteLayerButton = new Wick.GUIElement.TimelineDeleteLayerButton(model);*/
    }

    /**
     * Draw this GUIElement
     */
    draw () {
        this.breadcrumbs.draw();
    }
}
