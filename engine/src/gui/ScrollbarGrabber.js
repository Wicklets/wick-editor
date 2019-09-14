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

Wick.GUIElement.ScrollbarGrabber = class extends Wick.GUIElement {
    constructor (model, direction) {
        super(model);

        this.direction = direction;
        this.horizontalLength = 100;
        this.verticalLength = 50;
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        var fillColor = this.mouseState === 'over' ? Wick.GUIElement.SCROLLBAR_ACTIVE_FILL_COLOR : Wick.GUIElement.SCROLLBAR_FILL_COLOR;
        var r = Wick.GUIElement.SCROLLBAR_BORDER_RADIUS;
        var s = Wick.GUIElement.SCROLLBAR_SIZE - Wick.GUIElement.SCROLLBAR_MARGIN;

        ctx.fillStyle = fillColor;
        ctx.save();
        ctx.translate(Wick.GUIElement.SCROLLBAR_MARGIN/2, Wick.GUIElement.SCROLLBAR_MARGIN/2);
            if(this.direction === 'horizontal') {
                ctx.beginPath();
                ctx.roundRect(0, 0, this.horizontalLength, s, r);
                ctx.fill();
            } else if (this.direction === 'vertical') {
                ctx.beginPath();
                ctx.roundRect(0, 0, s, this.verticalLength, r);
                ctx.fill();
            }
        ctx.restore();
    }

    onMouseDrag (e) {
        this.project.scrollX += e.movementX;
    }

    get bounds () {
        if(this.direction === 'horizontal') {
            return {
                x: 0,
                y: 0,
                width: this.horizontalLength,
                height: Wick.GUIElement.SCROLLBAR_SIZE,
            };
        } else if(this.direction === 'vertical') {
            return {
                x: 0,
                y: 0,
                width: Wick.GUIElement.SCROLLBAR_SIZE,
                height: this.verticalLength,
            };
        }
    }
}
