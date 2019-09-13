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

Wick.GUIElement.Scrollbar = class extends Wick.GUIElement {
    constructor (model, direction) {
        super(model);

        this.direction = direction;
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Background
        ctx.fillStyle = this.mouseState === 'over' ? 'red' : Wick.GUIElement.SCROLLBAR_BACKGROUND_COLOR;
        ctx.beginPath();
        if(this.direction === 'horizontal') {
            ctx.rect(0, 0, this.canvas.width - this.localTranslation.x - Wick.GUIElement.SCROLLBAR_SIZE, Wick.GUIElement.SCROLLBAR_SIZE);
        } else if (this.direction === 'vertical') {
            ctx.rect(0, 0, Wick.GUIElement.SCROLLBAR_SIZE, this.canvas.height - this.localTranslation.y - Wick.GUIElement.SCROLLBAR_SIZE);
        }
        ctx.fill();

        // Background corner piece
        /*
        ctx.beginPath();
        ctx.roundRect(width-size, height-size, width, height, 0);
        ctx.fill();
        */
    }

    onMouseDrag () {
        console.log('a')
    }

    get bounds () {
        var width = this.canvas.width - this.localTranslation.x;
        var height = this.canvas.height - this.localTranslation.y;
        var size = Wick.GUIElement.SCROLLBAR_SIZE;

        if(this.direction === 'horizontal') {
            return {
                x: 0,
                y: 0,
                width: width - size,
                height: size
            };
        } else if(this.direction === 'vertical') {
            return {
                x: 0,
                y: 0,
                width: size,
                height: height - size
            };
        }
    }
}
