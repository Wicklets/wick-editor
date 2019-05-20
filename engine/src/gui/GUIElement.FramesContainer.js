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
 * The Frames Container contains the following GUI elements:
 * - All frames in the current timeline
 * - The Frames Strips for each layer
 * - The Selection Box
 */
Wick.GUIElement.FramesContainer = class extends Wick.GUIElement.Draggable {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.framesStrips = {};
        this.selectionBox = new Wick.GUIElement.SelectionBox(model);

        this.bg = new Wick.GUIElement.FramesContainerBG(model);

        this.bg.on('dragStart', () => {
            this.selectionBox.active = true;
            this.selectionBox.start = new paper.Point(this.localMouse.x, this.localMouse.y);
            this.selectionBox.end = new paper.Point(this.localMouse.x, this.localMouse.y);
            this.selectionBox.build();
        });

        this.bg.on('drag', () => {
            this.selectionBox.end = new paper.Point(this.localMouse.x, this.localMouse.y);
            this.selectionBox.build();
        });

        this.bg.on('dragEnd', (e) => {
            this.model.getAllFrames().filter(frame => {
                return this.selectionBox.touches(frame.guiElement.item);
            }).forEach(frame => {
                this.model.project.selection.select(frame);
            });
            this.selectionBox.active = false;
            this.model.project.guiElement.build();
            this.model.project.guiElement.fire('projectModified');
        });

        this.grid = new paper.Group({
          applyMatrix: false,
          pivot: new paper.Point(0,0),
        });
    }

    /**
     *
     */
    build () {
        super.build();

        // Build BG
        this.bg.build();
        this.item.addChild(this.bg.item);

        // Build frames strips
        this.model.layers.forEach(layer => {
            // Create/cache FramesStrips elements
            var framesStrip = this.framesStrips[layer.uuid];
            if(!framesStrip) {
                framesStrip = new Wick.GUIElement.FramesStrip(layer);
            }
            this.framesStrips[layer.uuid] = framesStrip;

            framesStrip.build();
            this.item.addChild(framesStrip.item);
        });

        // Build grid
        this.grid.removeChildren();
        this.grid.locked = true;
        for(var i = -1; i < paper.view.element.width / this.gridCellWidth + 1; i++) {
            var gridLine = new this.paper.Path.Rectangle({
                from: new this.paper.Point(-Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_WIDTH/2, 0),
                to: new this.paper.Point(Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_WIDTH/2, paper.view.element.height),
                fillColor: Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_COLOR,
                pivot: new paper.Point(0, 0),
                locked: true,
                insert: false,
            });
            gridLine.position.x += (i) * this.gridCellWidth;
            gridLine.locked = true;
            this.grid.addChild(gridLine);
        }
        this.item.addChild(this.grid);

        // Build frames
        this.model.getAllFrames().forEach(frame => {
            frame.guiElement.build();
            this.item.addChild(frame.guiElement.item);
        });

        // Build selection box
        this.selectionBox.build();
        this.item.addChild(this.selectionBox.item);

        this._positionScrollableElements();
    }

    _positionScrollableElements () {
        this.item.position.x = Wick.GUIElement.LAYERS_CONTAINER_WIDTH+this.scrollX;
        this.item.position.y = Wick.GUIElement.NUMBER_LINE_HEIGHT+this.scrollY;

        this.bg.item.position.x = -this.scrollX;
        this.bg.item.position.y = -this.scrollY;
        this.grid.position.x = -this.scrollX;
        this.grid.position.x = this.grid.position.x - (this.grid.position.x%this.gridCellWidth);
        this.grid.position.y = -this.scrollY;
        this.model.layers.forEach(layer => {
            this.framesStrips[layer.uuid].frameStripRect.position.x = -this.scrollX;
        });
    }
}
