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
        this._removed = false;

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
     * Signals if an object is removed.
     */
    get removed () {
        return this._removed;
    }

    set removed (bool) {
        this._removed = bool; 
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
     * Returns the source clip of this clip if this clip is a clone. Null otherwise.
     * 
     */
    get sourceClip () {
        if (!this.sourceClipUUID) return null;

        return this.project.getObjectByUUID(this.sourceClipUUID);
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

            this.resetTimelinePosition();
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
     * Resets the clip's timeline position.
     */
    resetTimelinePosition () {
        if (this.animationType === 'single') {
            this.applySingleFramePosition();
        } else {
            this.timeline.playheadPosition = 1; // Reset timeline position if we are not on single frame.
        }
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
     * Remove a clone from the clones array by uuid.
     * @param {string} uuid 
     */
    removeClone (uuid) {
        if (this.isClone) return;
        this._clones = this.clones.filter(obj => obj.uuid !== uuid);
    }

    /**
     * Remove this clip from its parent frame.
     */
    remove() {
        // Don't attempt to remove if the object has already been removed.
        // (This is caused by calling remove() multiple times on one object inside a script.)
        if (!this.parent) return;

        // Force unload to run now, before object is removed;
        this.runScript('unload'); 

        // Remove from the clones array.
        this.sourceClip && this.sourceClip.removeClone(this.uuid);
        this.parent.removeClip(this);
        this.removed = true;
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
            // This tween must only ever be the tween over the current playhead position.
            // Altering the active tween will overwrite tweens when moving between frames.
            var tween = this.parentFrame.getTweenAtCurrentPlayheadPosition();
            if (tween) {
                tween.transformation = this._transformation.copy();
            }
        }
    }

    /**
     * Perform circular hit test with other clip.
     * @param {Wick.Clip} other - the clip to hit test with
     * @param {object} options - Hit test options
     * @returns {object} Hit information
     */
    circleHits(other, options) {
        let bounds1 = this.absoluteBounds;
        let bounds2 = other.absoluteBounds;
        let c1 = bounds1.center;
        let c2 = bounds2.center;
        let distance = Math.sqrt((c1.x - c2.x)*(c1.x - c2.x) + (c1.y - c2.y)*(c1.y - c2.y));
        let r1 = options.radius ? options.radius : this.radius;
        let r2 = other.radius; //should add option for other radius?
        let overlap = r1 + r2 - distance;
        // TODO: Maybe add a case for overlap === 0?
        if (overlap > 0) {
            let x = c1.x - c2.x;
            let y = c1.y - c2.y;
            let magnitude = Math.sqrt(x*x + y*y);
            x = x / magnitude;
            y = y / magnitude;
            // <x,y> is now a normalized vector from c2 to c1 
            
            let result = {};
            if (options.overlap) {
                result.overlapX = overlap * x;
                result.overlapY = overlap * y;
            }
            if (options.offset) {
                result.offsetX = overlap * x;
                result.offsetY = overlap * y;
            }
            if (options.intersections) {
                if (r2 - distance > r1 || r1 - distance > r2 || distance === 0) {
                    result.intersections = [];
                }
                else {
                    // Using https://mathworld.wolfram.com/Circle-CircleIntersection.html
                    let d = (distance * distance + r1*r1 - r2*r2) / (2 * distance);
                    let h = Math.sqrt(r1 * r1 - d * d);
                    let x0 = c1.x - d*x;
                    let y0 = c1.y - d*y;
                    result.intersections = [{x: x0 + h*y, y: y0 - h*x}, 
                        {x: x0 - h*y, y: y0 + h*x}];
                }
            }
            return result;
        }
        
        return null;
    }

    /**
     * Perform rectangular hit test with other clip.
     * @param {Wick.Clip} other - the clip to hit test with
     * @param {object} options - Hit test options
     * @returns {object} Hit information
     */
    rectangleHits(other, options) {
        let bounds1 = this.absoluteBounds;
        let bounds2 = other.absoluteBounds;

        // TODO: write intersects so we don't rely on paper Rectangle objects
        if (bounds1.intersects(bounds2)) {
            let result = {};

            if (options.overlap) {
                // Find the direction along which we have to travel the least distance to no longer overlap
                let left = bounds2.left - bounds1.right;
                let right = bounds2.right - bounds1.left;
                let up = bounds2.top - bounds1.bottom;
                let down = bounds2.bottom - bounds1.top;
                let overlapX = Math.abs(left) < Math.abs(right) ? left : right;
                let overlapY = Math.abs(up) < Math.abs(down) ? up : down;
                if (Math.abs(overlapX) < Math.abs(overlapY)) {
                    overlapY = 0;
                }
                else {
                    overlapX = 0;
                }

                result.overlapX = overlapX;
                result.overlapY = overlapY;
            }
            if (options.offset) {
                // Find how far along the center to center vector we must travel to no longer overlap
                let vectorX = bounds1.center.x - bounds2.center.x;
                let vectorY = bounds1.center.y - bounds2.center.y;
                let magnitude = Math.sqrt(vectorX*vectorX + vectorY*vectorY);
                vectorX /= magnitude;
                vectorY /= magnitude;

                // Choose p1, p2, based on quadrant of center to center vector
                let p1 = vectorX > 0 ? (vectorY > 0 ? bounds1.topLeft : bounds1.bottomLeft) : (vectorY > 0 ? bounds1.topRight : bounds1.bottomRight);
                let p2 = vectorX > 0 ? (vectorY > 0 ? bounds2.bottomRight : bounds2.topRight) : (vectorY > 0 ? bounds2.bottomLeft : bounds2.topLeft);
                
                if (Math.abs(p2.x - p1.x) < Math.abs((p2.y - p1.y) * vectorX / vectorY)) {
                    result.offsetX = p2.x - p1.x;
                    result.offsetY = result.offsetX * vectorY / vectorX;
                }
                else {
                    result.offsetY = p2.y - p1.y;
                    result.offsetX = result.offsetY * vectorX / vectorY;
                }
            }
            if (options.intersections) {
                result.intersections = [];
                let ps1 = [bounds1.topLeft, bounds1.topRight, bounds1.bottomRight, bounds1.bottomLeft];
                let ps2 = [bounds2.topLeft, bounds2.topRight, bounds2.bottomRight, bounds2.bottomLeft];
                for (let i = 0; i < 4; i++) {
                    for (let j = (i + 1) % 2; j < 4; j += 2) { // iterate over the perpendicular lines
                        let a = ps1[i];
                        let b = ps1[(i + 1) % 4];
                        let c = ps2[j];
                        let d = ps2[(j + 1) % 4];

                        // Perpendicular lines will intersect, we'll use parametric line intersection
                        //<x,y> = a + (b - a)t1
                        //<x,y> = c + (d - c)t2
                        //a + (b - a)t1 = c + (d - c)t2
                        //t1(b - a) = (c + (d - c)t2 - a)
                        //(a - c)/(d - c) = t2
                        let t1, t2;
                        if (a.x === b.x) {
                            t2 = (a.x - c.x) / (d.x - c.x);
                            t1 = (c.y + (d.y - c.y) * t2 - a.y) / (b.y - a.y);
                        }
                        else {
                            //a.y === b.y
                            t2 = (a.y - c.y) / (d.y - c.y);
                            t1 = (c.x + (d.x - c.x) * t2 - a.x) / (b.x - a.x);
                        }
                        if (0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1) {
                            result.intersections.push({x: a.x + (b.x - a.x) * t1, y: a.y + (b.y - a.y) * t1});
                        }
                    }
                }
            }

            return result;
        }
        else {
            return null;
        }
    }

    // Return whether triangle p1 p2 p3 is clockwise (in screen space,
    // means counterclockwise in a normal space with y axis pointed up)
    cw(x1, y1, x2, y2, x3, y3) {           
        const cw = ((y3 - y1) * (x2 - x1)) - ((y2 - y1) * (x3 - x1));
        return cw >= 0; // colinear ?
    }

    /**
     * Perform convex hull hit test with other clip.
     * @param {Wick.Clip} other - the clip to hit test with
     * @param {object} options - Hit test options
     * @returns {object} Hit information
     */
    convexHits(other, options) {
        // Efficient check first
        let bounds1 = this.absoluteBounds;
        let bounds2 = other.absoluteBounds;
        // TODO: write intersects so we don't rely on paper Rectangle objects
        if (!bounds1.intersects(bounds2)) {
            return null;
        }
        let c1 = bounds1.center;
        let c2 = bounds2.center;

        // clockwise arrays of points in format [[x1, y1], [x2, y2], ...]
        let hull1 = this.convexHull;
        let hull2 = other.convexHull;

        let finished1 = false;
        let finished2 = false;

        let i1 = hull1.length - 1;
        let i2 = hull2.length - 1;

        let intersections = [];

        let n = 0;
        // Algorithm from https://www.bowdoin.edu/~ltoma/teaching/cs3250-CompGeom/spring17/Lectures/cg-convexintersection.pdf
        while ((!finished1 || !finished2) && n <= 2 * (hull1.length + hull2.length)) {
            n++;
            // line segments A is ab, B is cd
            let a = hull1[i1],
            b = hull1[((i1 - 1) % hull1.length + hull1.length) % hull1.length],
            c = hull2[i2],
            d = hull2[((i2 - 1) % hull2.length + hull2.length) % hull2.length];

            //Use parametric line intersection
            //<x,y> = a + (b - a)t1
            //<x,y> = c + (d - c)t2
            //a + (b - a)t1 = c + (d - c)t2
            //t1 = (c.x + (d.x - c.x)t2 - a.x) / (b.x - a.x)
            //a.y + (b.y - a.y) * (c.x + (d.x - c.x)t2 - a.x) / (b.x - a.x) = c.y + (d.y - c.y)t2
            //t2((b.y - a.y)(d.x - c.x)/(b.x - a.x) - (d.y - c.y)) = c.y - a.y - (b.y - a.y)*(c.x - a.x)/(b.x - a.x)
            //t2 = (c.y - a.y - (b.y - a.y)*(c.x - a.x)/(b.x - a.x))  /  ((b.y - a.y)(d.x - c.x)/(b.x - a.x) - (d.y - c.y))
            let t2 = (c[1] - a[1] - (b[1] - a[1]) * (c[0] - a[0]) / (b[0] - a[0]))  /  ((b[1] - a[1]) * (d[0] - c[0]) / (b[0] - a[0]) - d[1] + c[1]);
            let t1 = (c[0] + (d[0] - c[0]) * t2 - a[0]) / (b[0] - a[0]);

            if (0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1) {
                intersections.push({x: a[0] + (b[0] - a[0])*t1, y: a[1] + (b[1] - a[1]) * t1});
            }

            let APointingToB = t1 > 1;
            let BPointingToA = t2 > 1;

            if (BPointingToA && !APointingToB) {
                // Advance B
                i2 -= 1;
                if (i2 < 0) {
                    finished2 = true;
                    i2 += hull2.length;
                }
            }
            else if (APointingToB && !BPointingToA) {
                // Advance A
                i1 -= 1;
                if (i1 < 0) {
                    finished1 = true;
                    i1 += hull1.length;
                }
            }
            else {
                // Advance outside
                if (this.cw(a[0], a[1], b[0], b[1], d[0], d[1])) {
                    // Advance B
                    i2 -= 1;
                    if (i2 < 0) {
                        finished2 = true;
                        i2 += hull2.length;
                    }
                }
                else {
                    // Advance A
                    i1 -= 1;
                    if (i1 < 0) {
                        finished1 = true;
                        i1 += hull1.length;
                    }
                }
            }
        }
        // Ok, we have all the intersections now
        let avgIntersection = {x: 0, y: 0};
        if (intersections.length === 0) {
            avgIntersection.x = bounds1.width < bounds2.width ? c1.x : c2.x;
            avgIntersection.y = bounds1.width < bounds2.width ? c1.y : c2.y;
        }
        else {
            for (let i = 0; i < intersections.length; i++) {
                avgIntersection.x += intersections[i].x;
                avgIntersection.y += intersections[i].y;
            }
            avgIntersection.x /= intersections.length;
            avgIntersection.y /= intersections.length;
        }

        let result = {};
        if (options.intersections) {
            result.intersections = intersections;
        }
        if (options.offset) {
            // Calculate offset by taking the center of mass of the intersection, call it P,
            // get the radius from P on this convex hull in the direction
            // from this center to that center,
            // Then, the offset is a vector in the direction from that center to this center
            // with magnitude of that radius

            let targetTheta = Math.atan2(c2.y - c1.y, c2.x - c1.x); //from c1 to c2
            let r = this.radiusAtPointInDirection(hull1, avgIntersection, targetTheta);
            targetTheta = (targetTheta + Math.PI) % (2 * Math.PI);
            r += this.radiusAtPointInDirection(hull2, avgIntersection, targetTheta);

            let directionX = c1.x - c2.x;
            let directionY = c1.y - c2.y;
            let mag = Math.sqrt(directionX*directionX + directionY*directionY);
            directionX *= r / mag;
            directionY *= r / mag;
            result.offsetX = directionX;
            result.offsetY = directionY;
        }
        if (options.overlap) {
            //same as offset except instead of center to center, 
            //we will move perpendicular to the best fit line
            //of the intersection points

            let directionX, directionY;
            if (intersections.length < 2) {
                directionX = c2.x - c1.x;
                directionY = c2.y - c1.y;
            }
            else {
                let max_d = 0;
                for (let i = 1; i < intersections.length; i++) {
                    let d = (intersections[i].y - intersections[0].y) * (intersections[i].y - intersections[0].y) +
                        (intersections[i].x - intersections[0].x) * (intersections[i].x - intersections[0].x);
                    if (d > max_d) {
                        max_d = d;
                        directionX = -(intersections[i].y - intersections[0].y);
                        directionY = intersections[i].x - intersections[0].x;
                        if (directionX * (c1.x - avgIntersection.x) + directionY * (c1.y - avgIntersection.y) > 0) {
                            directionX = -directionX;
                            directionY = -directionY;
                        }
                    }
                }
            }

            let targetTheta = Math.atan2(directionY, directionX); 
            let r = this.radiusAtPointInDirection(hull1, avgIntersection, targetTheta);
            targetTheta = (targetTheta + Math.PI) % (2 * Math.PI);
            r += this.radiusAtPointInDirection(hull2, avgIntersection, targetTheta);

            let r2 = this.radiusAtPointInDirection(hull1, avgIntersection, targetTheta);
            targetTheta = (targetTheta + Math.PI) % (2 * Math.PI);
            r2 += this.radiusAtPointInDirection(hull2, avgIntersection, targetTheta);

            if (r2 < r) {
                r = r2;
                directionX *= -1;
                directionY *= -1;
            }


            let mag = Math.sqrt(directionX*directionX + directionY*directionY);
            directionX *= -r / mag;
            directionY *= -r / mag;
            result.overlapX = directionX;
            result.overlapY = directionY;
        }
        return result;
    }

    /**
     * Casts a ray from p in the direction targetTheta and intersects it with the hull ch,
     * returns the distance from p to the surface of ch.
     * @param {list} ch - the convex hull to intersect a ray with
     * @param {object} p - the point of origin of the ray
     * @param {number} targetTheta - the direction of the ray
     * @returns {number} the distance to the surface of the convex hull from the point in the direction theta
     */
    radiusAtPointInDirection(ch, p, targetTheta) {
        let minThetaDiff = Infinity;
        let index;
        for (let i = 0; i < ch.length; i++) {
            let theta = Math.atan2(ch[i][1] - p.y, ch[i][0] - p.x);
            let thetaDiff = ((targetTheta - theta) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI); //positive mod
            if (thetaDiff < minThetaDiff) {
                minThetaDiff = thetaDiff;
                index = i;
            }
        }
        let a = ch[index];
        let b = ch[(index + 1) % ch.length];
        let c = [p.x, p.y];
        let d = [p.x + 100 * Math.cos(targetTheta), p.y + 100 * Math.sin(targetTheta)];
        //Use parametric line intersection
        //<x,y> = a + (b - a)t1
        //<x,y> = c + (d - c)t2
        //a + (b - a)t1 = c + (d - c)t2
        //t1 = (c.x + (d.x - c.x)t2 - a.x) / (b.x - a.x)
        //a.y + (b.y - a.y) * (c.x + (d.x - c.x)t2 - a.x) / (b.x - a.x) = c.y + (d.y - c.y)t2
        //t2((b.y - a.y)(d.x - c.x)/(b.x - a.x) - (d.y - c.y)) = c.y - a.y - (b.y - a.y)*(c.x - a.x)/(b.x - a.x)
        //t2 = (c.y - a.y - (b.y - a.y)*(c.x - a.x)/(b.x - a.x))  /  ((b.y - a.y)(d.x - c.x)/(b.x - a.x) - (d.y - c.y))
        let t2 = (c[1] - a[1] - (b[1] - a[1]) * (c[0] - a[0]) / (b[0] - a[0]))  /  ((b[1] - a[1]) * (d[0] - c[0]) / (b[0] - a[0]) - d[1] + c[1]);
        let t1 = (c[0] + (d[0] - c[0]) * t2 - a[0]) / (b[0] - a[0]);
        return Math.hypot(a[0] + (b[0] - a[0])*t1 - p.x, a[1] + (b[1] - a[1]) * t1 - p.y);
    }

    /**
     * Perform hit test with other clip.
     * @param {Wick.Clip} other - the clip to hit test with
     * @param {object} options - Hit test options
     * @returns {object} Hit information
     */
    hits(other, options) {
        // Get hit options
        let finalOptions = {...this.project.hitTestOptions};
        if (options) {
            if (options.mode === 'CIRCLE' || options.mode === 'RECTANGLE' || options.mode === 'CONVEX') {
                finalOptions.mode = options.mode;
            }
            if (typeof options.offset === "boolean") {
                finalOptions.offset = options.offset;
            }
            if (typeof options.overlap === "boolean") {
                finalOptions.overlap = options.overlap;
            }
            if (typeof options.intersections === "boolean") {
                finalOptions.intersections = options.intersections;
            }
            if (options.radius) {
                finalOptions.radius = options.radius;
            }
        }

        if (finalOptions.mode === 'CIRCLE') {
            return this.circleHits(other, finalOptions);
        }
        else if (finalOptions.mode === 'CONVEX') {
            return this.convexHits(other, finalOptions);
        }
        else {
            return this.rectangleHits(other, finalOptions);
        }
    }

    /**
     * Returns true if this clip collides with another clip.
     * @param {Wick.Clip} other - The other clip to check collision with.
     * @returns {boolean} True if this clip collides the other clip.
     */
    hitTest(other) {
        // TODO: write intersects so we don't rely on paper Rectangle objects
        return this.absoluteBounds.intersects(other.absoluteBounds);
    }

    /**
     * The bounding box of the clip.
     * @type {object}
     */
    get bounds() {
        // TODO: Refactor so that getting bounds does not rely on the view
        return this.view.bounds;
    }

    get absoluteBounds() {
        // TODO: Refactor so that getting bounds does not rely on the view
        return this.view.absoluteBounds;
    }

    get points () {
        // TODO: Refactor so that does not rely on the view
        return this.view.points;
    }

    get radius () {
        // Use length of half diagonal of bounding box
        let b = this.absoluteBounds;
        return Math.sqrt(b.width*b.width + b.height*b.height)/2/Math.sqrt(2);
        
        // Alternative: use largest distance from center to a point on the object
        /*
        let center = this.absoluteBounds.center;
        let points = this.points;
        let max_r = 0;
        for (let p = 0; p < points.length; p++) {
            let point = points[p];
            let x = point[0] - center.x;
            let y = point[1] - center.y;
            max_r = Math.max(max_r, x*x + y*y);
        }

        return Math.sqrt(max_r);
        */
    }

    // Gives clockwise in screen space, which is ccw in regular axes
    get convexHull () {
        let points = this.points;

        // Infinity gets us the convex hull
        let ch = hull(points, Infinity);

        let removedDuplicates = [];
        let epsilon = 0.01;
        for (let i = 0; i < ch.length; i++) {
            if (removedDuplicates.length > 0) {
                if ((Math.abs(ch[i][0] - removedDuplicates[removedDuplicates.length - 1][0]) > epsilon ||
                    Math.abs(ch[i][1] - removedDuplicates[removedDuplicates.length - 1][1]) > epsilon) && 
                    (Math.abs(ch[i][0] - removedDuplicates[0][0]) > epsilon ||
                    Math.abs(ch[i][1] - removedDuplicates[0][1]) > epsilon)) {
                    removedDuplicates.push(ch[i]);
                }
            }
            else {
                removedDuplicates.push(ch[i]);
            }
        }

        return removedDuplicates;
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
