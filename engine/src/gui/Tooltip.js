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

Wick.GUIElement.Tooltip = class extends Wick.GUIElement {
    constructor (model, label) {
        super(model);

        this.label = label;
    };

    draw (x, y) {
        super.draw();

        // No label was given yet - don't render.
        if(!this.label) return;

        var ctx = this.ctx;

        // Font settings
        ctx.font = "14px Nunito Sans";
        var textContent = this.label;
        var textWidth = ctx.measureText(textContent).width;
        var textHeight = 14;

        // Tooltip
        ctx.save();
        var tx = x - textWidth/2;
        var ty = y + textHeight;
        if(tx < 3) tx = 3;
        ctx.translate(tx, ty);

            // Body
            var margin = 4;
            var r = Wick.GUIElement.FRAME_BORDER_RADIUS
            ctx.fillStyle = '#3878AF';
            ctx.beginPath();
            ctx.roundRect(-margin/2, -margin/2, textWidth+margin, textHeight+margin, r);
            ctx.fill();

            // Label text
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(textContent, 0, 12);

        ctx.restore();
    }
};
