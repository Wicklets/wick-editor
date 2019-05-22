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

/**
 * Represents a Wick Layer.
 */
Wick.Layer = class extends Wick.Base {
    /**
     * Called when creating a Wick Layer.
     * @param {string} name - Name of the layer.
     * @param {boolean} locked - Is the layer locked?
     * @param {boolean} hideen - Is the layer hidden?
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        this.locked = args.locked === undefined ? false : args.locked;
        this.hidden = args.hidden === undefined ? false : args.hidden;

        this.name = args.name || 'New Layer';
    }

    deserialize (data) {
        super.deserialize(data);

        this.locked = data.locked;
        this.hidden = data.hidden;
        this.name = data.name;
    }

    serialize (args) {
        var data = super.serialize(args);

        data.locked = this.locked;
        data.hidden = this.hidden;
        data.name = this.name;

        return data;
    }

    get classname () {
        return 'Layer';
    }

    /**
     * The frames belonging to this layer.
     * @type {Wick.Frame[]}
     */
    get frames () {
        return this.children.filter(child => {
            return child instanceof Wick.Frame;
        })
    }

    /**
     * The name of the layer.
     * @type {string}
     */
    get name () {
        return this._name;
    }

    set name (name) {
        this._name = name;
    }

    /**
     * The order of the Layer in the timeline.
     * @type {number}
     */
    get index () {
        return this.parent && this.parent.layers.indexOf(this);
    }

    /**
     * Set this layer to be the active layer in its timeline.
     */
    activate () {
        this.parent.activeLayerIndex = this.index;
    }

    /**
     * True if this layer is the active layer in its timeline.
     * @type {boolean}
     */
    get isActive () {
        return this.parent && this === this.parent.activeLayer;
    }

    /**
     * The length of the layer in frames.
     * @type {number}
     */
    get length () {
        var end = 0;
        this.frames.forEach(function (frame) {
            if(frame.end > end) {
                end = frame.end;
            }
        });
        return end;
    }

    /**
     * The active frame on the layer.
     * @type {Wick.Frame}
     */
    get activeFrame () {
        if(!this.parent) return null;
        return this.getFrameAtPlayheadPosition(this.parent.playheadPosition);
    }

    /**
     * Moves this layer to a different position, inserting it before/after other layers if needed.
     * @param {Wick.Layer} layer - The layer to add.
     * @param {number} index - the new position to move the layer to.
     */
    move (index) {
        this.parentTimeline.moveLayer(this, index);
    }

    /**
     * Remove this layer from its timeline.
     */
    remove () {
        this.parent.removeLayer(this);
    }

    /**
     * Adds a frame to the layer. If a frame exists when the new frame wants to go, the existing frame will be replaced with the new frame.
     * @param {Wick.Frame} frame - The frame to add to the Layer.
     * @param {boolean} options.removeOverlappingFrames - Should adding this frame delete the frames that are in the new frames place? Defaults to true.
     */
    addFrame (frame, options) {
        if(!options) options = {};
        if(options.removeOverlappingFrames === undefined) options.removeOverlappingFrames = true;

        if(options.removeOverlappingFrames) {
            this.getFramesInRange(frame.start, frame.end).forEach(existingFrame => {
                existingFrame.remove();
            });
        }
        this.addChild(frame);
    }

    /**
     * Removes a frame from the Layer.
     * @param  {Wick.Frame} frame Frame to remove.
     */
    removeFrame (frame) {
        this.removeChild(frame);
    }

    /**
     * Gets the frame at a specific playhead position.
     * @param  {number} playheadPosition Playhead position to search for frame at.
     * @return {Wick.Frame}              The frame at the given playheadPosition.
     */
    getFrameAtPlayheadPosition (playheadPosition) {
        return this.frames.find(frame => {
            return frame.inPosition(playheadPosition);
        });
    }

    /**
     * Gets all frames in the layer that are between the two given playhead positions.
     * @param {number} playheadPositionStart - The start of the range to search
     * @param {number} playheadPositionEnd - The end of the range to search
     * @return {Wick.Frame[]} The frames in the given range.
     */
    getFramesInRange (playheadPositionStart, playheadPositionEnd) {
        return this.frames.filter(frame => {
            return frame.inRange(playheadPositionStart, playheadPositionEnd);
        })
    }
}
