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
 * Class representing a tween.
 */
Wick.Tween = class extends Wick.Base {
    static get VALID_EASING_TYPES () {
        return ['none', 'in', 'out', 'in-out'];
    }

    static _calculateTimeValue (tweenA, tweenB, playheadPosition) {
        var tweenAPlayhead = tweenA.playheadPosition;
        var tweenBPlayhead = tweenB.playheadPosition;
        var dist = tweenBPlayhead - tweenAPlayhead;
        var t = (playheadPosition - tweenAPlayhead) / dist;
        return t;
    }

    /**
     * Create a tween
     * @param {number} playheadPosition - the playhead position relative to the frame that the tween belongs to
     * @param {Wick.Transform} transformation - the transformation this tween will apply to child objects
     * @param {number} fullRotations - the number of rotations to add to the tween's transformation
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        this._playheadPosition = args.playheadPosition || 1;
        this.transformation = args.transformation || new Wick.Transformation();
        this.fullRotations = args.fullRotations === undefined ? 0 : args.fullRotations;
        this.easingType = args.easingType || 'none';
    }

    /**
     * Create a tween by interpolating two existing tweens.
     * @param {Wick.Tween} tweenA - The first tween
     * @param {Wick.Tween} tweenB - The second tween
     * @param {Number} playheadPosition - The point between the two tweens to use to interpolate
     */
    static interpolate (tweenA, tweenB, playheadPosition) {
        var interpTween = new Wick.Tween();

        // Calculate value (0.0-1.0) to pass to tweening function
        var t = Wick.Tween._calculateTimeValue(tweenA, tweenB, playheadPosition);

        // Interpolate every transformation attribute using the t value
        ["x", "y", "scaleX", "scaleY", "rotation", "opacity"].forEach(propName => {
            var tweenFn = tweenA._getTweenFunction();
            var tt = tweenFn(t);
            var valA = tweenA.transformation[propName];
            var valB = tweenB.transformation[propName];
            if(propName === 'rotation') {
                // Constrain rotation values to range of -180 to 180
                while(valA < -180) valA += 360;
                while(valB < -180) valB += 360;
                while(valA > 180) valA -= 360;
                while(valB > 180) valB -= 360;
                // Convert full rotations to 360 degree amounts
                valB += tweenA.fullRotations * 360;
            }
            interpTween.transformation[propName] = lerp(valA, valB, tt);
        });

        interpTween.playheadPosition = playheadPosition;
        return interpTween;
    }

    get classname () {
        return 'Tween';
    }

    serialize (args) {
        var data = super.serialize(args);

        data.playheadPosition = this.playheadPosition;
        data.transformation = this.transformation.values;
        data.fullRotations = this.fullRotations;
        data.easingType = this.easingType;

        return data;
    }

    deserialize (data) {
        super.deserialize(data);

        this.playheadPosition = data.playheadPosition;
        this.transformation = new Wick.Transformation(data.transformation);
        this.fullRotations = data.fullRotations;
        this.easingType = data.easingType;
    }

    /**
     * The playhead position of the tween.
     * @type {number}
     */
    get playheadPosition () {
        return this._playheadPosition;
    }

    set playheadPosition (playheadPosition) {
        this._playheadPosition = playheadPosition;
    }

    /**
     * The type of interpolation to use for easing.
     * @type {string}
     */
    get easingType () {
        return this._easingType;
    }

    set easingType (easingType) {
        if(Wick.Tween.VALID_EASING_TYPES.indexOf(easingType) === -1) {
            console.warn('Invalid easingType. Valid easingTypes: ')
            console.warn(Wick.Tween.VALID_EASING_TYPES);
            return;
        }
        this._easingType = easingType;
    }

    /**
     * Remove this tween from its parent frame.
     */
    remove () {
        this.parent.removeTween(this);
    }

    /**
     * Set the transformation of a clip to this tween's transformation.
     * @param {Wick.Clip} clip - the clip to apply the tween transforms to.
     */
    applyTransformsToClip (clip) {
        clip.transformation = this.transformation.copy();
    }

    /**
     * The tween that comes after this tween in the parent frame.
     * @returns {Wick.Tween}
     */
    getNextTween () {
        if(!this.parentFrame) return null;

        var frontTween = this.parentFrame.seekTweenInFront(this.playheadPosition+1);
        return frontTween;
    }

    /**
     * Prevents tweens from existing outside of the frame's length. Call this after changing the length of the parent frame.
     */
    restrictToFrameSize () {
        var playheadPosition = this.playheadPosition;

        // Remove tween if playheadPosition is out of bounds
        if(playheadPosition < 1 || playheadPosition > this.parentFrame.length) {
            this.remove();
        }
    }

     /* retrieve Tween.js easing functions by name */
    _getTweenFunction () {
        return {
            'none': TWEEN.Easing.Linear.None,
            'in': TWEEN.Easing.Quadratic.In,
            'out': TWEEN.Easing.Quadratic.Out,
            'in-out': TWEEN.Easing.Quadratic.InOut,
        }[this.easingType];
    }
}
