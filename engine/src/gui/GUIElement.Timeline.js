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
 * The Timeline contains the following GUI elements:
 * - The Frames Container
 * - The Layers Container
 * - The Horizontal Scrollbar
 * - The Vertical Scrollbar
 * - The Number Line
 */
Wick.GUIElement.Timeline = class extends Wick.GUIElement {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.framesContainer = new Wick.GUIElement.FramesContainer(model);
        this.layersContainer = new Wick.GUIElement.LayersContainer(model);
        this.numberLine = new Wick.GUIElement.NumberLine(model);
        this.horizontalScrollbar = new Wick.GUIElement.ScrollbarHorizontal(model);
        this.verticalScrollbar = new Wick.GUIElement.ScrollbarVertical(model);

        this.horizontalScrollbar.on('scroll', (e) => {
            this.framesContainer.build();
            this.numberLine.build();
            this._repositionScrollableElements();
        });
        this.verticalScrollbar.on('scroll', (e) => {
            this.framesContainer.build();
            this.layersContainer.build();
            this._repositionScrollableElements();
        });

        this.layersContainerWidth = Wick.GUIElement.LAYERS_CONTAINER_WIDTH;
        this.numberLineHeight = Wick.GUIElement.NUMBER_LINE_HEIGHT;

        this.scrollX = 0;
        this.scrollY = 0;
    }

    /**
     *
     */
    build () {
        super.build();

        // Build frames container
        this.framesContainer.build();
        this.item.addChild(this.framesContainer.item);

        // Build number line
        this.numberLine.build();
        this.item.addChild(this.numberLine.item);

        // Build layers container
        this.layersContainer.build();
        this.item.addChild(this.layersContainer.item);

        // Build scrollbars
        this.horizontalScrollbar.item.position.x = this.layersContainerWidth;
        this.horizontalScrollbar.item.position.y = paper.view.element.height - Wick.GUIElement.SCROLLBAR_SIZE;
        this.horizontalScrollbar.width = paper.view.element.width - this.layersContainerWidth - Wick.GUIElement.SCROLLBAR_SIZE;
        this.horizontalScrollbar.build();
        this.item.addChild(this.horizontalScrollbar.item);

        this.verticalScrollbar.item.position.x = paper.view.element.width - Wick.GUIElement.SCROLLBAR_SIZE;
        this.verticalScrollbar.item.position.y = this.numberLineHeight;
        this.verticalScrollbar.height = paper.view.element.height - this.numberLineHeight - Wick.GUIElement.SCROLLBAR_SIZE;
        this.verticalScrollbar.build();
        this.item.addChild(this.verticalScrollbar.item);

        // Build cover for top left corner
        var cornerCover = new paper.Path.Rectangle({
            fillColor: Wick.GUIElement.TIMELINE_BACKGROUND_COLOR,
            from: new paper.Point(0, 0),
            to: new paper.Point(this.layersContainerWidth, this.numberLineHeight),
        });
        this.item.addChild(cornerCover);

        // Build cover for bottom right corner
        var cornerCover2 = new paper.Path.Rectangle({
            fillColor: Wick.GUIElement.SCROLLBAR_BACKGROUND_COLOR,
            from: new paper.Point(this.paper.view.element.width - Wick.GUIElement.SCROLLBAR_SIZE, this.paper.view.element.height - Wick.GUIElement.SCROLLBAR_SIZE),
            to: new paper.Point(this.paper.view.element.width, this.paper.view.element.height),
        });
        this.item.addChild(cornerCover2);

        this._repositionScrollableElements();
    }

    _repositionScrollableElements () {
        this.numberLine.item.position.x = this.layersContainerWidth - this.scrollX;
        this.layersContainer.item.position.y = this.numberLineHeight - this.scrollY;
        this.framesContainer.item.position.x = this.layersContainerWidth - this.scrollX;
        this.framesContainer.item.position.y = this.numberLineHeight - this.scrollY;
    }
}
