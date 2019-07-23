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

Wick.GUIElement.FramesStrip = class extends Wick.GUIElement.Draggable {
    static get VERTICAL_MARGIN () {
        return 4;
    }

    /**
     *
     */
    constructor (model) {
        super(model);

        this._addFrameOverlay = new Wick.GUIElement.AddFrameOverlay(model);

        this.on('mouseOver', () => {
            this._addFrameOverlay.active = true;
            this._addFrameOverlay.playheadPosition = this.localMouseGrid.x + 1;
            this._addFrameOverlay.build();
        });
        this.on('mouseDown', () => {
            this._addFrameOverlay.active = false;
            var playheadPosition = this._addFrameOverlay.playheadPosition;
            var newFrame = new Wick.Frame({start:playheadPosition});
            this.model.activate();
            this.model.addFrame(newFrame);
            this.model.project.selection.clear();
            this.model.project.selection.select(newFrame);
            this.model.parentTimeline.playheadPosition = playheadPosition;
            this.model.parentTimeline.guiElement.build();
            this.model.project.guiElement.fire('projectModified');
        });
        this.on('mouseLeave', () => {
            this._addFrameOverlay.active = false;
            this._addFrameOverlay.build();
        });
    }

    /**
     *
     */
    get width () {
        return paper.view.element.width - Wick.GUIElement.LAYERS_CONTAINER_WIDTH;
    }

    /**
     *
     */
    get height () {
        return Wick.GUIElement.FRAMES_STRIP_HEIGHT;
    }

    /**
     *
     */
    get x () {
        return 0;
    }

    /**
     *
     */
    get y () {
        return (this.model.index * this.gridCellHeight);
    }

    /**
     *
     */
    build () {
        super.build();

        this.frameStripRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(this.x, this.y),
            to: new this.paper.Point(this.x + this.width, this.y + this.height),
            fillColor: this.model.isActive ? Wick.GUIElement.FRAMES_STRIP_ACTIVE_FILL_COLOR : Wick.GUIElement.FRAMES_STRIP_INACTIVE_FILL_COLOR,
            applyMatrix: false,
            pivot: new paper.Point(0,0),
        });
        this.item.addChild(this.frameStripRect);

        this._addFrameOverlay.build();
        this.item.addChild(this._addFrameOverlay.item);
    }
}
