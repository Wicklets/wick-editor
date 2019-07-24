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
 * A class representing a Wick Clip.
 */
Wick.Clip = class extends Wick.Tickable {
    /**
     * Create a new clip.
     * @param {string} identifier - The identifier of the new clip.
     * @param {Wick.Path|Wick.Clip[]} objects - Optional. A list of objects to add to the clip.
     * @param {Wick.Transformation} transformation - Optional. The initial transformation of the clip.
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        this.timeline = new Wick.Timeline();
        this.timeline.addLayer(new Wick.Layer());
        this.timeline.activeLayer.addFrame(new Wick.Frame());

        this._transformation = args.transformation || new Wick.Transformation();

        this.cursor = 'default';

        /* If objects are passed in, add them to the clip and reposition them */
        if(args.objects) {
            this.addObjects(args.objects);
        }

        this._clones = [];
    }

    serialize (args) {
        var data = super.serialize(args);

        data.transformation = this.transformation.values;
        data.timeline = this._timeline;

        return data;
    }

    deserialize (data) {
        super.deserialize(data);

        this.transformation = new Wick.Transformation(data.transformation);
        this._timeline = data.timeline;

        this._clones = [];
    }

    get classname () {
        return 'Clip';
    }

    /**
     * Determines whether or not the clip is visible in the project.
     * @type {boolean}
     */
    get onScreen () {
        if(this.isRoot) {
            return true;
        } else if (this.parentBase) {
            return this.parentBase.onScreen;
        } else {
            return true;
        }
    }

    /**
     * Syntactic sugar for parentClip; for legacy support. The parent Clip of this object.
     * @type {Wick.Clip}
     */
    get parent () {
        return this._getParentByClassName('Clip');
    }

    /**
     * Syntactic sugar for parentObject; for legacy support. The parent Clip of this object.
     * @type {Wick.Clip}
     * @deprecated Use parentClip instead.
     */
    get parentObject () {
        return this._getParentByClassName('Clip');
    }

    /**
     * Determines whether or not the clip is the root clip in the project.
     * @type {boolean}
     */
    get isRoot () {
        return this.project && this === this.project.root;
    }

    /**
     * Determines whether or not the clip is the currently focused clip in the project.
     */
    get isFocus () {
        return this.project && this === this.project.focus;
    }

    /**
     * The timeline of the clip.
     * @type {Wick.Timeline}
     */
    get timeline () {
        return this.getChild('Timeline');
    }

    set timeline (timeline) {
        if(this.timeline) {
            this.removeChild(this.timeline);
        }
        this.addChild(timeline);
    }

    /**
     * The active layer of the clip's timeline.
     * @type {Wick.Layer}
     */
    get activeLayer () {
        return this.timeline.activeLayer;
    }

    /**
     * The active frame of the clip's timeline.
     * @type {Wick.Frame}
     */
    get activeFrame () {
        return this.activeLayer.activeFrame;
    }

    /**
     * An array containing every clip and frame that is a child of this clip and has an identifier.
     * @type {Wick.Base[]}
     */
    get namedChildren () {
        var namedChildren = [];
        this.timeline.frames.forEach(frame => {
            // Objects that can be accessed by their identifiers:

            // Frames
            if(frame.identifier) {
                namedChildren.push(frame);
            }

            // Clips
            frame.clips.forEach(clip => {
                if(clip.identifier) {
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
    get activeNamedChildren () {
        return this.namedChildren.filter(child => {
            return child.onScreen;
        });
    }

    /**
     * Remove this clip from its parent frame.
     */
    remove () {
        this.parentBase.removeClip(this);
    }

    /**
     * Remove this clip and add all of its paths and clips to its parent frame.
     * @returns {Wick.Base[]} the objects that were inside the clip.
     */
    breakApart () {
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
    addObjects (objects) {
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
    stop () {
        this.timeline.stop();
    }

    /**
     * Plays a clip's timeline from that clip's current playhead position.
     */
    play () {
        this.timeline.play();
    }

    /**
     * Moves a clip's playhead to a specific position and stops that clip's timeline on that position.
     * @param {number|string} frame - number or string representing the frame to move the playhead to.
     */
    gotoAndStop (frame) {
        this.timeline.gotoAndStop(frame);
    }

    /**
     * Moves a clip's playhead to a specific position and plays that clip's timeline from that position.
     * @param {number|string} frame - number or string representing the frame to move the playhead to.
     */
    gotoAndPlay (frame) {
        this.timeline.gotoAndPlay(frame);
    }
    
    /**
     * Repeats a specific part of the timeline.
     * @param {string|number} startFrame - A playhead position or name of a frame to start at.
     * @param {string|number} endFrame - When the playhead reaches this frame, it will loop back to startFrame.
     * @param {number|bool} [loop = true] - If true, will loop forever. If false, will play once and stop. If a number, it will play that many times in total.
     */
    gotoAndLoop (startFrame, endFrame, loop = true) {
        this.timeline.gotoAndLoop(startFrame, endFrame, loop);
    }

    /**
     * Move the playhead of the clips timeline forward one frame. Does nothing if the clip is on its last frame.
     */
    gotoNextFrame () {
        this.timeline.gotoNextFrame();
    }

    /**
     * Move the playhead of the clips timeline backwards one frame. Does nothing if the clip is on its first frame.
     */
    gotoPrevFrame () {
        this.timeline.gotoPrevFrame();
    }

    /**
     * Returns the name of the frame which is currently active. If multiple frames are active, returns the
     * name of the first active frame.
     * @returns {string} Active Frame name. If the active frame does not have an identifier, returns empty string.
     */
    get currentFrameName () {
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
    get currentFrameNumber () {
        return this.timeline.playheadPosition;
    }

    /**
     * The current transformation of the clip.
     * @type {Wick.Transformation}
     */
    get transformation () {
        return this._transformation;
    }

    set transformation (transformation) {
        this._transformation = transformation;

        // When the transformation changes, update the current tween, if one exists
        if(this.parentFrame) {
            var tween = this.parentFrame.getActiveTween();
            if(tween) {
                tween.transformation = this._transformation.copy();
            }
        }
    }

    /**
     * Returns true if this clip collides with another clip.
     * @param {Wick.Clip} other - The other clip to check collision with.
     * @returns {boolean} True if this clip collides the other clip.
     */
    hitTest (other) {
        return this.bounds.intersects(other.bounds);
    }

    /**
     * The bounding box of the clip.
     * @type {object}
     */
    get bounds () {
        return this.view.group.bounds;
    }

    /**
     * The X position of the clip.
     * @type {number}
     */
    get x () {
        return this.transformation.x;
    }

    set x (x) {
        this.transformation.x = x;
    }

    /**
     * The Y position of the clip.
     * @type {number}
     */
    get y () {
        return this.transformation.y;
    }

    set y (y) {
        this.transformation.y = y;
    }

    /**
     * The X scale of the clip.
     * @type {number}
     */
    get scaleX () {
        return this.transformation.scaleX;
    }

    set scaleX (scaleX) {
        this.transformation.scaleX = scaleX;
    }

    /**
     * The Y scale of the clip.
     * @type {number}
     */
    get scaleY () {
        return this.transformation.scaleY;
    }

    set scaleY (scaleY) {
        this.transformation.scaleY = scaleY;
    }

    /**
     * The width of the clip.
     * @type {number}
     */
    get width () {
        return this.isRoot ? this.project.width : this.bounds.width * this.scaleX;
    }

    set width (width) {
        this.scaleX = width / this.width * this.scaleX;
    }

    /**
     * The height of the clip.
     * @type {number}
     */
    get height () {
        return this.isRoot ? this.project.height : this.bounds.height * this.scaleY;
    }

    set height (height) {
        this.scaleY = height / this.height * this.scaleY;
    }

    /**
     * The rotation of the clip.
     * @type {number}
     */
    get rotation () {
        return this.transformation.rotation;
    }

    set rotation (rotation) {
        this.transformation.rotation = rotation;
    }

    /**
     * The opacity of the clip.
     * @type {number}
     */
    get opacity () {
        return this.transformation.opacity;
    }

    set opacity (opacity) {
        opacity = Math.min(1, opacity);
        opacity = Math.max(0, opacity);
        this.transformation.opacity = opacity;
    }

    /**
     * Copy this clip, and add the copy to the same frame as the original clip.
     * @returns {Wick.Clip} the result of the clone.
     */
    clone () {
        var clone = this.copy();
        clone.identifier = null;
        this.parentFrame.addClip(clone);
        this._clones.push(clone);
        return clone;
    }

    /**
     * An array containing all objects that were created by calling clone() on this Clip.
     * @type {Wick.Clip[]}
     */
    get clones () {
        return this._clones;
    }

    /**
     * The total length of this clip's timeline.
     * @type {number}
     */
    get length () {
        return this.timeline.length;
    }
    
    /**
     * Is this clip playing?
     * @type {boolean}
     */
    get playing () {
        return this.timeline._playing;
    }
    
    /**
     * Is this clip playing in reverse?
     * @type {boolean}
     */
    get playingInReverse () {
        return this.timeline._playing && this.timeline._reversed;
    }
    
    /**
     * This is a stopgap to prevent users from using setText with a Clip.
     */
    setText (newTextContent) {
        throw new Error('setText() can only be used with text objects.');
    }

    /**
     * The list of parents, grandparents, grand-grandparents...etc of the clip.
     * @returns {Wick.Clip[]} Array of all parents
     */
    get lineage () {
        if(this.isRoot) {
            return [this];
        } else {
            return [this].concat(this.parentClip.lineage);
        }
    }

    _onInactive () {
        return super._onInactive();
    }

    _onActivated () {
        var error = super._onActivated();
        if(error) return error;

        return this._tickChildren();
    }

    _onActive () {
        var error = super._onActive();
        if(error) return error;

        this.timeline.advance();
        return this._tickChildren();
    }

    _onDeactivated () {
        var error = super._onDeactivated();
        if(error) return error;

        return this._tickChildren();
    }

    _tickChildren () {
        var childError = null;
        this.timeline.frames.forEach(frame => {
            if(childError) return;
            childError = frame.tick();
        });
        return childError;
    }

    _attachChildClipReferences () {
        this.timeline.activeFrames.forEach(frame => {
            frame.clips.forEach(clip => {
                if(clip.identifier) {
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
