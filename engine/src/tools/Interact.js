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

Wick.Tools.Interact = class extends Wick.Tool {
    /**
     * Creates an Interact tool.
     */
    constructor () {
        super();

        this.name = 'interact';

        this._keysDown = [];
        this._lastKeyDown = null;
        this._mouseIsDown = false;
        this._mousePosition = new paper.Point(0,0);
        this._mouseTargets = [];
    }

    onActivate (e) {

    }

    onDeactivate (e) {

    }

    onMouseMove (e) {
        this._mousePosition = e.point;
    }

    onMouseDrag (e) {
        this._mousePosition = e.point;
    }

    onMouseDown (e) {
        this._mousePosition = e.point;
        this._mouseIsDown = true;
    }

    onMouseUp (e) {
        this._mousePosition = e.point;
        this._mouseIsDown = false;
    }

    onKeyDown (e) {
        this._lastKeyDown = e.key;

        if(this._keysDown.indexOf(e.key) === -1) {
            this._keysDown.push(e.key);
        }
    }

    onKeyUp (e) {
        this._keysDown = this._keysDown.filter(key => {
            return key !== e.key;
        });
    }

    get mousePosition () {
        return this._mousePosition;
    }

    get mouseIsDown () {
        return this._mouseIsDown;
    }

    get keysDown () {
        return this._keysDown;
    }

    get lastKeyDown () {
        return this._lastKeyDown;
    }

    get mouseTargets () {
        return this._mouseTargets;
    }

    get doubleClickEnabled () {
        return false;
    }

    /**
     * Use the current position of the mouse to determine which object(s) are under the mouse
     */
    determineMouseTargets () {
        var targets = [];

        var hitResult = this.paper.project.hitTest(this.mousePosition, {
            fill: true,
            stroke: true,
            curves: true,
            segments: true,
        });

        // Check for clips under the mouse.
        if(hitResult) {
            var uuid = hitResult.item.data.wickUUID;
            if(uuid) {
                var path = Wick.ObjectCache.getObjectByUUID(uuid);

                if(!path.parentClip.isRoot) {
                    var clip = path.parentClip;
                    var lineageWithoutRoot = clip.lineage;
                    lineageWithoutRoot.pop();
                    targets = lineageWithoutRoot;
                }
            }
        } else if(this.project.activeFrame) {
            // No clips are under the mouse, so the frame is under the mouse.
            targets = [this.project.activeFrame];
        } else {
            targets = [];
        }

        // Update cursor
        if(this.project.hideCursor) {
            this.setCursor('none');
        } else {
            var clip = targets.find(target => {
                return target instanceof Wick.Button;
            });
            if(clip) {
                this.setCursor(clip.cursor)
            } else {
                this.setCursor('default');
            }
        }

        this._mouseTargets = targets;
    }
}
