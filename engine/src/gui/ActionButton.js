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

Wick.GUIElement.ActionButton = class extends Wick.GUIElement.Button {
    constructor (model, args) {
        super(model, args);

        this.icon = args.icon;
    };

    draw (isActive) {
        super.draw();

        var ctx = this.ctx;

        // Disable pointer cursor if the button isn't active
        if(isActive) {
            this.cursor = 'pointer';
        } else {
            this.cursor = 'default';
        }

        // Button Circle
        if (isActive && this.mouseState == 'over') {
            ctx.fillStyle = Wick.GUIElement.ACTION_BUTTON_COLOR;
        } else {
            ctx.fillStyle = Wick.GUIElement.TIMELINE_BACKGROUND_COLOR;
        }
        ctx.beginPath();
        ctx.arc(0, 0, Wick.GUIElement.ACTION_BUTTON_RADIUS, 0, 2 * Math.PI);
        ctx.fill();

        // Button Icon
        var r = Wick.GUIElement.ACTION_BUTTON_RADIUS * 0.8;
        ctx.drawImage(Wick.GUIElement.Icons.getIcon(this.icon), -r, -r, r*2, r*2);
    };

    get bounds () {
        var r = Wick.GUIElement.ACTION_BUTTON_RADIUS;
        return {
            x: -r,
            y: -r,
            width: r * 2,
            height: r * 2,
        }
    }
};
