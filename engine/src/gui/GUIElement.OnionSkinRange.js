/*
 * Copyright 2018 WICKLETS LLC
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

Wick.GUIElement.OnionSkinRange = class extends Wick.GUIElement.Draggable {
    /**
     *
     */
    static get DEFAULT_HANDLE_WIDTH () {
        return 10;
    }

    /**
     *
     */
    constructor (model) {
        super(model);

        this.height = 0;
        this.dragOffset = 0;

        this.on('mouseOver', () => {
            this.build();
        });

        this.on('mouseDown', (e) => {
            this.build();
        });

        this.on('mouseLeave', () => {
            this.build();
        });
    }

    /**
     *
     */
    build () {
        super.build();
    }
}
