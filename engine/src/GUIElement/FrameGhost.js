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

Wick.GUIElement.FrameGhost = class extends Wick.GUIElement.Ghost {
    constructor (model) {
        super(model);

        this._mainFrame = model;
        this._frames = model.project.selection.getSelectedObjects('Frame');
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        this._frames.forEach(frame => {
            // Calculate position values...
            var start = frame.start - this._mainFrame.start;
            var length = frame.length;
            var row = frame.parentLayer.index - this._mainFrame.parentLayer.index;

            var x = start * this.gridCellWidth;
            var y = row * this.gridCellHeight;
            var width = length * this.gridCellWidth;
            var height = this.gridCellHeight;

            // New position of frames based on mouse x,y
            // (this makes things feel more responsive)
            ctx.save();
            ctx.translate(this._mouseDiff.x, this._mouseDiff.y);
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = Wick.GUIElement.FRAME_GHOST_COLOR;
                ctx.beginPath();
                ctx.roundRect(x, y, width, height, Wick.GUIElement.FRAME_BORDER_RADIUS);
                ctx.fill();
            ctx.restore();

            // New position of frames based on grid cells moved
            // (this makes it easy to tell where frames will land)
            ctx.save();
            ctx.translate(this.moveCols*this.gridCellWidth, this.moveRows*this.gridCellHeight);
            if(frame.parentLayer.index + this.moveRows > frame.parentTimeline.layers.length - 1) {
                ctx.fillStyle = Wick.GUIElement.FRAME_GHOST_NOT_ALLOWED_COLOR
                ctx.strokeStyle = '#ff0000';
            } else {
                ctx.fillStyle = 'rgba(0,0,0,0)';
                ctx.strokeStyle = '#00ff00';
            }
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(x, y, width, height, Wick.GUIElement.FRAME_BORDER_RADIUS);
                ctx.globalAlpha = 0.8;
                ctx.fill();
                ctx.stroke();
            ctx.restore();
        });
    }

    finish () {
        var timeline = this.model.parentTimeline;
        timeline.playheadPosition += this.moveCols;
        timeline.deferFrameGapResolve();

        // Remove all frames, then re-add them in their new places
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

        timeline.resolveFrameGaps(this._frames);
    }
}
