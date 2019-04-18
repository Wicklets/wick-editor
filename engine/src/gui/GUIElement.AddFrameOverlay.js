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

Wick.GUIElement.AddFrameOverlay = class extends Wick.GUIElement {
    static get MARGIN () {
        return 3;
    }

    /**
     *
     */
    constructor (model) {
        super(model);

        this._playheadPosition = 1;
        this._active = false;

        this.item.locked = true;
    }

    /**
     *
     */
    get playheadPosition () {
        return this._playheadPosition
    }

    set playheadPosition (playheadPosition) {
        this._playheadPosition = playheadPosition;
    }

    /**
     *
     */
    get active () {
        return this._active;
    }

    set active (active) {
        this._active = active;
    }

    /**
     *
     */
    get x () {
        return this.gridCellWidth * (this.playheadPosition-1) + Wick.GUIElement.ADD_FRAME_OVERLAY_MARGIN;
    }

    /**
     *
     */
    get y () {
        return (this.model.index * this.gridCellHeight) + Wick.GUIElement.ADD_FRAME_OVERLAY_MARGIN;
    }

    /**
     *
     */
    get width () {
        return this.gridCellWidth - Wick.GUIElement.ADD_FRAME_OVERLAY_MARGIN*2;
    }

    /**
     *
     */
    get height () {
        return this.gridCellHeight - Wick.GUIElement.ADD_FRAME_OVERLAY_MARGIN*2;
    }

    /**
     *
     */
    build () {
        super.build();

        if(!this.active) return;

        var overlayRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(this.x, this.y),
            to: new this.paper.Point(this.x + this.width, this.y + this.height),
            fillColor: Wick.GUIElement.ADD_FRAME_OVERLAY_FILL_COLOR,
            radius: Wick.GUIElement.ADD_FRAME_OVERLAY_BORDER_RADIUS,
        });
        this.item.addChild(overlayRect);

        var overlayText = new this.paper.PointText({
            point: [this.x + this.width/2, this.y + this.height/2 + 5],
            content: '+',
            fillColor: Wick.GUIElement.ADD_FRAME_OVERLAY_PLUS_COLOR,
            fontFamily: 'Courier New',
            fontWeight: 'bold',
            fontSize: 18,
            justification: 'center',
            pivot: new paper.Point(0, 0),
        });
        this.item.addChild(overlayText);
    }
}
