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
 * The Timeline contains the following GUI elements:
 * - The Breadcrumbs
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
            //this.framesContainer.build();
            //this.numberLine.build();
            this._positionScrollableElements();
        });
        this.verticalScrollbar.on('scroll', (e) => {
            //this.framesContainer.build();
            //this.layersContainer.build();
            this._positionScrollableElements();
        });

        this._scrollX = 0;
        this._scrollY = 0;
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
        this.horizontalScrollbar.item.position.x = Wick.GUIElement.LAYERS_CONTAINER_WIDTH;
        this.horizontalScrollbar.item.position.y = paper.view.element.height/window.devicePixelRatio - Wick.GUIElement.BREADCRUMBS_HEIGHT - Wick.GUIElement.SCROLLBAR_SIZE;
        this.horizontalScrollbar.width = paper.view.element.width/window.devicePixelRatio - Wick.GUIElement.LAYERS_CONTAINER_WIDTH - Wick.GUIElement.SCROLLBAR_SIZE;
        this.horizontalScrollbar.build();
        this.item.addChild(this.horizontalScrollbar.item);

        this.verticalScrollbar.item.position.x = paper.view.element.width/window.devicePixelRatio - Wick.GUIElement.SCROLLBAR_SIZE;
        this.verticalScrollbar.item.position.y = Wick.GUIElement.NUMBER_LINE_HEIGHT;
        this.verticalScrollbar.height = paper.view.element.height/window.devicePixelRatio - Wick.GUIElement.NUMBER_LINE_HEIGHT - Wick.GUIElement.BREADCRUMBS_HEIGHT - Wick.GUIElement.SCROLLBAR_SIZE;
        this.verticalScrollbar.build();
        this.item.addChild(this.verticalScrollbar.item);

        // Build cover for top left corner
        var cornerCover = new paper.Path.Rectangle({
            fillColor: Wick.GUIElement.TIMELINE_BACKGROUND_COLOR,
            from: new paper.Point(0, 0),
            to: new paper.Point(Wick.GUIElement.LAYERS_CONTAINER_WIDTH, Wick.GUIElement.NUMBER_LINE_HEIGHT),
        });
        this.item.addChild(cornerCover);

        // Build cover for bottom right corner
        var cornerCover2 = new paper.Path.Rectangle({
            fillColor: Wick.GUIElement.SCROLLBAR_BACKGROUND_COLOR,
            from: new paper.Point(this.paper.view.element.width - Wick.GUIElement.SCROLLBAR_SIZE, this.paper.view.element.height - Wick.GUIElement.SCROLLBAR_SIZE),
            to: new paper.Point(this.paper.view.element.width, this.paper.view.element.height),
        });
        this.item.addChild(cornerCover2);

        this._positionScrollableElements();
    }

    _positionScrollableElements () {
        this.numberLine.scrollX = -this.scrollX;
        this.layersContainer.scrollY = -this.scrollY;
        this.framesContainer.scrollX = -this.scrollX;
        this.framesContainer.scrollY = -this.scrollY;
    }
}
