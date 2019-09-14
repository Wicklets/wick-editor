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

        this.grabber = new Wick.GUIElement.ScrollbarGrabber(this.model, direction);
        this.direction = direction;
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        this.maxWidth = this.canvas.width - this.localTranslation.x - Wick.GUIElement.SCROLLBAR_SIZE;
        this.maxHeight = this.canvas.height - this.localTranslation.y - Wick.GUIElement.SCROLLBAR_SIZE;
        var size = Wick.GUIElement.SCROLLBAR_SIZE;

        // Don't render the scrollbar if there's not enough content to scroll
        if(!this._canScrollVertically() && this.direction === 'vertical') {
            return;
        }

        // Background
        ctx.fillStyle = Wick.GUIElement.SCROLLBAR_BACKGROUND_COLOR;
        ctx.beginPath();
        if(this.direction === 'horizontal') {
            ctx.rect(0, 0, this.maxWidth, size);
        } else if (this.direction === 'vertical') {
            ctx.rect(0, 0, size, this.maxHeight);
        }
        ctx.fill();

        // Background corner piece
        if(this.direction === 'horizontal') {
            ctx.fillStyle = Wick.GUIElement.SCROLLBAR_BACKGROUND_COLOR;
            ctx.beginPath();
            ctx.roundRect(this.maxWidth, 0, this.maxWidth + size, size, 0);
            ctx.fill();
        }

        // Grabber piece
        ctx.save();
        if(this.direction === 'horizontal') {
            ctx.translate(0, 0);
        } else if(this.direction === 'vertical') {
            ctx.translate(0, 0);
        }

        this.grabber.draw();

        ctx.restore();
    }

    _canScrollVertically () {
        return this.model.layers.length * this.gridCellHeight + this.gridCellHeight * 2 > this.maxHeight;
    }
}
