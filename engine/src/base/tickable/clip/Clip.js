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
 * A class representing a Wick Clip.
 */
Wick.Clip = class extends Wick.Tickable {
    /**
     * Create a new clip.
     * @param {string} identifier - The identifier of the new clip.
     * @param {Wick.Path|Wick.Clip[]} objects - Optional. A list of objects to add to the clip.
     * @param {Wick.Transformation} transform - Optional. The initial transformation of the clip.
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        this.timeline = new Wick.Timeline();
        this.timeline.addLayer(new Wick.Layer());
        this.timeline.activeLayer.addFrame(new Wick.Frame());

        this.identifier = args.identifier || 'New Symbol';

        this.transform = args.transform || new Wick.Transformation();

        this.cursor = 'default';

        /* If objects are passed in, add them to the clip and reposition them */
        if(args.objects) {
            var clips = args.objects.filter(object => {
                return object instanceof Wick.Clip;
            });
            var paths = args.objects.filter(object => {
                return object instanceof Wick.Path;
            });

            clips.forEach(clip => {
                clip.transform.x -= this.transform.x;
                clip.transform.y -= this.transform.y;
                this.activeFrame.addClip(clip);
            });
            paths.forEach(path => {
                path.paperPath.position = new paper.Point(
                    path.paperPath.position.x - this.transform.x,
                    path.paperPath.position.y - this.transform.y
                );
                this.activeFrame.addPath(path);
            });
        }
    }

    static deserialize (data) {
        super.deserialize(data, object);

        this.transform = new Wick.Transformation(data.transformation);
        this._timeline = data.timeline;

        return object;
    }

    serialize () {
        var data = super.serialize();

        data.transform = this.transform.values;
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
        return this.getChildByUUID(this._timeline);
    }

    set timeline (timeline) {
        if(this.timeline) {
            this.removeChild(this.timeline);
        }
        this._timeline = timeline.uuid;
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
     */
    breakApart () {
        var leftovers = [];

        this.timeline.activeFrames.forEach(frame => {
            frame.clips.forEach(clip => {
                clip.transform.x += this.transform.x;
                clip.transform.y += this.transform.y;
                this.parentTimeline.activeFrame.addClip(clip);
                leftovers.push(clip);
            });
            frame.paths.forEach(path => {
                path.paperPath.position.x += this.transform.x;
                path.paperPath.position.y += this.transform.y;
                this.parentTimeline.activeFrame.addPath(path);
                leftovers.push(path);
            });
        });

        this.remove();

        return leftovers;
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
        var polygon1 = new P(new V(this.transform.x, this.transform.y), [
            new V(bounds1.x, bounds1.y),
            new V(bounds1.x + bounds1.width * this.transform.scaleX, bounds1.y),
            new V(bounds1.x + bounds1.width * this.transform.scaleX, bounds1.y + bounds1.height * this.transform.scaleY),
            new V(0, bounds1.y + bounds1.height * this.transform.scaleY)
        ]);

        // Bounds polygon of other clip
        var bounds2 = other.bounds;
        var polygon2 = new P(new V(other.transform.x, other.transform.y), [
            new V(bounds2.x, bounds2.y),
            new V(bounds2.x + bounds2.width * this.transform.scaleX, bounds2.y),
            new V(bounds2.x + bounds2.width * this.transform.scaleX, bounds2.y + bounds2.height * this.transform.scaleY),
            new V(0, bounds2.y + bounds2.height * this.transform.scaleY)
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
        return this.transform.x;
    }

    set x (x) {
        this.transform.x = x;
    }

    /**
     * The Y position of the clip.
     */
    get y () {
        return this.transform.y;
    }

    set y (y) {
        this.transform.y = y;
    }

    /**
     * The X scale of the clip.
     */
    get scaleX () {
        return this.transform.scaleX;
    }

    set scaleX (scaleX) {
        this.transform.scaleX = scaleX;
    }

    /**
     * The Y scale of the clip.
     */
    get scaleY () {
        return this.transform.scaleY;
    }

    set scaleY (scaleY) {
        this.transform.scaleY = scaleY;
    }

    /**
     * The rotation of the clip.
     */
    get rotation () {
        return this.transform.rotation;
    }

    set rotation (rotation) {
        this.transform.rotation = rotation;
    }

    /**
     * The opacity of the clip.
     */
    get opacity () {
        return this.transform.opacity;
    }

    set opacity (opacity) {
        opacity = Math.min(1, opacity);
        opacity = Math.max(0, opacity);
        this.transform.opacity = opacity;
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
        // There are no frames, or the playhead is over an empty space
        if(!this.timeline.activeFrame) {
            return [];
        }

        this.timeline.activeFrame.clips.forEach(clip => {
            if(clip.identifier) {
                this[clip.identifier] = clip;
                clip._attachChildClipReferences();
            }
        });
    }
}
