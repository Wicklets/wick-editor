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

Wick.GUIElement.Playhead = class extends Wick.GUIElement {
    /**
     *
     */
    constructor (model) {
        super(model);
    }

    get cursor () {
        return 'move';
    }

    get x () {
        return Wick.GUIElement.PLAYHEAD_MARGIN;
    }

    get y () {
        return 0;
    }

    get width () {
        return this.gridCellWidth - Wick.GUIElement.PLAYHEAD_MARGIN*2;
    }

    get height () {
        return this.width *.9;
    }

    /**
     *
     */
    build () {
        super.build();

        var playheadTop = new this.paper.Path({
            segments: [
              [this.x, this.y],
              [this.x + this.width, this.y],
              [this.x + this.width, this.y + this.height],
              [this.x + this.width/2, this.y + this.height + this.height/2],
              [this.x, this.y + this.height],
              [this.x, this.y],
            ],
            fillColor: Wick.GUIElement.PLAYHEAD_FILL_COLOR,
            strokeWidth: 5,
            strokeColor: Wick.GUIElement.PLAYHEAD_FILL_COLOR,
            strokeJoin: 'round',
            radius: 4,
        });

        this.item.addChild(playheadTop);

        var playheadBody = new this.paper.Path.Rectangle({
            from: new this.paper.Point(this.gridCellWidth/2 - Wick.GUIElement.PLAYHEAD_STROKE_WIDTH/2, 0),
            to: new this.paper.Point(this.gridCellWidth/2 + Wick.GUIElement.PLAYHEAD_STROKE_WIDTH/2, paper.view.element.height),
            fillColor: Wick.GUIElement.PLAYHEAD_FILL_COLOR,
        });

        this.item.locked = true;
        this.item.addChild(playheadBody);

        this.item.position.x = (this.model.playheadPosition-1) * this.gridCellWidth;
        
        
        // Add gnurl handles.
        var handleMargin = 3; 
        var handleSpacing = 4;

        var handleLeft = this.x + handleMargin;
        var handleRight = handleLeft + this.width - handleMargin*2;

        for (var i=0; i<3; i++) {
            var playheadGrabHandle = new this.paper.Path({
                segments: [
                  [handleLeft, this.y+handleSpacing*(i + 1)],
                  [handleRight, this.y+handleSpacing*(i + 1)],
                ],
                strokeWidth: 2,
                strokeColor: Wick.GUIElement.PLAYHEAD_STROKE_COLOR,
                strokeCap: 'round',
            });
            this.item.addChild(playheadGrabHandle);
        }
    }
}
