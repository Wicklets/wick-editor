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

Wick.GUIElement.FrameGhost = class extends Wick.GUIElement {
    constructor (model) {
        super(model);

        this._mainFrame = model;
        this._frames = model.project.selection.getSelectedObjects();
    }

    draw () {
        super.draw();

        this._mouseStart = this._mouseStart || {
            x: this.localMouse.x,
            y: this.localMouse.y
        };
        this._mouseEnd = {
            x: this.localMouse.x,
            y: this.localMouse.y
        };
        this._mouseDiff = {
            x: this._mouseEnd.x - this._mouseStart.x,
            y: this._mouseEnd.y - this._mouseStart.y
        };

        var ctx = this.ctx;

        // Save how many rows/columns we've moved for later
        this.moveCols = Math.round(this._mouseDiff.x/this.gridCellWidth);
        this.moveRows = Math.round(this._mouseDiff.y/this.gridCellHeight);

        this._frames.forEach(frame => {
            var start = frame.start - this._mainFrame.start;
            var length = frame.length;
            var row = frame.parentLayer.index - this._mainFrame.parentLayer.index;

            var x = start * this.gridCellWidth;
            var y = row * this.gridCellHeight;
            var width = length * this.gridCellWidth;
            var height = this.gridCellHeight;

            ctx.save();
            ctx.translate(this._mouseDiff.x, this._mouseDiff.y);
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = Wick.GUIElement.FRAME_GHOST_COLOR;
                ctx.beginPath();
                ctx.roundRect(x, y, width, height, Wick.GUIElement.FRAME_BORDER_RADIUS);
                ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.translate(this.moveCols*this.gridCellWidth, this.moveRows*this.gridCellHeight);
            ctx.strokeStyle = '#00ff00';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(x, y, width, height, Wick.GUIElement.FRAME_BORDER_RADIUS);
                ctx.globalAlpha = 0.8;
                ctx.stroke();
            ctx.restore();
        });
    }

    finish () {
        var timeline = this.model.parentTimeline;
        timeline.deferFrameGapResolve();

        this._frames.forEach(frame => {
            frame._originalLayerIndex = frame.parentLayer.index;
            frame.remove();
        });
        this._frames.forEach(frame => {
            frame.start += this.moveCols;
            frame.end += this.moveCols;
        });
        this._frames.forEach(frame => {
            var layer = timeline.layers[frame._originalLayerIndex + this.moveRows];
            delete frame._originalLayerIndex;
            if(layer) {
                layer.addFrame(frame);
            }
        });

        timeline.resolveFrameGaps();
    }
}
