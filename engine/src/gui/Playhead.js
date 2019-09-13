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

    draw () {
        super.draw();

        var ctx = this.ctx;

        var width = this.gridCellWidth - Wick.GUIElement.PLAYHEAD_MARGIN * 2;
        var height = width * 0.9;

        ctx.fillStyle = Wick.GUIElement.PLAYHEAD_FILL_COLOR;
        ctx.strokeStyle = Wick.GUIElement.PLAYHEAD_FILL_COLOR;
        ctx.lineWidth = 5,
        ctx.save();
        ctx.translate((this.model.playheadPosition - 1) * this.gridCellWidth, 0);
            // Playhead body
            var playheadX = this.gridCellWidth / 2 - Wick.GUIElement.PLAYHEAD_STROKE_WIDTH / 2 + 1.5;
            ctx.strokeStyle = 'Wick.GUIElement.PLAYHEAD_FILL_COLOR';
            ctx.lineWidth = Wick.GUIElement.PLAYHEAD_STROKE_WIDTH;
            ctx.beginPath();
            ctx.moveTo(playheadX, 0);
            ctx.lineTo(playheadX, this.canvas.height);
            ctx.stroke();

            // Playhead top
            ctx.save();
            ctx.translate(Wick.GUIElement.PLAYHEAD_MARGIN, 0);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(width, 0);
                ctx.lineTo(width, height);
                ctx.lineTo(width / 2, height * 3 / 2);
                ctx.lineTo(0, height);
                ctx.lineTo(0, 0);
                ctx.fill();
                ctx.stroke();

                // Add gnurl handles.
                var handleMargin = 3;
                var handleSpacing = 4;

                var handleLeft = handleMargin;
                var handleRight = handleLeft + width - handleMargin * 2;

                ctx.strokeStyle = Wick.GUIElement.PLAYHEAD_STROKE_COLOR;
                ctx.lineWidth = 2;
                for (var i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(handleLeft, handleSpacing * (i + 1));
                    ctx.lineTo(handleRight, handleSpacing * (i + 1));
                    ctx.stroke();
                }
            ctx.restore();
        ctx.restore();
    }
}
