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

Wick.GUIElement.NumberLine = class extends Wick.GUIElement.Draggable {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.playhead = new Wick.GUIElement.Playhead(model);
        this.onionSkinRangeStart = new Wick.GUIElement.OnionSkinRangeStart(model);
        this.onionSkinRangeEnd = new Wick.GUIElement.OnionSkinRangeEnd(model);

        this.on('mouseDown', () => {
            this._movePlayheadWithMouse();
        });

        this.on('drag', () => {
            this._movePlayheadWithMouse();
        });

        this.on('mouseUp', () => {
            this.model.project.guiElement.fire('projectModified');
        });
    }

    get width () {
        return paper.view.element.width - Wick.GUIElement.LAYERS_CONTAINER_WIDTH;
    }

    /**
     *
     */
    get height () {
        return this._height;
    }

    set height (height) {
        this._height = height;
    }

    /**
     *
     */
    build () {
        super.build();

        this.item.removeChildren();

        // Build BG
        var bgRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(0, 0),
            to: new this.paper.Point(this.width, this.model.guiElement.numberLineHeight),
            fillColor: Wick.GUIElement.TIMELINE_BACKGROUND_COLOR,
            pivot: new paper.Point(0, 0),
        });
        bgRect.position.x += this.globalScrollX;
        this.item.addChild(bgRect);

        // Build number line cells
        for(var i = -1; i < this.width / this.gridCellWidth + 1; i++) {
            var skip =  Math.round(-this.globalScrollX / this.gridCellWidth);
            this.item.addChild(this._buildCell(i - skip));
        }

        // Build playhead
        this.playhead.build();
        this.item.addChild(this.playhead.item);

        // Build onion skin range sliders
        this.onionSkinRangeStart.height = this.model.guiElement.numberLineHeight;
        this.onionSkinRangeStart.build();
        this.item.addChild(this.onionSkinRangeStart.item);

        this.onionSkinRangeEnd.height = this.model.guiElement.numberLineHeight;
        this.onionSkinRangeEnd.build();
        this.item.addChild(this.onionSkinRangeEnd.item);
    }

    _buildCell (i) {
        var numberLineHeight = this.model.guiElement.numberLineHeight;

        var cellNumber = new paper.PointText({
            point: [this.gridCellWidth/2, numberLineHeight - 5],
            content: (i + 1),
            fillColor: (i%5===4) ? Wick.GUIElement.NUMBER_LINE_NUMBERS_HIGHLIGHT_COLOR : Wick.GUIElement.NUMBER_LINE_NUMBERS_COMMON_COLOR,
            fontFamily: Wick.GUIElement.NUMBER_LINE_NUMBERS_FONT_FAMILY,
            fontWeight: 'normal',
            fontSize: (i>=100) ? 13 : 16,
            justification: 'center',
            pivot: new paper.Point(0, 0),
        });
        var cellWall = new this.paper.Path.Rectangle({
            from: new this.paper.Point(-Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_WIDTH/2, 0),
            to: new this.paper.Point(Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_WIDTH/2, numberLineHeight),
            fillColor: (i%5 === 4) ? Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_HIGHLIGHT_STROKE_COLOR : Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_COLOR,
            pivot: new paper.Point(0, 0),
            locked: true,
        });
        var cell = new paper.Group({
            children: [cellWall, cellNumber],
            pivot: new paper.Point(0, 0),
            applyMatrix: false,
        });
        cell.position = new paper.Point(i * this.gridCellWidth, 0);
        return cell;
    }

    _movePlayheadWithMouse () {
        var newPlayheadPosition = Math.max(1, this.localMouseGrid.x + 1);
        if(this.model.playheadPosition !== newPlayheadPosition) {
            this.model.playheadPosition = newPlayheadPosition;
            this.playhead.build();
            this.onionSkinRangeStart.build();
            this.onionSkinRangeEnd.build();
            this.model.project.guiElement.fire('projectSoftModified');
        }
    }
}
