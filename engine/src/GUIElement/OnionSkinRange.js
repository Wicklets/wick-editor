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

        this.cursor = 'grab';
        this.canAutoScrollX = true;

        this.direction = direction;
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Save where the mouse is if the user wants to drag the sliders around
        this.mousePlayheadPosition = Math.round(this.localMouse.x / this.gridCellWidth);

        // Calculate positions of the handle
        var seek = this.direction === 'right' ? this.model.project.onionSkinSeekForwards : this.model.project.onionSkinSeekBackwards;
        var width = seek * this.gridCellWidth;
        var edgeWidth = this.gridCellWidth - Wick.GUIElement.PLAYHEAD_MARGIN * 2;
        var height = Wick.GUIElement.NUMBER_LINE_HEIGHT * 0.9;

        // Draw handle
        var grd = ctx.createLinearGradient(0, 0, width + edgeWidth, 0);
        grd.addColorStop(0, 'rgba(255,92,92,0.2)');
        grd.addColorStop(1, 'rgba(255,92,92,1)');
        ctx.fillStyle = grd;
        ctx.lineWidth = 1,

        ctx.save();
        ctx.globalAlpha = this.mouseState === 'over' ? 0.5 : 1.0;
        if(this.direction == 'left') ctx.scale(-1, 1);
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

    onMouseDrag (e) {
        if(this.direction === 'right') {
            this.model.project.onionSkinSeekForwards = Math.max(1, this.mousePlayheadPosition);
        } else if(this.direction === 'left') {
            this.model.project.onionSkinSeekBackwards = Math.max(1, -this.mousePlayheadPosition);
        }
        this.projectWasSoftModified();
    }

    get bounds () {
        if(this.direction === 'right') {
            return {
                x: this.gridCellWidth/2,
                y: 0,
                width: this.model.project.onionSkinSeekForwards * this.gridCellWidth,
                height: Wick.GUIElement.NUMBER_LINE_HEIGHT,
            };
        } else if (this.direction === 'left') {
            return {
                x: -this.model.project.onionSkinSeekBackwards * this.gridCellWidth - this.gridCellWidth/2,
                y: 0,
                width: this.model.project.onionSkinSeekBackwards * this.gridCellWidth,
                height: Wick.GUIElement.NUMBER_LINE_HEIGHT,
            };
        }
    }
}
