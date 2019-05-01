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

Wick.GUIElement.OnionSkinRangeEnd = class extends Wick.GUIElement.OnionSkinRange {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.on('drag', () => {
            this.dragOffset = Math.floor(this.mouseDelta.x / this.gridCellWidth);
            this.build();
        });

        this.on('dragEnd', () => {
            this.drop();
            this.build();
            this.model.project.guiElement.fire('projectModified');
        });
    }

    /**
     *
     */
    get x () {
        var project = this.model.project;
        var x = (project.activeTimeline.playheadPosition + project.onionSkinSeekForwards - 1) * this.gridCellWidth;
        x += this.gridCellWidth;
        x -= Wick.GUIElement.OnionSkinRange.DEFAULT_HANDLE_WIDTH;
        x += this.dragOffset * this.gridCellWidth;
        return x;
    }

    /**
     *
     */
    get y () {
        return 0;
    }

    /**
     *
     */
    drop () {
        this.model.project.onionSkinSeekForwards = project.activeTimeline.playheadPosition + Math.floor(-this.x / this.gridCellWidth);
        this.model.project.onionSkinSeekForwards *= -1;
        this.dragOffset = 0;
    }

    /**
     *
     */
    build () {
        super.build();

        if(!this.model.project.onionSkinEnabled) return;

        var rangeSlider = new this.paper.Path.Rectangle({
            from: new this.paper.Point(this.x, this.y),
            to: new this.paper.Point(this.x + Wick.GUIElement.OnionSkinRange.DEFAULT_HANDLE_WIDTH, this.y + this.height),
            fillColor: this.isHoveredOver ? '#ff0000' : '#0000ff',
            strokeColor: '#000000',
        });
        this.item.addChild(rangeSlider);
    }
}
