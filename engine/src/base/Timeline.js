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
 * Class representing a Wick Timeline.
 */
Wick.Timeline = class extends Wick.Base {
    /**
     * Create a timeline.
     */
    constructor (args) {
        super(args);

        this._playheadPosition = 1;
        this._activeLayerIndex = 0;

        this._playing = true;
        this._forceNextFrame = null;
    }

    deserialize (data) {
        super.deserialize(data);

        this._playheadPosition = data.playheadPosition;
        this._activeLayerIndex = data.activeLayerIndex;
    }

    serialize (args) {
        var data = super.serialize(args);

        data.playheadPosition = this._playheadPosition;
        data.activeLayerIndex = this._activeLayerIndex;

        return data;
    }

    get classname () {
        return 'Timeline';
    }

    /**
     * The layers that belong to this timeline.
     * @type {Wick.Layer}
     */
    get layers () {
        return this.children.filter(child => {
            return child instanceof Wick.Layer;
        });
    }

    /**
     * The position of the playhead. Determines which frames are visible.
     * @type {number}
     */
    get playheadPosition () {
        return this._playheadPosition;
    }

    set playheadPosition (playheadPosition) {
        // Automatically clear selection when any playhead moves
        if(this.project && this._playheadPosition !== playheadPosition) {
            this.project.selection.clear('Canvas');
        }

        this._playheadPosition = playheadPosition;
    }

    /**
     * The index of the active layer. Determines which frame to draw onto.
     * @type {number}
     */
    get activeLayerIndex () {
        return this._activeLayerIndex;
    }

    set activeLayerIndex (activeLayerIndex) {
        this._activeLayerIndex = activeLayerIndex;
    }

    /**
     * The total length of the timeline.
     * @type {number}
     */
    get length () {
        var length = 0;
        this.layers.forEach(function (layer) {
            var layerLength = layer.length;
            if(layerLength > length) {
                length = layerLength;
            }
        });
        return length;
    }

    /**
     * The active layer.
     * @type {Wick.Layer}
     */
    get activeLayer () {
        return this.layers[this.activeLayerIndex];
    }

    /**
     * The active frames, determined by the playhead position.
     * @type {Wick.Frame[]}
     */
    get activeFrames () {
        var frames = [];
        this.layers.forEach(layer => {
            var layerFrame = layer.activeFrame;
            if(layerFrame) {
                frames.push(layerFrame);
            }
        });
        return frames;
    }

    /**
     * The active frame, determined by the playhead position.
     * @type {Wick.Frame}
     */
    get activeFrame () {
        return this.activeLayer && this.activeLayer.activeFrame;
    }

    /**
     * All frames inside the timeline.
     * @type {Wick.Frame[]}
     */
    get frames () {
        var frames = [];
        this.layers.forEach(layer => {
            layer.frames.forEach(frame => {
                frames.push(frame);
            });
        });
        return frames;
    }

    /**
     * All clips inside the timeline.
     * @type {Wick.Clip[]}
     */
    get clips () {
        var clips = [];
        this.frames.forEach(frame => {
            clips = clips.concat(frame.clips);
        });
        return clips;
    }

    /**
     * The playhead position of the frame with the given name.
     * @type {number|null}
     */
    getPlayheadPositionOfFrameWithName (name) {
        var frame = this.getFrameByName(name);
        if(frame) {
            return frame.start;
        } else {
            return null;
        }
    }

    /**
     * Finds the frame with a given name.
     * @type {Wick.Frame|null}
     */
    getFrameByName (name) {
      return this.frames.find(frame => {
        return frame.name === name;
      }) || null;
    }

    /**
     * Add a frame to one of the layers on this timeline. If there is no layer where the frame wants to go, the frame will not be added.
     * @param {Wick.Frame} frame - the frame to add
     */
    addFrame (frame) {
        if(frame.originalLayerIndex >= this.layers.length) return;

        if(frame.originalLayerIndex === -1) {
            this.activeLayer.addFrame(frame);
        } else {
            this.layers[frame.originalLayerIndex].addFrame(frame);
        }
    }

    /**
     * Adds a layer to the timeline.
     * @param {Wick.Layer} layer - The layer to add.
     */
    addLayer (layer) {
        this.addChild(layer);
    }

    /**
     * Remmoves a layer from the timeline.
     * @param {Wick.Layer} layer - The layer to remove.
     */
    removeLayer (layer) {
        // You can't remove the last layer.
        if(this.layers.length <= 1) {
            return;
        }

        // Activate the layer below the removed layer if we removed the active layer.
        if(this.activeLayerIndex === this.layers.length - 1) {
            this.activeLayerIndex--;
        }

        this.removeChild(layer);
    }

    /**
     * Moves a layer to a different position, inserting it before/after other layers if needed.
     * @param {Wick.Layer} layer - The layer to add.
     * @param {number} index - the new position to move the layer to.
     */
    moveLayer (layer, index) {
        // NOTE this is dangerous -- we should not be directly changing the _childrenUUIDs array.
        this._childrenUUIDs.splice(this._childrenUUIDs.indexOf(layer.uuid), 1);
        this._childrenUUIDs.splice(index, 0, layer.uuid);
    }

    /**
     * Gets the frames at the given playhead position.
     * @param {number} playheadPosition - the playhead position to search.
     * @returns {Wick.Frame[]} The frames at the playhead position.
     */
    getFramesAtPlayheadPosition (playheadPosition) {
        var frames = [];

        this.layers.forEach(layer => {
            var frame = layer.getFrameAtPlayheadPosition(playheadPosition);
            if(frame) frames.push(frame);
        });

        return frames;
    }

    /**
     *
     */
    getAllFrames (recursive) {
        var allFrames = [];
        this.layers.forEach(layer => {
            allFrames = allFrames.concat(layer.frames);

            if(recursive) {
                layer.frames.forEach(frame => {
                    frame.clips.forEach(clip => {
                        allFrames = allFrames.concat(clip.timeline.getAllFrames(recursive));
                    });
                });
            }
        });
        return allFrames;
    }

    /**
     * Gets all frames in the layer that are between the two given playhead positions and layer indices.
     * @param {number} playheadPositionStart - The start of the horizontal range to search
     * @param {number} playheadPositionEnd - The end of the horizontal range to search
     * @param {number} layerIndexStart - The start of the vertical range to search
     * @param {number} layerIndexEnd - The end of the vertical range to search
     * @return {Wick.Frame[]} The frames in the given range.
     */
    getFramesInRange (playheadPositionStart, playheadPositionEnd, layerIndexStart, layerIndexEnd) {
        var framesInRange = [];

        this.layers.filter(layer => {
            return layer.index >= layerIndexStart
                && layer.index <= layerIndexEnd;
        }).forEach(layer => {
            framesInRange = framesInRange.concat(layer.getFramesInRange(playheadPositionStart, playheadPositionEnd));
        })

        return framesInRange;
    }

    /**
     * Advances the timeline one frame forwards. Loops back to beginning if the end is reached.
     */
    advance () {
        if(this._forceNextFrame) {
            this.playheadPosition = this._forceNextFrame;
            this._forceNextFrame = null;
        } else if(this._playing) {
            this.playheadPosition ++;
            if(this.playheadPosition > this.length) {
                this.playheadPosition = 1;
            }
        }
    }

    /**
     * Stops the timeline from advancing during ticks.
     */
    stop () {
        this._playing = false;
    }

    /**
     * Makes the timeline advance automatically during ticks.
     */
    play () {
        this._playing = true;
    }

    /**
     * Stops the timeline and moves to a given frame number or name.
     * @param {string|number} frame - A playhead position or name of a frame to move to.
     */
    gotoAndStop (frame) {
        this.stop();
        this.gotoFrame(frame);
    }

    /**
     * Plays the timeline and moves to a given frame number or name.
     * @param {string|number} frame - A playhead position or name of a frame to move to.
     */
    gotoAndPlay (frame) {
        this.play();
        this.gotoFrame(frame);
    }

    /**
     * Moves the timeline forward one frame. Does nothing if the timeline is on its last frame.
     */
    gotoNextFrame () {
        var nextFramePlayheadPosition = Math.min(this.length, this.playheadPosition+1);
        this.gotoFrame(nextFramePlayheadPosition);
    }

    /**
     * Moves the timeline backwards one frame. Does nothing if the timeline is on its first frame.
     */
    gotoPrevFrame () {
        var prevFramePlayheadPosition = Math.max(1, this.playheadPosition-1);
        this.gotoFrame(prevFramePlayheadPosition);
    }

    /**
     * Moves the playhead to a given frame number or name.
     * @param {string|number} frame - A playhead position or name of a frame to move to.
     */
    gotoFrame (frame) {
        if(typeof frame === 'string') {
            var namedFrame = this.frames.find(seekframe => {
              return seekframe.identifier === frame;
            });
            if(namedFrame) this._forceNextFrame = namedFrame.start;
        } else if (typeof frame === 'number') {
            this._forceNextFrame = frame;
        } else {
            throw new Error('gotoFrame: Invalid argument: ' + frame);
        }
    }
}
