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
 * A class representing a Wick Button.
 * Buttons are just clips with special timelines controlled by mouse interactions.
 */
Wick.Button = class extends Wick.Clip {
    constructor (args) {
        super(args);

        this.cursor = 'pointer';
    }

    deserialize (data) {
        super.deserialize(data);
    }

    serialize (args) {
        var data = super.serialize(args);
        return data;
    }

    get classname () {
        return 'Button';
    }

    _onInactive () {
        return super._onInactive();
    }

    _onActivated () {
        var error = super._onActivated();
        this.timeline.stop();
        this.timeline.playheadPosition = 1;
        return error;
    }

    _onActive () {
        this.timeline._forceNextFrame = 1;

        var frame2Exists = this.timeline.getFramesAtPlayheadPosition(2).length > 0;
        var frame3Exists = this.timeline.getFramesAtPlayheadPosition(3).length > 0;

        if(this._mouseState === 'over') {
            if(frame2Exists) {
                this.timeline.gotoFrame(2);
            }
        } else if(this._mouseState === 'down') {
            if(frame3Exists) {
                this.timeline.gotoFrame(3);
            } else if (frame2Exists) {
                this.timeline.gotoFrame(2);
            }
        }

        var error = super._onActive();
        if(error) return error;

        return null;
    }

    _onDeactivated () {
        super._onDeactivated();
    }
}
