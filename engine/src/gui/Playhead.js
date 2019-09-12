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

Wick.GUIElement.Playhead = class extends Wick.GUIElement {
    constructor (model) {
        super(model);
    }

/*
    get cursor () {
        return 'move';
    }

    get x () {
        return Wick.GUIElement.PLAYHEAD_MARGIN;
    }

    get y () {
        return 0;
    }

    get width () {
        return this.gridCellWidth - Wick.GUIElement.PLAYHEAD_MARGIN*2;
    }

    get height () {
        return this.width *.9;
    }
    */

    draw () {
        super.draw();

        var ctx = this.ctx;

        var x = Wick.GUIElement.PLAYHEAD_MARGIN;
        var y = 0;
        var width = this.gridCellWidth - Wick.GUIElement.PLAYHEAD_MARGIN * 2;
        var height = width * 0.9;

        ctx.fillStyle = Wick.GUIElement.PLAYHEAD_FILL_COLOR;
        ctx.strokeStyle = Wick.GUIElement.PLAYHEAD_FILL_COLOR;
        ctx.lineWidth = 5,
        ctx.save();
        ctx.translate(this.model.playheadPosition * this.gridCellWidth, 0);
            // Playhead top
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x + width / 2, y + height * 3 / 2);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x, y);
            ctx.fill();
            ctx.stroke();

            // Playhead body
            var playheadX = this.gridCellWidth/2 - Wick.GUIElement.PLAYHEAD_STROKE_WIDTH/2;
            ctx.strokeStyle = 'Wick.GUIElement.PLAYHEAD_FILL_COLOR';
            ctx.lineWidth = Wick.GUIElement.PLAYHEAD_STROKE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(playheadX, 0);
            ctx.lineTo(playheadX, this.canvas.height);
            ctx.stroke();

            // Add gnurl handles.
            var handleMargin = 3;
            var handleSpacing = 4;

            var handleLeft = x + handleMargin;
            var handleRight = handleLeft + width - handleMargin * 2;

            ctx.strokeStyle = Wick.GUIElement.PLAYHEAD_STROKE_COLOR;
            ctx.lineWidth = 2;
            for (var i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(handleLeft, y + handleSpacing * (i + 1));
                ctx.lineTo(handleRight, y + handleSpacing * (i + 1));
                ctx.stroke();
            }
        ctx.restore();
    }
}
