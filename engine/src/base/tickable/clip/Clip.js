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

    deserialize (data) {
        super.deserialize(data);

        this.transformation = new Wick.Transformation(data.transformation);
        this._timeline = data.timeline;

        this._clones = [];
    }

    serialize (args) {
        var data = super.serialize(args);

        data.transformation = this.transformation.values;
        data.timeline = this._timeline;

        return data;
    }

    get classname () {
        return 'Clip';
    }

    /**
     * Determines whether or not the clip is visible in the project.
     */
    get onScreen () {
        if(this.isRoot) {
            return true;
        } else if (this.parent) {
            return this.parent.onScreen;
        } else {
            return true;
        }
    }

    /**
     * Determines whether or not the clip is the root clip in the project.
     */
    get isRoot () {
        return this.project && this === this.project.root;
    }

    /**
     * The timeline of the clip.
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
     */
    get activeLayer () {
        return this.timeline.activeLayer;
    }

    /**
     * The active frame of the clip's timeline.
     */
    get activeFrame () {
        return this.activeLayer.activeFrame;
    }

    /**
     * An array containing every clip and frame that is a child of this clip and has an identifier.
     */
    get namedChildren () {
        var namedChildren = [];
        this.timeline.frames.forEach(frame => {
            if(frame.identifier) {
                namedChildren.push(frame);
            }
            frame.clips.forEach(clip => {
                if(clip.identifier) {
                    namedChildren.push(clip);
                }
            });
        });
        return namedChildren;
    }

    /**
     * An array containing every clip and frame that is a child of this clip and has an identifier, and also is visible on screen.
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
        this.parent.removeClip(this);
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
     * @example
     * clipName.stop();
     */
    stop () {
        this.timeline.stop();
    }

    /**
     * Plays a clip's timeline from that clip's current playhead position.
     * @example
     * clipName.play();
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
     * @deprecated
     * Returns true if this clip collides with another clip.
     * @param {Wick.Clip} clip - The other clip to check collision with.
     * @returns {boolean} True if this clip collides the other clip.
     */
    hitTest (other) {
        return this.hitInfo(other) !== null;
    }

    /**
     * @deprecated
     * Returns an object containing information about the collision between this object and another.
     * @returns {SAT.Response} The SAT.js response object with collision info. See: https://github.com/jriecken/sat-js#satresponse
     */
    hitInfo (other) {
        var V = SAT.Vector;
        var P = SAT.Polygon;

        // Bounds polygon of this clip
        var bounds1 = this.bounds;
        var polygon1 = new P(new V(this.transformation.x, this.transformation.y), [
            new V(bounds1.x, bounds1.y),
            new V(bounds1.x + bounds1.width * this.transformation.scaleX, bounds1.y),
            new V(bounds1.x + bounds1.width * this.transformation.scaleX, bounds1.y + bounds1.height * this.transformation.scaleY),
            new V(0, bounds1.y + bounds1.height * this.transformation.scaleY)
        ]);

        // Bounds polygon of other clip
        var bounds2 = other.bounds;
        var polygon2 = new P(new V(other.transformation.x, other.transformation.y), [
            new V(bounds2.x, bounds2.y),
            new V(bounds2.x + bounds2.width * this.transformation.scaleX, bounds2.y),
            new V(bounds2.x + bounds2.width * this.transformation.scaleX, bounds2.y + bounds2.height * this.transformation.scaleY),
            new V(0, bounds2.y + bounds2.height * this.transformation.scaleY)
        ]);

        // Get collision response from SAT
        var response = new SAT.Response();
        var collided = SAT.testPolygonPolygon(polygon1, polygon2, response);
        if(collided) {
            return response;
        } else {
            return null;
        }
    }

    /**
     * The bounding box of the clip.
     */
    get bounds () {
        return this.view.container.getLocalBounds();
    }

    /**
     * The X position of the clip.
     */
    get x () {
        return this.transformation.x;
    }

    set x (x) {
        this.transformation.x = x;
    }

    /**
     * The Y position of the clip.
     */
    get y () {
        return this.transformation.y;
    }

    set y (y) {
        this.transformation.y = y;
    }

    /**
     * The X scale of the clip.
     */
    get scaleX () {
        return this.transformation.scaleX;
    }

    set scaleX (scaleX) {
        this.transformation.scaleX = scaleX;
    }

    /**
     * The Y scale of the clip.
     */
    get scaleY () {
        return this.transformation.scaleY;
    }

    set scaleY (scaleY) {
        this.transformation.scaleY = scaleY;
    }

    /**
     * The rotation of the clip.
     */
    get rotation () {
        return this.transformation.rotation;
    }

    set rotation (rotation) {
        this.transformation.rotation = rotation;
    }

    /**
     * The opacity of the clip.
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
        this.parentFrame.addClip(clone);
        this._clones.push(clone);
        return clone;
    }

    /**
     *
     */
    get clones () {
        return this._clones;
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
        })
    }
}
