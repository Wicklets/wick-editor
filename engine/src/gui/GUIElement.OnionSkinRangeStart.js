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

Wick.GUIElement.OnionSkinRangeStart = class extends Wick.GUIElement.OnionSkinRange {
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
    get x() {
        var project = this.model.project;
        var x = (project.activeTimeline.playheadPosition - project.onionSkinSeekBackwards + 1) * this.gridCellWidth;
        x += this.dragOffset * this.gridCellWidth;
        x -= project.activeTimeline.playheadPosition*this.gridCellWidth;
        x = (x-Math.abs(x))/2;
        x += (project.activeTimeline.playheadPosition - 1)*this.gridCellWidth;
        return x;
        }
        /**
         *
         */


        get y() {
        return 0;
        }
        /**
         *
         */

        get width() {
        return this.gridCellWidth - Wick.GUIElement.PLAYHEAD_MARGIN * 2;
        }


        drop() {
        this.model.project.onionSkinSeekBackwards = project.activeTimeline.playheadPosition - Math.floor(this.x / this.gridCellWidth);
        this.dragOffset = 0;
        }
        /**
         *
         */


        build () {
        super.build();

        if(!this.model.project.onionSkinEnabled) return;

        var playheadPosition = this.model.project.activeTimeline.playheadPosition*this.gridCellWidth - this.width*0.875;
        super.build();
        var rangeSlider = new this.paper.Path({
            segments: [[playheadPosition - this.width / 2, this.y], [playheadPosition - this.width / 2, this.y + this.width], [playheadPosition, this.y + 2.5 + this.width * 1.5], [this.x - this.width / 2, this.y + 2.5 + this.width * 1.5], [this.x - this.width - 2.5, this.y + this.width], [this.x - this.width - 2.5, this.y]],
            fillColor: {
            gradient: {
                stops: ['rgba(255,92,92,0.2)','rgba(255,92,92,1)'], //Wick.GUIElement.PLAYHEAD_FILL_COLOR
            },
            origin: [playheadPosition,0],
            destination: [this.x-this.width,0],
            },
            opacity: this.isHoveredOver ? 1 : 0.5,
            strokeJoin: 'round',
            radius: 4,
        });
        this.item.addChild(rangeSlider);
    }
}
