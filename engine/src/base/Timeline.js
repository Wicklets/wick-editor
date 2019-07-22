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
        
        //is the clip currently set to play in reverse?
        this._reversed = false;
        //range of frames to loop between; a blank array means "play all"
        this._loopRange = null;
        //how many times should this clip loop? -1 means infinitely. Counts downward the more times the clip loops.
        this._loopCount = -1;
    }

    serialize (args) {
        var data = super.serialize(args);

        data.playheadPosition = this._playheadPosition;
        data.activeLayerIndex = this._activeLayerIndex;

        return data;
    }

    deserialize (data) {
        super.deserialize(data);

        this._playheadPosition = data.playheadPosition;
        this._activeLayerIndex = data.activeLayerIndex;

        this._playing = true;
        this._forceNextFrame = null;
        
        this._reversed = false;
        this._loopRange = null;
        this._loopCount = -1;
    }

    get classname () {
        return 'Timeline';
    }

    /**
     * The layers that belong to this timeline.
     * @type {Wick.Layer}
     */
    get layers () {
        return this.getChildren('Layer');
    }

    /**
     * The position of the playhead. Determines which frames are visible.
     * @type {number}
     */
    get playheadPosition () {
        return this._playheadPosition;
    }

    set playheadPosition (playheadPosition) {
        // Automatically clear selection when any playhead in the project moves
        if(this.project && this._playheadPosition !== playheadPosition) {
            this.project.selection.clear('Canvas');
        }

        this._playheadPosition = playheadPosition;

        // Automatically apply tween transforms on child frames when playhead moves
        this.activeFrames.forEach(frame => {
            frame.applyTweenTransforms();
        });
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
     * Verifies that the given frame number or name exists on this timeline. 
     * @param {number|string} frame - the frame name or number to search.
     * @param {bool} [throwError = false] - throw error if given invalid string input?
     * @returns {number|null} If frame exists, returns its playhead position. If given an out-of-range number, returns 1 or length. If given an invalid name, returns null.
     */
    verifyFrameExists (frame, throwError = false) {
        if(typeof frame === 'string') {
            var namedFrame = this.frames.find(seekframe => {
              return seekframe.identifier === frame;
            });
            if (namedFrame) {
                return namedFrame.start;
            } else {
                if (throwError) throw new Error('Frame named "'+frame+'" doesn\'t exist.');
                return null;
            }
        } else if (typeof frame === 'number') {
            //remove decimal places
            let f = Math.round(frame);
            //prevent out-of-range values
            if (f > this.length) f = this.length;
            if (f < 1) f = 1;
            //return
            return f;
        } else {
            if (throwError) throw new Error('gotoFrame: Invalid argument: ' + frame);
            return null;
        }
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
        var layers = this.getChildren('Layer');
        layers.splice(layers.indexOf(layer), 1);
        layers.splice(index, 0, layer);
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
     * Get all frames in this timeline.
     * @param {boolean} recursive - If set to true, will also include the children of all child timelines.
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
     * Advances the timeline one frame forwards (or backwards). Loops back to beginning if the end is reached, if looping is enabled.
     */
    advance () {
        //define boundaries of playback
        let minFrame = 0;
        let maxFrame = 0;
        if (this._loopRange === null) { //if playing all
            minFrame = 1;
            maxFrame = this.length;
        } else {
            minFrame = Math.min(this._loopRange[0], this._loopRange[1]);
            maxFrame = Math.max(this._loopRange[0], this._loopRange[1]);
        }
        
        if (this._forceNextFrame) {
            this.playheadPosition = this._forceNextFrame;
            this._forceNextFrame = null;
        } else if (this._playing) {
            let direction = (this._reversed) ? -1 : 1;
            //keep playback within bounds, and loop if loop is enabled
            if (this.playheadPosition + direction > maxFrame
               || this.playheadPosition + direction < minFrame) {
                //define which frame to loop back to
                let targetFrame = (this.playheadPosition + direction > maxFrame) ? minFrame : maxFrame;
                console.log("going to frame "+targetFrame);
                //if timeline is NOT out of loops, go ahead and loop
                if (this._loopCount !== 0) {
                    this.playheadPosition = targetFrame;
                    //if _loopCount is a negative number, it will never reach 0, so the timeline will loop forever.
                    //keep loopCount at -1 just to make sure it doesn't grow unecessarily large or something
                    if (this._loopCount > 0) this._loopCount--; else this._loopCount = -1;
                } else { //no loops left. Go back to the previous frame and stop
                    this.stop();
                    //stop() resets play settings
                }
            } else {
                //if timeline still has frames left, move forward
                this.playheadPosition += direction;
                console.log("_loopRange: "+this._loopRange+"\nmin/max frame: ("+minFrame+", "+maxFrame+")\nreversed: "+this._reversed);
            }
        }
    }
    
    resetPlaySettings () {
        this._loopCount = -1;
        this._loopRange = null;
        this._reversed = false;
    }

    /**
     * Makes the timeline advance automatically during ticks.
     */
    play () {
        this.resetPlaySettings();
        this._playing = true;
    }

    /**
     * Stops the timeline from advancing during ticks.
     */
    stop () {
        this.resetPlaySettings();
        this._playing = false;
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
     * Repeats a specific part of the timeline.
     * @param {string|number} startFrame - A playhead position or name of a frame to start at.
     * @param {string|number} endFrame - When the playhead reaches this frame, it will loop back to startFrame.
     * @param {number|bool} [loop = true] - If true, will loop forever. If false, will play once and stop. If a number, it will play that many times in total.
     */
    gotoAndLoop (startFrame, endFrame, loop = true) {
        //check if these frames exist, throw errors if they don't
        let sf = this.verifyFrameExists(startFrame, true);
        let ef = this.verifyFrameExists(endFrame, true);
        console.log("sf: "+sf+"; ef: "+ef+"; this.length: "+this.length);
        if (!sf || !ef) return;
        //if the timeline is just gonna do nothing, might as well be honest about it
        if (sf === ef) return;
        
        this._loopRange = [sf, ef];
        //reverse clip is startFrame is larger than endFrame
        this._reversed = sf > ef;
        
        switch (loop) {
            case true:
                this._loopCount = -1;
                break;
            case false:
                this._loopCount = 0;
                break;
            default:
                //if you set loopCount to 5, it will play 6 times in total
                this._loopCount = loop-1;
        }
        this._playing = true;
        this.gotoFrame(sf);
    }

    /**
     * Moves the timeline forward one frame. Loops back to 1 if gotoNextFrame moves the playhead past the past frame.
     */
    gotoNextFrame () {
        this.resetPlaySettings();
        // Loop back to beginning if gotoNextFrame goes past the last frame
        var nextFramePlayheadPosition = this.playheadPosition + 1;
        if(nextFramePlayheadPosition > this.length) {
            nextFramePlayheadPosition = 1;
        }

        this.gotoFrame(nextFramePlayheadPosition);
    }

    /**
     * Moves the timeline backwards one frame. Loops to the last frame if gotoPrevFrame moves the playhead before the first frame.
     */
    gotoPrevFrame () {
        this.resetPlaySettings();
        var prevFramePlayheadPosition = this.playheadPosition - 1;
        if(prevFramePlayheadPosition <= 0) {
            prevFramePlayheadPosition = this.length;
        }

        this.gotoFrame(prevFramePlayheadPosition);
    }

    /**
     * Moves the playhead to a given frame number or name.
     * @param {string|number} frame - A playhead position or name of a frame to move to.
     */
    gotoFrame (frame) {
        //verify that this frame exists, throw an error if it doesn't (see definition)
        let f = this.verifyFrameExists(frame, true);
        if (f) this._forceNextFrame = f;
    }
}
