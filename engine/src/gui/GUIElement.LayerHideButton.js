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

Wick.GUIElement.LayerHideButton = class extends Wick.GUIElement.LayerButton {
    /**
     *
     */
    constructor (model) {
        super(model);
        this.x = 0;
        this.y = 0;

        this.on('mouseDown', () => {
            this.model.hidden = !this.model.hidden;
            this.model.project.guiElement.fire('projectModified');
        });
    }

    /**
     *
     */
    get activated () {
        return this.model.hidden;
    }

    get icon () {
        return Wick.GUIElement.LAYER_HIDE_BUTTON_ICON;
    }

    /**
     *
     */
    build () {
        super.build();
    }
}
