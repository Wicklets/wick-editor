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
     * @param {boolean} locked - Is the layer locked?
     * @param {boolean} hideen - Is the layer hidden?
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        this.locked = args.locked === undefined ? false : args.locked;
        this.hidden = args.hidden === undefined ? false : args.hidden;
        this.name = args.name || 'Layer';
    }

    serialize (args) {
        var data = super.serialize(args);

        data.locked = this.locked;
        data.hidden = this.hidden;

        return data;
    }

    deserialize (data) {
        super.deserialize(data);

        this.locked = data.locked;
        this.hidden = data.hidden;
    }

    get classname () {
        return 'Layer';
    }

    /**
     * The frames belonging to this layer.
     * @type {Wick.Frame[]}
     */
    get frames () {
        return this.getChildren('Frame');
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
     * @param {number} index - the new position to move the layer to.
     */
    move (index) {
        this.parentTimeline.moveLayer(this, index);
    }

    /**
     * Remove this layer from its timeline.
     */
    remove () {
        this.parentTimeline.removeLayer(this);
    }

    /**
     * Adds a frame to the layer. NOTE: If you are moving multiple frames at once, use addFrames instead or the frames will eat each other!
     * @param {Wick.Frame} frame - The frame to add to the Layer.
     */
    addFrame (frame) {
        this.addFrames([frame]);
    }

    /**
     * Adds multiple frames to the layer.
     * @param {Wick.Frame[]} frames - The frames to add to the Layer.
     */
    addFrames (frames) {
        frames.forEach(frame => {
            this.addChild(frame);
        });
        this.cleanup(frames);
    }

    /**
     * Removes a frame from the Layer.
     * @param  {Wick.Frame} frame Frame to remove.
     */
    removeFrame (frame) {
        this.removeChild(frame);
        this.cleanup();
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
        });
    }

    /**
     * Prevents overlapping frames and gaps between frames. Call this after adding/removing/modifying any frames.
     * @param {Wick.Frame[]} newOrModifiedFrames - (optional) the frames to take precidence while resolving overlaps.
     */
    cleanup (newOrModifiedFrames) {
        if(!newOrModifiedFrames) newOrModifiedFrames = [];
        this.resolveOverlap(newOrModifiedFrames);
        this.resolveGaps();
    }

    /**
     * Prevents frames from overlapping each other by removing pieces of frames that are touching.
     */
    resolveOverlap (newOrModifiedFrames) {
        newOrModifiedFrames.forEach(frame => {
            this.getFramesInRange(frame.start, frame.end).forEach(existingFrame => {
                if(existingFrame === frame) return;
                existingFrame.remove();
            });
        })
    }

    /**
     * Prevents gaps between frames by extending frames to fill empty space between themselves.
     */
    resolveGaps () {

    }

    /**
     * Generate a list of positions where there is empty space between frames.
     * @returns {Object[]} An array of objects with start/end positions describing gaps.
     */
    findGaps () {

    }
}
