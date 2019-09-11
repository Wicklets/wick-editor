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

Wick.GUIElement.FrameRightEdge = class extends Wick.GUIElement.FrameEdge {
    /**
     *
     */
    constructor (model) {
        super(model);

        this.on('drag', () => {
            this._stretchSelectedFrames();
        });

        this.on('dragEnd', () => {
            this._dropSelectedFrames();
        });
    }

    get width () {
        return this.model.guiElement.width;
    }

    get height () {
        return this.model.guiElement.height;
    }

    /**
     *
     */
    build () {
        super.build();

        var rw = Wick.GUIElement.FrameEdge.DEFAULT_HANDLE_WIDTH;

        var edgeRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(this.width - rw, 0),
            to: new this.paper.Point(this.width, this.height),
            fillColor: this.isHoveredOver ? Wick.GUIElement.FRAME_HANDLE_HOVER_FILL_COLOR : 'rgba(0,0,0,0.001)',
            radius: Wick.GUIElement.FRAME_BORDER_RADIUS,
        });

        // Create a rectangle with unrounded edges to sharpen the interior corners.
        var sharpRect = new this.paper.Path.Rectangle({
            from: new this.paper.Point(this.width - rw, 0),
            to: new this.paper.Point(this.width - (rw/2), this.height),
            fillColor: this.isHoveredOver ? Wick.GUIElement.FRAME_HANDLE_HOVER_FILL_COLOR : 'rgba(0,0,0,0.001)',
        });

        this.item.addChild(edgeRect);
        this.item.addChild(sharpRect);
    }

    _stretchSelectedFrames () {
        this._getFarthestRightFrames().forEach(frame => {
            var frameElem = frame.guiElement;
            frameElem.item.bringToFront();
            frameElem.ghost.active = true;
            frameElem.rightEdgeStretch = this.mouseDelta.x;
            frameElem.build();
        });
    }

    _dropSelectedFrames () {
        this.model.guiElement._tryToDropFrames();
        this._getFarthestRightFrames().forEach(frame => {
            var frameElem = frame.guiElement;
            frameElem.ghost.active = false;
            frameElem.rightEdgeStretch = 0;
            frameElem.build();
        });
    }

    _getFarthestRightFrames () {
        var frames = [];
        var layers = this.model.guiElement.selectedFramesByLayers;
        for(var uuid in layers) {
            var layerFrames = layers[uuid];
            var farthestFrame = layerFrames.sort((a, b) => {
                return b.end - a.end;
            })[0];
            if(farthestFrame.parentLayer !== this.model.parentLayer) {
                frames.push(farthestFrame);
            }
        }
        if(frames.indexOf(this.model) === -1) {
            frames.push(this.model);
        }
        return frames;
    }
}
