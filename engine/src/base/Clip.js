/*
 * Copyright 2020 WICKLETS LLC
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
 * A class representing a Wick Clip.
 */
Wick.Clip = class extends Wick.Tickable {
    /**
     * Returns a list of all possible animation types for this object.
     * @type {Object} - An object containing keys that represent the animation type a a key and a human-readable version of the animation type as a value.
     */
    static get animationTypes () {
        return {
            'loop': 'Loop',
            'single': 'Single Frame',
            'playOnce': 'Play Once',
        }
    }

    /**
     * Create a new clip.
     * @param {string} identifier - The identifier of the new clip.
     * @param {Wick.Path|Wick.Clip[]} objects - Optional. A list of objects to add to the clip.
     * @param {Wick.Transformation} transformation - Optional. The initial transformation of the clip.
     */
    constructor(args) {
        if (!args) args = {};
        super(args);

        this.timeline = new Wick.Timeline();
        this.timeline.addLayer(new Wick.Layer());
        this.timeline.activeLayer.addFrame(new Wick.Frame());
        this._animationType = 'loop'; // Can be one of loop, oneFrame, single
        this._singleFrameNumber = 1; // Default to 1, this value is only used if the animation type is single
        this._playedOnce = false;
        this._isSynced = false;

        this._transformation = args.transformation || new Wick.Transformation();

        this.cursor = 'default';

        this._isClone = false;
        this._sourceClipUUID = null;

        this._assetSourceUUID = null;

        /* If objects are passed in, add them to the clip and reposition them */
        if (args.objects) {
            this.addObjects(args.objects);
        }

        this._clones = [];

    }

    _serialize(args) {
        var data = super._serialize(args);

        data.transformation = this.transformation.values;
        data.timeline = this._timeline;
        data.animationType = this._animationType;
        data.singleFrameNumber = this._singleFrameNumber;
        data.assetSourceUUID = this._assetSourceUUID;
        data.isSynced = this._isSynced;

        return data;
    }

    _deserialize(data) {
        super._deserialize(data);

        this.transformation = new Wick.Transformation(data.transformation);
        this._timeline = data.timeline;
        this._animationType = data.animationType || 'loop';
        this._singleFrameNumber = data.singleFrameNumber || 1;
        this._assetSourceUUID = data.assetSourceUUID;
        this._isSynced = data.isSynced;

        this._playedOnce = false;

        this._clones = [];
    }

    get classname() {
        return 'Clip';
    }

    /**
     * Determines whether or not the clip is visible in the project.
     * @type {boolean}
     */
    get onScreen() {
        if (this.isRoot) {
            return true;
        } else if (this.parentFrame) {
            return this.parentFrame.onScreen;
        }
    }

    /**
     * Determines whether or not the clip is the root clip in the project.
     * @type {boolean}
     */
    get isRoot() {
        return this.project && this === this.project.root;
    }

    /**
     * True if the clip should sync to the timeline's position.
     * @type {boolean} 
     */
    get isSynced () {
        let isSingle = this.animationType === 'single';
        return this._isSynced && (!isSingle) && (!this.isRoot);
    }

    set isSynced (bool) {
        if (!(typeof bool === 'boolean')) {
            return;
        }
        this._isSynced = bool;

        if (bool) {
            this.applySyncPosition();
        } else {
            this.timeline.playheadPosition = 1; 
        }
    }

    /**
     * Determines whether or not the clip is the currently focused clip in the project.
     * @type {boolean}
     */
    get isFocus() {
        return this.project && this === this.project.focus;
    }

    /**
     * Check if a Clip is a clone of another object.
     * @type {boolean}
     */
    get isClone() {
        return this._isClone;
    }

    /**
     * The uuid of the clip that this clip was cloned from.
     * @type {string}
     */
    get sourceClipUUID() {
        return this._sourceClipUUID;
    }

    /**
     * The uuid of the ClipAsset that this clip was created from.
     * @type {string}
     */
    get assetSourceUUID () {
        return this._assetSourceUUID;
    }

    set assetSourceUUID (assetSourceUUID) {
        this._assetSourceUUID = assetSourceUUID;
    }

    /**
     * The timeline of the clip.
     * @type {Wick.Timeline}
     */
    get timeline() {
        return this.getChild('Timeline');
    }

    set timeline(timeline) {
        if (this.timeline) {
            this.removeChild(this.timeline);
        }
        this.addChild(timeline);
    }

    /**
     * The animation type of the clip. Must be of a type represented within animationTypes;
     * @type {string}
     */
    get animationType () {
        return this._animationType;
    }

    set animationType (animationType) {
        // Default to loop if an invalid animation type is passed in.
        if (!Wick.Clip.animationTypes[animationType]) {
            console.error("Animation type:" + animationType + " is invalid for clips! Defaulting to Loop.");
            this._animationType = 'loop';
        } else {
            this._animationType = animationType;

            if (animationType === 'single') {
                this.applySingleFramePosition();
            } else {
                this.timeline.playheadPosition = 1; // Reset timeline position if we are not on single frame.
            }
        }
    }

    /**
     * The frame to display when animation type is set to singleFrame.
     * @type {number}
     */
    get singleFrameNumber () {
        if (this.animationType !== 'single') {
            return null;
        } else {
            return this._singleFrameNumber;
        }
    }

    set singleFrameNumber (frame) {
        // Constrain to be within the length of the clip.
        if (frame < 1) {
            frame = 1;
        } else if (frame > this.timeline.length) {
            frame = this.timeline.length;
        }

        this._singleFrameNumber = frame;
        this.applySingleFramePosition();
    }

    /**
     * The frame to display when the clip is synced
     * @type {number}
     */
    get syncFrame () {
        let timelineOffset = this.parentClip.timeline.playheadPosition - this.parentFrame.start;

        // Show the last frame if we're past it on a playOnce Clip.
        if (this.animationType === 'playOnce' && (timelineOffset >= this.timeline.length)) {
            return this.timeline.length;
        }

        // Otherwise, show the correct frame.
        return (timelineOffset % this.timeline.length) + 1;
    }

    /**
     * Returns true if the clip has been played through fully once.
     * @type {boolean}
     */
    get playedOnce () {
        return this._playedOnce;
    }

    set playedOnce (bool) {
        return this._playedOnce = bool;
    }

    /**
     * The active layer of the clip's timeline.
     * @type {Wick.Layer}
     */
    get activeLayer() {
        return this.timeline.activeLayer;
    }

    /**
     * The active frame of the clip's timeline.
     * @type {Wick.Frame}
     */
    get activeFrame() {
        return this.activeLayer.activeFrame;
    }

    /**
     * An array containing every clip and frame that is a child of this clip and has an identifier.
     * @type {Wick.Base[]}
     */
    get namedChildren() {
        var namedChildren = [];
        this.timeline.frames.forEach(frame => {
            // Objects that can be accessed by their identifiers:

            // Frames
            if (frame.identifier) {
                namedChildren.push(frame);
            }

            // Clips
            frame.clips.forEach(clip => {
                if (clip.identifier) {
                    namedChildren.push(clip);
                }
            });

            // Dynamic text paths
            frame.dynamicTextPaths.forEach(path => {
                namedChildren.push(path);
            })
        });
        return namedChildren;
    }

    /**
     * An array containing every clip and frame that is a child of this clip and has an identifier, and also is visible on screen.
     * @type {Wick.Base[]}
     */
    get activeNamedChildren() {
        return this.namedChildren.filter(child => {
            return child.onScreen;
        });
    }

    /**
     * Updates the frame's single frame positions if necessary. Only works if the clip's animationType is 'single'.
     */
    applySingleFramePosition () {
        if (this.animationType === 'single') {
            // Ensure that the single frame we've chosen is reflected no matter what.
            this.timeline.playheadPosition = this.singleFrameNumber;
        }
    }

    /**
     * Updates the clip's playhead position if the Clip is in sync mode
     */
    applySyncPosition () {
        if (this.isSynced) {
            this.timeline.playheadPosition = this.syncFrame;
        }
    }

    /**
     * Updates the timeline of the clip based on the animation type of the clip.
     */
    updateTimelineForAnimationType () {
        if (this.animationType === 'single') {
            this.applySingleFramePosition();
        } 
        
        if (this.isSynced) {
            this.applySyncPosition();
        }
    }

    /**
     * Remove this clip from its parent frame.
     */
    remove() {
        // Don't attempt to remove if the object has already been removed.
        // (This is caused by calling remove() multiple times on one object inside a script.)
        if (!this.parent) return;

        this.parent.removeClip(this);
    }

    /**
     * Remove this clip and add all of its paths and clips to its parent frame.
     * @returns {Wick.Base[]} the objects that were inside the clip.
     */
    breakApart() {
        var leftovers = [];

        this.timeline.activeFrames.forEach(frame => {
            frame.clips.forEach(clip => {
                clip.transformation.x += this.transformation.x;
                clip.transformation.y += this.transformation.y;
                this.parentTimeline.activeFrame.addClip(clip);
                leftovers.push(clip);
            });
            frame.paths.forEach(path => {
                path.x += this.transformation.x;
                path.y += this.transformation.y;
                this.parentTimeline.activeFrame.addPath(path);
                leftovers.push(path);
            });
        });

        this.remove();

        return leftovers;
    }

    /**
     * Add paths and clips to this clip.
     * @param {Wick.Base[]} objects - the paths and clips to add to the clip
     */
    addObjects(objects) {
        // Reposition objects such that their origin point is equal to this Clip's position
        objects.forEach(object => {
            object.x -= this.transformation.x;
            object.y -= this.transformation.y;
        });

        // Add clips
        objects.filter(object => {
            return object instanceof Wick.Clip;
        }).forEach(clip => {
            this.activeFrame.addClip(clip);
        });

        // Add paths
        objects.filter(object => {
            return object instanceof Wick.Path;
        }).forEach(path => {
            this.activeFrame.addPath(path);
        });
    }

    /**
     * Stops a clip's timeline on that clip's current playhead position.
     */
    stop() {
        this.timeline.stop();
    }

    /**
     * Plays a clip's timeline from that clip's current playhead position.
     */
    play() {
        this.timeline.play();
    }

    /**
     * Moves a clip's playhead to a specific position and stops that clip's timeline on that position.
     * @param {number|string} frame - number or string representing the frame to move the playhead to.
     */
    gotoAndStop(frame) {
        this.timeline.gotoAndStop(frame);
    }

    /**
     * Moves a clip's playhead to a specific position and plays that clip's timeline from that position.
     * @param {number|string} frame - number or string representing the frame to move the playhead to.
     */
    gotoAndPlay(frame) {
        this.timeline.gotoAndPlay(frame);
    }

    /**
     * Move the playhead of the clips timeline forward one frame. Does nothing if the clip is on its last frame.
     */
    gotoNextFrame() {
        this.timeline.gotoNextFrame();
    }

    /**
     * Move the playhead of the clips timeline backwards one frame. Does nothing if the clip is on its first frame.
     */
    gotoPrevFrame() {
        this.timeline.gotoPrevFrame();
    }

    /**
     * Returns the name of the frame which is currently active. If multiple frames are active, returns the name of the first active frame.
     * @returns {string} Active Frame name. If the active frame does not have an identifier, returns empty string.
     */
    get currentFrameName() {
        let frames = this.timeline.activeFrames;

        let name = '';
        frames.forEach(frame => {
            if (name) return;

            if (frame.identifier) {
                name = frame.identifier;
            }
        });

        return name;
    }

    /**
     * @deprecated
     * Returns the current playhead position. This is a legacy function, you should use clip.playheadPosition instead.
     * @returns {number} Playhead Position.
     */
    get currentFrameNumber() {
        return this.timeline.playheadPosition;
    }

    /**
     * The current transformation of the clip.
     * @type {Wick.Transformation}
     */
    get transformation() {
        return this._transformation;
    }

    set transformation(transformation) {
        this._transformation = transformation;

        // When the transformation changes, update the current tween, if one exists
        if (this.parentFrame) {
            var tween = this.parentFrame.getActiveTween();
            if (tween) {
                tween.transformation = this._transformation.copy();
            }
        }
    }

    /**
     * Returns true if this clip collides with another clip.
     * @param {Wick.Clip} other - The other clip to check collision with.
     * @returns {boolean} True if this clip collides the other clip.
     */
    hitTest(other) {
        // TODO: Refactor so that getting bounds does not rely on the view
        return this.view.absoluteBounds.intersects(other.view.absoluteBounds);
    }

    /**
     * The bounding box of the clip.
     * @type {object}
     */
    get bounds() {
        // TODO: Refactor so that getting bounds does not rely on the view
        return this.view.bounds;
    }

    /**
     * The X position of the clip.
     * @type {number}
     */
    get x() {
        return this.transformation.x;
    }

    set x(x) {
        this.transformation.x = x;
    }

    /**
     * The Y position of the clip.
     * @type {number}
     */
    get y() {
        return this.transformation.y;
    }

    set y(y) {
        this.transformation.y = y;
    }

    /**
     * The X scale of the clip.
     * @type {number}
     */
    get scaleX() {
        return this.transformation.scaleX;
    }

    set scaleX(scaleX) {
        if (scaleX === 0) scaleX = 0.001; // Protects against NaN issues
        this.transformation.scaleX = scaleX;
    }

    /**
     * The Y scale of the clip.
     * @type {number}
     */
    get scaleY() {
        return this.transformation.scaleY;
    }

    set scaleY(scaleY) {
        if (scaleY === 0) scaleY = 0.001; // Protects against NaN issues
        this.transformation.scaleY = scaleY;
    }

    /**
     * The width of the clip.
     * @type {number}
     */
    get width() {
        return this.isRoot ? this.project.width : this.bounds.width * this.scaleX;
    }

    set width(width) {
        this.scaleX = width / this.width * this.scaleX;
    }

    /**
     * The height of the clip.
     * @type {number}
     */
    get height() {
        return this.isRoot ? this.project.height : this.bounds.height * this.scaleY;
    }

    set height(height) {
        this.scaleY = height / this.height * this.scaleY;
    }

    /**
     * The rotation of the clip.
     * @type {number}
     */
    get rotation() {
        return this.transformation.rotation;
    }

    set rotation(rotation) {
        this.transformation.rotation = rotation;
    }

    /**
     * The opacity of the clip.
     * @type {number}
     */
    get opacity() {
        return this.transformation.opacity;
    }

    set opacity(opacity) {
        opacity = Math.min(1, opacity);
        opacity = Math.max(0, opacity);
        this.transformation.opacity = opacity;
    }

    /**
     * Copy this clip, and add the copy to the same frame as the original clip.
     * @returns {Wick.Clip} the result of the clone.
     */
    clone() {
        var clone = this.copy();
        clone.identifier = null;
        this.parentFrame.addClip(clone);
        this._clones.push(clone);
        clone._isClone = true;
        clone._sourceClipUUID = this.uuid;
        return clone;
    }

    /**
     * An array containing all objects that were created by calling clone() on this Clip.
     * @type {Wick.Clip[]}
     */
    get clones() {
        return this._clones;
    }

    /**
     * This is a stopgap to prevent users from using setText with a Clip.
     */
    setText () {
        throw new Error('setText() can only be used with text objects.');
    }

    /**
     * The list of parents, grandparents, grand-grandparents...etc of the clip.
     * @returns {Wick.Clip[]} Array of all parents
     */
    get lineage() {
        if (this.isRoot) {
            return [this];
        } else {
            return [this].concat(this.parentClip.lineage);
        }
    }

    /**
     * Add a placeholder path to this clip to ensure the Clip is always selectable when rendered.
     */
    ensureActiveFrameIsContentful () {
        // Ensure layer exists
        var firstLayerExists = this.timeline.activeLayer;
        if(!firstLayerExists) {
            this.timeline.addLayer(new Wick.Layer());
        }

        // Ensure active frame exists
        var playheadPosition = this.timeline.playheadPosition;
        var activeFrameExists = this.timeline.getFramesAtPlayheadPosition(playheadPosition).length > 0;
        if(!activeFrameExists) {
            this.timeline.activeLayer.addFrame(new Wick.Frame({start:playheadPosition}));
        }

        // Clear placeholders
        var frame = this.timeline.getFramesAtPlayheadPosition(playheadPosition)[0];
        frame.paths.forEach(path => {
            if(!path.isPlaceholder) return;
            path.remove();
        });

        // Check if active frame is contentful
        var firstFramesAreContentful = false;
        this.timeline.getFramesAtPlayheadPosition(playheadPosition).forEach(frame => {
            if(frame.contentful) {
                firstFramesAreContentful = true;
            }
        });

        // Ensure active frame is contentful
        if(!firstFramesAreContentful) {
            // Clear placeholders
            var frame = this.timeline.getFramesAtPlayheadPosition(playheadPosition)[0];
            frame.paths.forEach(path => {
                path.remove();
            });

            // Generate crosshair
            var size = Wick.View.Clip.PLACEHOLDER_SIZE;
            var line1 = new paper.Path.Line({
                from: [0,-size],
                to: [0,size],
                strokeColor: '#AAA',
            });
            line1.remove();
            frame.addPath(new Wick.Path({path: line1, isPlaceholder: true}));

            var line2 = new paper.Path.Line({
                from: [-size,0],
                to: [size,0],
                strokeColor: '#AAA',
            });
            line2.remove();
            frame.addPath(new Wick.Path({path: line2, isPlaceholder: true}));
        }
    }

    _onInactive () {
        super._onInactive();
        this._tickChildren();
    }

    _onActivated() {
        super._onActivated();
        this._tickChildren();

        if (this.animationType === 'playOnce') {
            this.playedOnce = false;
            this.timeline.playheadPosition = 1;
        }

    }

    _onActive() {
        super._onActive();

        if (this.animationType === 'loop') {
            this.timeline.advance();
        } else if (this.animationType === 'single') {
            this.timeline.playheadPosition = this.singleFrameNumber;
        } else if (this.animationType === 'playOnce') {
            if (!this.playedOnce) {
                if (this.timeline.playheadPosition === this.timeline.length) {
                    console.log("Reset");
                    this.playedOnce = true;
                } else {
                    this.timeline.advance();
                }
            }
        } 
        
        if (this.isSynced) {
            this.timeline.playheadPosition = this.syncFrame;
        }

        this._tickChildren();
    }

    _onDeactivated() {
        super._onDeactivated();
        this._tickChildren();
    }

    _tickChildren() {
        var childError = null;
        this.timeline.frames.forEach(frame => {
            if (childError) return;
            childError = frame.tick();
        });
        return childError;
    }

    _attachChildClipReferences() {
        this.timeline.activeFrames.forEach(frame => {
            frame.clips.forEach(clip => {
                if (clip.identifier) {
                    this[clip.identifier] = clip;
                    clip._attachChildClipReferences();
                }
            });

            // Dynamic text paths can be accessed by their identifiers.
            frame.dynamicTextPaths.forEach(path => {
                this[path.identifier] = path;
            })
        })
    }
}
