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
        this._originalLayerIndex = null;

        this._soundAssetUUID = null;
        this._soundID = null;
        this._soundVolume = 1.0;
    }

    deserialize (data) {
        super.deserialize(data);

        this.start = data.start;
        this.end = data.end;

        this._soundAssetUUID = data.sound;
        this._soundVolume = data.soundVolume === undefined ? 1.0 : data.soundVolume;

        this._originalLayerIndex = data.originalLayerIndex;

        return object;
    }

    serialize () {
        var data = super.serialize();

        data.start = this.start;
        data.end = this.end;

        data.sound = this._soundAssetUUID;
        data.soundVolume = this._soundVolume;

        data.originalLayerIndex = this._originalLayerIndex;

        return data;
    }

    get classname () {
        return 'Frame';
    }

    /**
     *
     */
    get paths () {

    }

    /**
     *
     */
    get clips () {
        return this.children.filter(child => {
            return child instanceof Wick.Clip;
        });
    }

    /**
     *
     */
    get tweens () {
        return this.children.filter(child => {
            return child instanceof Wick.Tween;
        });
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
        if(!this.parent) return true;
        return this.inPosition(this.parent.parent.playheadPosition);
    }

    /**
     * The sound on the frame.
     * @type {Wick.SoundAsset}
     */
    get sound () {
        var uuid = this._soundAssetUUID;
        return uuid ? this.project.getAsset(uuid) : null;
    }

    set sound (soundAsset) {
        this._soundAssetUUID = soundAsset.uuid;
    }

    /**
     * The volume of the sound on the frame.
     * @type {number}
     */
    get soundVolume () {
        return this._soundVolume
    }

    set soundVolume (soundVolume) {
        this._soundVolume = soundVolume;
    }

    /**
     * Removes the sound on this frame.
     */
    removeSound () {
        this._soundAssetUUID = null;
    }

    /**
     * Plays the sound on this frame.
     */
    playSound () {
        if(this.sound) {
            this._soundID = this.sound.play(this.soundStartOffsetMS, this.soundVolume);
        }
    }

    /**
     * Stops the sound on this frame.
     */
    stopSound () {
        if(this.sound) {
            this.sound.stop(this._soundID);
            this._soundID = null;
        }
    }

    /**
     * Check if the sound on this frame is playing.
     */
    isSoundPlaying () {
        return this._soundID !== null;
    }

    /**
     * The amount of time, in millisecods, that the frame's sound should play before stopping.
     */
    get soundStartOffsetMS () {
        var offsetFrames = this.parent.parent.playheadPosition - this.start;
        var offsetMS = offsetFrames * 1000 / this.project.framerate;
        return offsetMS;
    }

    /**
     * The paths on the frame.
     * @type {Wick.Path[]}
     */
    get paths () {
        return this._paths;
    }

    /**
     * The clips on the frame.
     * @type {Wick.Clip[]}
     */
    get clips () {
        return this._clips;
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
        return this._originalLayerIndex;
    }

    /**
     * Removes this frame from its parent layer.
     */
    remove () {
        this.parent.removeFrame(this);
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
     * Add a clip to the frame.
     * @param {Wick.Clip} clip - the clip to add.
     */
    addClip (clip) {
        if(clip.parent) {
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

    }

    /**
     * Remove a path from the frame.
     * @param {Wick.Path} path - the path to remove.
     */
    removePath (path) {

    }

    /**
     * Removes all paths from this frame.
     */
    removeAllPaths () {

    }

    /**
     * Add a tween to the frame.
     * @param {Wick.Tween} tween - the tween to add.
     */
    addTween (tween) {
        this.addChild(tween);
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
            this._clips.forEach(clip => {
                tween.applyTransformsToClip(clip);
            });
        }
    }

    _onInactive () {
        return super._onInactive();
    }

    _onActivated () {
        this.applyTweenTransforms();

        var error = super._onActivated();
        if(error) return error;

        this.playSound();

        return this._tickChildren();
    }

    _onActive () {
        this.applyTweenTransforms();

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
