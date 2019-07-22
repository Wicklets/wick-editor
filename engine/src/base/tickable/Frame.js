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
 * A class representing a frame.
 */
Wick.Frame = class extends Wick.Tickable {
    /**
     * Create a new frame.
     * @param {number} start - The start of the frame. Optional, defaults to 1.
     * @param {number} end - The end of the frame. Optional, defaults to be the same as start.
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        this.start = args.start || 1;
        this.end = args.end || this.start;

        this._soundAssetUUID = null;
        this._soundID = null;
        this._soundVolume = 1.0;
        this._soundLoop = false;
        this._cropSoundOffsetMS = 0; // milliseconds.

        this._originalLayerIndex = -1;
    }

    serialize (args) {
        var data = super.serialize(args);

        data.start = this.start;
        data.end = this.end;

        data.sound = this._soundAssetUUID;
        data.soundVolume = this._soundVolume;
        data.soundLoop = this._soundLoop;

        data.originalLayerIndex = this.layerIndex !== -1 ? this.layerIndex : this._originalLayerIndex;

        return data;
    }

    deserialize (data) {
        super.deserialize(data);

        this.start = data.start;
        this.end = data.end;

        this._soundAssetUUID = data.sound;
        this._soundVolume = data.soundVolume === undefined ? 1.0 : data.soundVolume;
        this._soundLoop = data.soundLoop === undefined ? false : data.soundLoop;

        this._originalLayerIndex = data.originalLayerIndex;
    }

    get classname () {
        return 'Frame';
    }

    /**
     * The length of the frame.
     * @type {number}
     */
    get length () {
        return this.end - this.start + 1;
    }

    /**
     * The midpoint of the frame.
     * @type {number}
     */
    get midpoint () {
        return this.start + (this.end - this.start) / 2;
    }

    /**
     * Is true if the frame is currently visible.
     * @type {boolean}
     */
    get onScreen () {
        if(!this.parentBase) return true;
        return this.inPosition(this.parentTimeline.playheadPosition);
    }

    /**
     * The sound attached to the frame.
     * @type {Wick.SoundAsset}
     */
    get sound () {
        var uuid = this._soundAssetUUID;
        return uuid ? this.project.getAssetByUUID(uuid) : null;
    }

    set sound (soundAsset) {
        this._soundAssetUUID = soundAsset.uuid;
    }

    /**
     * The volume of the sound attached to the frame.
     * @type {number}
     */
    get soundVolume () {
        return this._soundVolume
    }

    set soundVolume (soundVolume) {
        this._soundVolume = soundVolume;
    }

    /**
     * Whether or not the sound loops.
     * @type {boolean}
     */
    get soundLoop () {
        return this._soundLoop;
    }

    set soundLoop (soundLoop) {
        this._soundLoop = soundLoop;
    }

    /**
     * Removes the sound attached to this frame.
     */
    removeSound () {
        this._soundAssetUUID = null;
    }

    /**
     * Plays the sound attached to this frame.
     */
    playSound () {
        if(!this.sound) {
            return;
        }

        var options = {
            seekMS: this.playheadSoundOffsetMS + this.cropSoundOffsetMS,
            volume: this.soundVolume,
            loop: this.soundLoop,
        };
        this._soundID = this.sound.play(options);
    }

    /**
     * Stops the sound attached to this frame.
     */
    stopSound () {
        if(this.sound) {
            this.sound.stop(this._soundID);
            this._soundID = null;
        }
    }

    /**
     * Check if the sound on this frame is playing.
     * @returns {boolean} true if the sound is playing
     */
    isSoundPlaying () {
        return this._soundID !== null;
    }

    /**
     * The amount of time, in milliseconds, that the frame's sound should play before stopping.
     * @type {number}
     */
    get playheadSoundOffsetMS () {
        var offsetFrames = this.parentTimeline.playheadPosition - this.start;
        var offsetMS = (1000 / this.project.framerate) * offsetFrames;
        return offsetMS;
    }

    /**
     * The amount of time the sound playing should be offset, in milliseconds. If this is 0,
     * the sound plays normally. A negative value means the sound should start at a later point
     * in the track. THIS DOES NOT DETERMINE WHEN A SOUND PLAYS.
     * @type {number}
     */
    get cropSoundOffsetMS () {
        return this._cropSoundOffsetMS;
    }

    set cropSoundOffsetMS (val) {
        this._cropSoundOffsetMS = val;
    }

    /**
     * When should the sound start, in milliseconds.
     * @type {number}
     */
    get soundStartMS () {
        return (1000/this.project.framerate) * (this.start - 1);
    }

    /**
     * When should the sound end, in milliseconds.
     * @type {number}
     */
    get soundEndMS () {
        return (1000/this.project.framerate) * (this.end - 1);
    }

    /**
     * The paths on the frame.
     * @type {Wick.Path[]}
     */
    get paths () {
        return this.getChildren('Path');
    }

    /**
     * The paths that are text and have identifiers, for dynamic text.
     * @type {Wick.Path[]}
     */
    get dynamicTextPaths () {
        return this.paths.filter(path => {
            return path.isDynamicText;
        });
    }

    /**
     * The clips on the frame.
     * @type {Wick.Clip[]}
     */
    get clips () {
        return this.getChildren(['Clip','Button']);
    }

    /**
     * The tweens on this frame.
     * @type {Wick.Tween[]}
     */
    get tweens () {
        return this.getChildren('Tween');
    }

    /**
     * True if there are clips or paths on the frame.
     * @type {boolean}
     */
    get contentful () {
        return this.paths.length > 0 || this.clips.length > 0;
    }

    /**
     * The index of the parent layer.
     * @type {number}
     */
    get layerIndex () {
        return this.parentLayer ? this.parentLayer.index : -1;
    }

    /**
     * The index of the layer that this frame last belonged to. Useful when copying and pasting frames!
     * @type {number}
     */
    get originalLayerIndex () {
        return this._originalLayerIndex;
    }

    /**
     * Removes this frame from its parent layer.
     */
    remove () {
        this.parentBase.removeFrame(this);
    }

    /**
     * True if the playhead is on this frame.
     * @param {number} playheadPosition - the position of the playhead.
     * @return {boolean}
     */
    inPosition (playheadPosition) {
        return this.start <= playheadPosition
            && this.end >= playheadPosition;
    }

    /**
     * True if the frame exists within the given range.
     * @param {number} start - the start of the range to check.
     * @param {number} end - the end of the range to check.
     * @return {boolean}
     */
    inRange (start, end) {
        return this.inPosition(start)
            || this.inPosition(end)
            || (this.start >= start && this.start <= end)
            || (this.end >= start && this.end <= end);
    }

    /**
     * The number of frames that this frame is from a given playhead position.
     * @param {number} playheadPosition
     */
    distanceFrom (playheadPosition) {
        // playhead position is inside frame, distance is zero.
        if(this.start <= playheadPosition && this.end >= playheadPosition) {
            return 0;
        }

        // otherwise, find the distance from the nearest end
        if (this.start >= playheadPosition) {
            return this.start - playheadPosition;
        } else if(this.end <= playheadPosition) {
            return playheadPosition - this.end;
        }
    }

    /**
     * Add a clip to the frame.
     * @param {Wick.Clip} clip - the clip to add.
     */
    addClip (clip) {
        if(clip.parentBase) {
            clip.remove();
        }
        this.addChild(clip);
    }

    /**
     * Remove a clip from the frame.
     * @param {Wick.Clip} clip - the clip to remove.
     */
    removeClip (clip) {
        this.removeChild(clip);
    }

    /**
     * Add a path to the frame.
     * @param {Wick.Path} path - the path to add.
     */
    addPath (path) {
        if(path.parentBase) {
            path.remove();
        }
        this.addChild(path);
    }

    /**
     * Remove a path from the frame.
     * @param {Wick.Path} path - the path to remove.
     */
    removePath (path) {
        this.removeChild(path);
    }

    /**
     * Add a tween to the frame.
     * @param {Wick.Tween} tween - the tween to add.
     */
    addTween (tween) {
        this.addChild(tween);
    }

    /**
     * Automatically creates a tween at the current playhead position. Converts all objects into one clip if needed.
     */
    createTween () {
        // If more than one object exists on the frame, or if there is only one path, create a clip from those objects
        var numClips = this.clips.length;
        var numPaths = this.paths.length;
        if((numClips === 0 && numPaths === 1) || numClips + numPaths > 1) {
            var allObjects = this.paths.concat(this.clips);
            var center = this.project.selection.view._getObjectsBounds(allObjects).center;
            var clip = new Wick.Clip({
                objects: this.paths.concat(this.clips),
                transformation: new Wick.Transformation({
                    x: center.x,
                    y: center.y,
                }),
            });
            this.addClip(clip);
        }

        // Create the tween (if there's not already a tween at the current playhead position)
        var playheadPosition = this._getRelativePlayheadPosition();
        if(!this.getTweenAtPosition(playheadPosition)) {
            var clip = this.clips[0];
            this.addTween(new Wick.Tween({
                playheadPosition: playheadPosition,
                transformation: clip ? clip.transformation.copy() : new Wick.Transformation(),
            }));
        }
    }

    /**
     * Remove a tween from the frame.
     * @param {Wick.Tween} tween - the tween to remove.
     */
    removeTween (tween) {
        this.removeChild(tween);
    }

    /**
     * Get the tween at the given playhead position. Returns null if there is no tween.
     * @param {number} playheadPosition - the playhead position to look for tweens at.
     * @returns {Wick.Tween} the tween at the given playhead position.
     */
    getTweenAtPosition (playheadPosition) {
        return this.tweens.find(tween => {
            return tween.playheadPosition === playheadPosition;
        });
    }

    /**
     * The tween being used to transform the objects on the frame.
     * @returns {Wick.Tween} tween - the active tween. Null if there is no active tween.
     */
    getActiveTween () {
        if(!this.parentTimeline) return null;

        var playheadPosition = this._getRelativePlayheadPosition();

        var tween = this.getTweenAtPosition(playheadPosition);
        if(tween) {
            return tween;
        }

        var seekBackwardsTween = this._seekTweenBehind(playheadPosition);
        var seekForwardsTween = this._seekTweenInFront(playheadPosition);

        if (seekBackwardsTween && seekForwardsTween) {
            return Wick.Tween.interpolate(seekBackwardsTween, seekForwardsTween, playheadPosition);
        } else if (seekForwardsTween) {
            return seekForwardsTween;
        } else if (seekBackwardsTween) {
            return seekBackwardsTween;
        } else {
            return null;
        }
    }

    /**
     * Applies the transformation of current tween to the objects on the frame.
     */
    applyTweenTransforms () {
        var tween = this.getActiveTween();
        if(tween) {
            this.clips.forEach(clip => {
                tween.applyTransformsToClip(clip);
            });
        }
    }

    /**
     * The asset of the sound attached to this frame, if one exists
     * @returns {Wick.Asset[]}
     */
    getLinkedAssets () {
        var linkedAssets = [];

        if(this.sound) {
            linkedAssets.push(this.sound);
        }

        return linkedAssets;
    }

    /**
     * Import SVG data into this frame. SVGs containing mulitple paths will be split into multiple Wick Paths.
     * @param {string} svg - the SVG data to parse and import.
     */
    importSVG (svg) {
        this.view.importSVG(svg);
    }

    _onInactive () {
        return super._onInactive();
    }

    _onActivated () {
        var error = super._onActivated();
        if(error) return error;

        this.playSound();

        return this._tickChildren();
    }

    _onActive () {
        var error = super._onActive();
        if(error) return error;

        return this._tickChildren();
    }

    _onDeactivated () {
        var error = super._onDeactivated();
        if(error) return error;

        this.stopSound();

        return this._tickChildren();
    }

    _tickChildren () {
        var childError = null;
        this.clips.forEach(clip => {
            if(childError) return;
            childError = clip.tick();
        });
        return childError;
    }

    _getRelativePlayheadPosition () {
        return this.parentTimeline.playheadPosition - this.start + 1;
    }

    _seekTweenBehind (playheadPosition) {
        var seekBackwardsPosition = playheadPosition;
        var seekBackwardsTween = null;
        while (seekBackwardsPosition > 0) {
            seekBackwardsTween = this.getTweenAtPosition(seekBackwardsPosition);
            seekBackwardsPosition--;
            if(seekBackwardsTween) break;
        }
        return seekBackwardsTween;
    }

    _seekTweenInFront (playheadPosition) {
        var seekForwardsPosition = playheadPosition;
        var seekForwardsTween = null;
        while (seekForwardsPosition <= this.end) {
            seekForwardsTween = this.getTweenAtPosition(seekForwardsPosition);
            seekForwardsPosition++;
            if(seekForwardsTween) break;
        }
        return seekForwardsTween;
    }

    _attachChildClipReferences () {
        this.clips.forEach(clip => {
            if(clip.identifier) {
                this[clip.identifier] = clip;
                clip._attachChildClipReferences();
            }
        });
    }
}
