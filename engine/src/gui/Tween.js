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

Wick.GUIElement.Tween = class extends Wick.GUIElement {
    constructor (model) {
        super(model);

        this.canAutoScrollX = true;
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Tween diamond
        ctx.save();
        ctx.rotate(Math.PI / 4);
            var r = Wick.GUIElement.TWEEN_DIAMOND_RADIUS;
            ctx.fillStyle = Wick.GUIElement.TWEEN_FILL_COLOR_1;
            ctx.beginPath();
            ctx.roundRect(-r, -r, r*2, r*2, 3);
            ctx.fill();
        ctx.restore();
    }
}
