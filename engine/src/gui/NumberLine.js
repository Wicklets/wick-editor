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

Wick.GUIElement.NumberLine = class extends Wick.GUIElement {
    constructor (model) {
        super(model);

        this.cursor = 'grab';

        this.canAutoScrollX = true;

        this.playhead = new Wick.GUIElement.Playhead(model);
        this.onionSkinRangeLeft = new Wick.GUIElement.OnionSkinRange(model, 'left');
        this.onionSkinRangeRight = new Wick.GUIElement.OnionSkinRange(model, 'right');
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Save where the mouse is if the user wants to drag the playhead around
        this.mousePlayheadPosition = Math.floor(this.localMouse.x / this.gridCellWidth) + 1;

        var width = this.canvas.width - Wick.GUIElement.LAYERS_CONTAINER_WIDTH;
        var height = Wick.GUIElement.NUMBER_LINE_HEIGHT;

        // Draw background cover
        ctx.fillStyle = Wick.GUIElement.TIMELINE_BACKGROUND_COLOR;
        ctx.beginPath();
        ctx.rect(this.project.scrollX, 0, width, height);
        ctx.fill();

        // Draw number line cells
        for(var i = -1; i < width / this.gridCellWidth + 1; i++) {
            var skip =  Math.round(this.project.scrollX / this.gridCellWidth);
            this._drawCell(i + skip);
        }

        // Draw onion skin range
        if(this.model.project.onionSkinEnabled) {
            ctx.save();
            ctx.translate((this.model.playheadPosition - 1) * this.gridCellWidth + this.gridCellWidth/2, 0);
                this.onionSkinRangeLeft.draw();
                this.onionSkinRangeRight.draw();
            ctx.restore();
        }

        // Draw playhead
        this.playhead.draw();
    }

    // Helper function for drawing each cell of the numberline (draws the border and the number)
    _drawCell (i) {
        var ctx = this.ctx;

        var highlight = (i%5 === 4);

        // Draw cell number
        var fontSize = (i>=99) ? 13 : 16;
        var fontFamily = Wick.GUIElement.NUMBER_LINE_NUMBERS_FONT_FAMILY;
        ctx.font = fontSize + "px " + fontFamily;
        if(highlight) {
            ctx.fillStyle = Wick.GUIElement.NUMBER_LINE_NUMBERS_HIGHLIGHT_COLOR;
        } else {
            ctx.fillStyle = Wick.GUIElement.NUMBER_LINE_NUMBERS_COMMON_COLOR;
        }
        var textContent = ""+(i+1);
        var textWidth = ctx.measureText(textContent).width;
        ctx.fillText(textContent, (i * this.gridCellWidth) + (this.gridCellWidth / 2) - (textWidth / 2), Wick.GUIElement.NUMBER_LINE_HEIGHT - 5);

        // Draw cell wall
        ctx.lineWidth = Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_WIDTH;
        if(highlight) {
            ctx.strokeStyle = Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_HIGHLIGHT_STROKE_COLOR;
        } else {
            ctx.strokeStyle = Wick.GUIElement.FRAMES_CONTAINER_VERTICAL_GRID_STROKE_COLOR;
        }
        ctx.beginPath();
        var wallX = i * this.gridCellWidth;
        ctx.moveTo(wallX, 0);
        ctx.lineTo(wallX, Wick.GUIElement.NUMBER_LINE_HEIGHT);
        ctx.stroke();
    }

    onMouseDown (e) {
        this._movePlayhead();
    }

    onMouseDrag (e) {
        this._movePlayhead();
    }

    get bounds () {
        return {
            x: this.project.scrollX,
            y: 0,
            width: this.canvas.width,
            height: Wick.GUIElement.NUMBER_LINE_HEIGHT,
        }
    }

    /* Helper function for dragging the playhead around */
    _movePlayhead () {
        var timeline = this.project.model.activeTimeline;
        if(timeline.playheadPosition !== this.mousePlayheadPosition) {
            timeline.playheadPosition = this.mousePlayheadPosition;
            this.projectWasSoftModified();
        }
    }
}
