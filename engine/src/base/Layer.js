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
        this.name = args.name || null;
    }

    _serialize (args) {
        var data = super._serialize(args);

        data.locked = this.locked;
        data.hidden = this.hidden;

        return data;
    }

    _deserialize (data) {
        super._deserialize(data);

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
     * Adds a frame to the layer.
     * @param {Wick.Frame} frame - The frame to add to the Layer.
     */
    addFrame (frame) {
        this.addChild(frame);
        this.resolveOverlap([frame]);
        this.resolveGaps([frame]);
    }

    /**
     * Adds a tween to the active frame of this layer (if one exists).
     * @param {Wick.Tween} tween - the tween to add
     */
    addTween (tween) {
        this.activeFrame && this.activeFrame.addChild(tween);
    }

    /**
     * Adds a frame to the layer. If there is an existing frame where the new frame is
     * inserted, then the existing frame will be cut, and the new frame will fill the
     * gap created by that cut.
     * @param {number} playheadPosition - Where to add the blank frame.
     */
    insertBlankFrame (playheadPosition) {
        if(!playheadPosition) {
            throw new Error('insertBlankFrame: playheadPosition is required');
        }

        var frame = new Wick.Frame({start: playheadPosition});
        this.addChild(frame);

        // If there is is overlap with an existing frame
        var existingFrame = this.getFrameAtPlayheadPosition(playheadPosition);
        if (existingFrame) {
            // Make sure the new frame fills the empty space
            frame.end = existingFrame.end;
        }

        this.resolveOverlap([frame]);
        this.resolveGaps([frame]);

        return frame;
    }

    /**
     * Removes a frame from the Layer.
     * @param  {Wick.Frame} frame Frame to remove.
     */
    removeFrame (frame) {
        this.removeChild(frame);
        this.resolveGaps();
    }

    /**
     * Gets the frame at a specific playhead position.
     * @param {number} playheadPosition - Playhead position to search for frame at.
     * @return {Wick.Frame} The frame at the given playheadPosition.
     */
    getFrameAtPlayheadPosition (playheadPosition) {
        return this.frames.find(frame => {
            return frame.inPosition(playheadPosition);
        }) || null;
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
     * Gets all frames in the layer that are contained within the two given playhead positions.
     * @param {number} playheadPositionStart - The start of the range to search
     * @param {number} playheadPositionEnd - The end of the range to search
     * @return {Wick.Frame[]} The frames contained in the given range.
     */
    getFramesContainedWithin (playheadPositionStart, playheadPositionEnd) {
        return this.frames.filter(frame => {
            return frame.containedWithin(playheadPositionStart, playheadPositionEnd);
        });
    }

    /**
     * Prevents frames from overlapping each other by removing pieces of frames that are touching.
     * @param {Wick.Frame[]} newOrModifiedFrames - the frames that should take precedence when determining which frames should get "eaten".
     */
    resolveOverlap (newOrModifiedFrames) {
        newOrModifiedFrames = newOrModifiedFrames || [];

        // Ensure that frames never go beyond the beginning of the timeline
        newOrModifiedFrames.forEach(frame => {
            if(frame.start <= 1) {
                frame.start = 1;
            }
        });

        var isEdible = existingFrame => {
            return newOrModifiedFrames.indexOf(existingFrame) === -1;
        };

        newOrModifiedFrames.forEach(frame => {
            // "Full eat"
            // The frame completely eats the other frame.
            var containedFrames = this.getFramesContainedWithin(frame.start, frame.end);
            containedFrames.filter(isEdible).forEach(existingFrame => {
                existingFrame.remove();
            });

            // "Right eat"
            // The frame takes a chunk out of the right side of another frame.
            this.frames.filter(isEdible).forEach(existingFrame => {
                if(existingFrame.inPosition(frame.start) && existingFrame.start !== frame.start) {
                    existingFrame.end = frame.start - 1;
                }
            });

            // "Left eat"
            // The frame takes a chunk out of the left side of another frame.
            this.frames.filter(isEdible).forEach(existingFrame => {
                if(existingFrame.inPosition(frame.end) && existingFrame.end !== frame.end) {
                    existingFrame.start = frame.end + 1;
                }
            });
        });
    }

    /**
     * Prevents gaps between frames by extending frames to fill empty space between themselves.
     */
    resolveGaps (newOrModifiedFrames) {
        if(this.parentTimeline && this.parentTimeline.waitToFillFrameGaps) return;

        newOrModifiedFrames = newOrModifiedFrames || [];

        var fillGapsMethod = this.parentTimeline && this.parentTimeline.fillGapsMethod;
        if(!fillGapsMethod) fillGapsMethod = 'blank_frames';

        this.findGaps().forEach(gap => {
            // Method 1: Use the frame on the left (if there is one) to fill the gap
            if(fillGapsMethod === 'auto_extend') {
                var frameOnLeft = this.getFrameAtPlayheadPosition(gap.start-1);
                if(!frameOnLeft || newOrModifiedFrames.indexOf(frameOnLeft) !== -1 || gap.start === 1) {
                    // If there is no frame on the left, create a blank one
                    var empty = new Wick.Frame({
                        start: gap.start,
                        end: gap.end,
                    });
                    this.addFrame(empty);
                } else {
                    // Otherwise, extend the frame to the left to fill the gap
                    frameOnLeft.end = gap.end;
                }
            }

            // Method 2: Always create empty frames to fill gaps
            if(fillGapsMethod === 'blank_frames') {
                var empty = new Wick.Frame({
                    start: gap.start,
                    end: gap.end,
                });
                this.addFrame(empty);
            }
        });
    }

    /**
     * Generate a list of positions where there is empty space between frames.
     * @returns {Object[]} An array of objects with start/end positions describing gaps.
     */
    findGaps () {
        var gaps = [];

        var currentGap = null;
        for(var i = 1; i <= this.length; i++) {
            var frame = this.getFrameAtPlayheadPosition(i);

            // Found the start of a gap
            if(!frame && !currentGap) {
                currentGap = {};
                currentGap.start = i;
            }

            // Found the end of a gap
            if(frame && currentGap) {
                currentGap.end = i-1;
                gaps.push(currentGap);
                currentGap = null;
            }
        }

        return gaps;
    }
}
