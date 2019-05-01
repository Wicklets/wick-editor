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

Wick.GUIElement.LayerButton = class extends Wick.GUIElement.Clickable {
    /**
     *
     */
    constructor (model) {
        super(model);
        this.x = 0;
        this.y = 0;

        this.on('mouseOver', () => {
            this.build();
        });

        this.on('mouseDown', () => {
            this.build();
        });

        this.on('mouseUp', () => {
            this.build();
        });

        this.on('mouseLeave', () => {
            this.build();
        });
    }

    /**
     *
     */
    get x () {
        return this._x;
    }

    set x (x) {
        this._x = x;
    }

    /**
     *
     */
    get y () {
        return this._y;
    }

    set y (y) {
        this._y = y;
    }

    /**
     *
     */
    get activated () {
        return false;
    }

    /**
     *
     */
    build () {
        super.build();

        var fillColor;
        if(this.isBeingClicked) {
            fillColor = Wick.GUIElement.LAYER_BUTTON_MOUSEDOWN_COLOR;
        } else if (this.isHoveredOver) {
            fillColor = Wick.GUIElement.LAYER_BUTTON_HOVER_COLOR;
        } else if (this.activated) {
            fillColor = Wick.GUIElement.LAYER_BUTTON_TOGGLE_ACTIVE_COLOR;
        } else {
            fillColor = Wick.GUIElement.LAYER_BUTTON_TOGGLE_INACTIVE_COLOR;
        }

        // Button circle
        var buttonCircle = new paper.Path.Circle({
            center: [0, 0],
            radius: 10,
            fillColor: fillColor,
        });
        this.item.addChild(buttonCircle);

        // Icon
        var icon = this.paper.project.importSVG(this.icon);
        icon.strokeColor = Wick.GUIElement.LAYER_BUTTON_ICON_COLOR;
        icon.opacity = Wick.GUIElement.LAYER_BUTTON_ICON_OPACITY;
        icon.position.x -= icon.bounds.width/2;
        icon.position.y -= icon.bounds.height/2;
        this.item.addChild(icon);

        this.item.position = new paper.Point(this.x, this.y);

    }
}
