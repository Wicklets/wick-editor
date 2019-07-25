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

Wick.GUIElement.TimelineAddFrameButton = class extends Wick.GUIElement.LayerButton {
    /**
     *
     */
    constructor (model) {
        super(model);
        this.x = 0;
        this.y = 0;

        this.on('mouseDown', () => {
            // TODO
            this.model.project.guiElement.fire('projectModified');
        });
    }

    get tooltip () {
        return "Copy Forward";
    }


    get radius () {
        return 14;
    }

    get opacity () {
        return 1;
    }

    get fillColor () {
        return 'rgba(0,0,0,0)'; 
    }

    get strokeColor () {
        if (this.isHoveredOver) {
            return '#000000';
        } else {
            return '#979797'; 
        }   
    }

    /**
     *
     */
    get activated () {
        return false;
    }

    get icon () {
        return Wick.GUIElement.TIMELINE_COPY_FORWARD_BUTTON_ICON;
    }

    /**
     *
     */
    build () {
        super.build();
    }
}
