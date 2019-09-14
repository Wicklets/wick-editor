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

// Thanks to FlyOrBoom (https://github.com/FlyOrBoom) for the styling of these sliders!

Wick.GUIElement.OnionSkinRange = class extends Wick.GUIElement {
    constructor (model, direction) {
        super(model);

        this.canAutoScrollX = true;

        this.direction = direction;
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        var width = this.model.project.onionSkinSeekForwards * this.gridCellWidth;
        var edgeWidth = this.gridCellWidth - Wick.GUIElement.PLAYHEAD_MARGIN * 2;
        var height = Wick.GUIElement.NUMBER_LINE_HEIGHT * 0.9;

        // Create gradient
        var grd = ctx.createLinearGradient(0, 0, width + edgeWidth, 0);
        grd.addColorStop(0, 'rgba(255,92,92,0.2)');
        grd.addColorStop(1, 'rgba(255,92,92,1)');

        ctx.fillStyle = grd;
        ctx.lineWidth = 1,
        ctx.save();
        ctx.translate((this.model.playheadPosition - 1) * this.gridCellWidth + this.gridCellWidth/2, 0);
        if(this.direction == 'left') ctx.scale(-1, 1);
            // Playhead top
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(width, 0);
            ctx.lineTo(width + edgeWidth/2, 0);
            ctx.lineTo(width + edgeWidth/2, height * 2/3);
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.lineTo(0, 0);
            ctx.fill();
        ctx.restore();
    }
}
