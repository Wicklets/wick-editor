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

Wick.GUIElement.FrameEdgeGhost = class extends Wick.GUIElement.Ghost {
    constructor (model, edge) {
        super(model);

        this._mainFrame = model;
        this._frames = [];
        if(edge === 'left') {
            this._frames = model.project.selection.getLeftmostFrames();
        } else if (edge === 'right') {
            this._frames = model.project.selection.getRightmostFrames();
        }

        this._edge = edge;
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        var mainFrame = this._mainFrame;

        // Calculate position values...
        var start = mainFrame.start - this._mainFrame.start;
        var row = mainFrame.parentLayer.index - this._mainFrame.parentLayer.index;

        this.moveCols = Math.round(this._mouseDiff.x / this.gridCellWidth);

        // Prevent 'inside out' frames
        var movePx = this._mouseDiff.x;
        this._frames.forEach(frame => {
            var length = frame.length;

            if(this._edge === 'right') {
                this.moveCols = Math.max(-length + 1, this.moveCols);
            } else if(this._edge === 'left') {
                this.moveCols = Math.min(length - 1, this.moveCols);
            }
            if(this._edge === 'right') {
                movePx = Math.max(movePx, this.moveCols * this.gridCellWidth);
            } else if(this._edge === 'left') {
                movePx = Math.min(movePx, this.moveCols * this.gridCellWidth);
            }
        });

        this._frames.forEach(frame => {
            var x = start * this.gridCellWidth;
            var y = row * this.gridCellHeight;
            var width = frame.length * this.gridCellWidth;
            var height = this.gridCellHeight;

            // Offset frame by it's position
            var gridDiffX = frame.start - mainFrame.start;
            var gridDiffY = frame.parentLayer.index - mainFrame.parentLayer.index;
            ctx.save();
            ctx.translate(gridDiffX * this.gridCellWidth, gridDiffY * this.gridCellHeight);

            // New length of frames based on mouse x,y
            // (this makes things feel more responsive)
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = Wick.GUIElement.FRAME_GHOST_COLOR;
            ctx.beginPath();
            if(this._edge === 'right') {
                ctx.roundRect(x, y, width + movePx, height, Wick.GUIElement.FRAME_BORDER_RADIUS);
            } else if(this._edge === 'left') {
                ctx.roundRect(x + movePx, y, width - movePx, height, Wick.GUIElement.FRAME_BORDER_RADIUS);
            }
            ctx.fill();
            ctx.restore();

            // New length of frames based on grid cells moved
            // (this makes it easy to tell where frames will land)
            ctx.strokeStyle = '#00ff00';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 3;
            ctx.beginPath();
            if(this._edge === 'right') {
                ctx.roundRect(x, y, width + this.moveCols * this.gridCellWidth, height, Wick.GUIElement.FRAME_BORDER_RADIUS);
            } else if(this._edge === 'left') {
                var gridMovePx = this.moveCols * this.gridCellWidth;
                ctx.roundRect(x + gridMovePx, y, width - gridMovePx, height, Wick.GUIElement.FRAME_BORDER_RADIUS);
            }
            ctx.save();
            ctx.globalAlpha = 0.8;
                ctx.stroke();
            ctx.restore();

            ctx.restore();
        });
    }

    finish () {
        // Move frames
        this._frames.forEach(frame => {
            frame._originalLayer = frame.parentLayer;
            frame.remove();

            if(this._edge === 'right') {
                frame.end += this.moveCols;
            } else if (this._edge === 'left') {
                frame.start += this.moveCols;
            }
        });

        // Re-add frames to trigger overlap/gap cleanup
        this._frames.forEach(frame => {
            frame._originalLayer.addFrame(frame);
            delete frame._originalLayer;
        });
    }
}
