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
 * - Breadcrumbs
 * - Frames Container
 * - Layers Container
 * - Horizontal + Vertical Scrollbars
 * - Number Line
 */
Wick.GUIElement.Timeline = class extends Wick.GUIElement {
    /**
     * Create a new GUIElement
     */
    constructor (model) {
        super(model);

        this.breadcrumbs = new Wick.GUIElement.Breadcrumbs(model);
        this.actionButtonsContainer = new Wick.GUIElement.ActionButtonsContainer(model);
        this.layersContainer = new Wick.GUIElement.LayersContainer(model);
        this.framesContainer = new Wick.GUIElement.FramesContainer(model);
        this.numberLine = new Wick.GUIElement.NumberLine(model);
        this.horizontalScrollbar = new Wick.GUIElement.Scrollbar(model);
        this.horizontalScrollbar.direction = 'horizontal';
        this.verticalScrollbar = new Wick.GUIElement.Scrollbar(model);
        this.verticalScrollbar.direction = 'vertical';
    }

    /**
     * Draw this GUIElement
     */
    draw () {
        var ctx = this.ctx;

        ctx.save();
        ctx.translate(0, Wick.GUIElement.BREADCRUMBS_HEIGHT);
            ctx.save();
            ctx.translate(0, Wick.GUIElement.NUMBER_LINE_HEIGHT);
                // Frames
                ctx.save();
                ctx.translate(Wick.GUIElement.LAYERS_CONTAINER_WIDTH, 0);
                    this.framesContainer.draw();
                ctx.restore();

                // Layers
                this.layersContainer.draw();
            ctx.restore();

            // Number Line
            ctx.save();
            ctx.translate(Wick.GUIElement.LAYERS_CONTAINER_WIDTH, 0);
                this.numberLine.draw();
            ctx.restore();

            // Action buttons
            this.actionButtonsContainer.draw();
        ctx.restore();

        // Breadcrumbs
        this.breadcrumbs.draw();
    }
}
