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
        // Multi frame extending/shrinking isn't reay yet...
        this._frames = [model];//model.project.selection.getSelectedObjects('Frame');

        this._edge = edge;
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        var frame = this._mainFrame;

        // Calculate position values...
        var start = frame.start - this._mainFrame.start;
        var length = frame.length;
        var row = frame.parentLayer.index - this._mainFrame.parentLayer.index;

        var x = start * this.gridCellWidth;
        var y = row * this.gridCellHeight;
        var width = length * this.gridCellWidth;
        var height = this.gridCellHeight;

        this.moveCols = Math.round(this._mouseDiff.x / this.gridCellWidth);

        // Prevent 'inside out' frames
        if(this._edge === 'right') {
            this.moveCols = Math.max(-length + 1, this.moveCols);
        } else if(this._edge === 'left') {
            this.moveCols = Math.min(length - 1, this.moveCols);
        }
        var movePx = this._mouseDiff.x;
        if(this._edge === 'right') {
            movePx = Math.max(movePx, this.moveCols * this.gridCellWidth);
        } else if(this._edge === 'left') {
            movePx = Math.min(movePx, this.moveCols * this.gridCellWidth);
        }

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
            var movePx = this.moveCols * this.gridCellWidth;
            ctx.roundRect(x + movePx, y, width - movePx, height, Wick.GUIElement.FRAME_BORDER_RADIUS);
        }
        ctx.save();
        ctx.globalAlpha = 0.8;
            ctx.stroke();
        ctx.restore();
    }

    finish () {
        var layer = this._mainFrame.parentLayer;
        this._mainFrame.remove();

        if(this._edge === 'right') {
            this._mainFrame.end += this.moveCols;
        } else if (this._edge === 'left') {
            this._mainFrame.start += this.moveCols;
        }

        layer.addFrame(this._mainFrame);
    }
}
