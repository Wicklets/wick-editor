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

Wick.Tools.FillBucket = class extends Wick.Tool {
    /**
     *
     */
    constructor () {
        super();

        this.name = 'fillbucket';
    }

    /**
     *
     * @type {string}
     */
    get cursor () {
        return 'url(cursors/fillbucket.png) 32 32, auto';
    }

    onActivate (e) {

    }

    onDeactivate (e) {

    }

    onMouseDown (e) {
        var hitResult = paper.project.activeLayer.hitTest(e.point, {
            fill: true
        });
        if(hitResult && hitResult.item) {
            hitResult.item.fillColor = this.getSetting('fillColor');
            this.fireEvent('canvasModified');
        } else {
            setTimeout(() => {
                this.setCursor('wait');
            }, 0);

            setTimeout(() => {
                this.paper.project.activeLayer.hole({
                    point: e.point,
                    onFinish: (path) => {
                        this.setCursor('default');
                        if(path) {
                            path.fillColor = this.getSetting('fillColor');
                            path.name = null;
                            this.paper.project.activeLayer.addChild(path);
                            this.fireEvent('canvasModified');
                        }
                    },
                    onError: (message) => {
                        this.setCursor('default');
                        this.fireEvent('error', {
                            message: message,
                        });
                    }
                });
            }, 50);
        }
    }

    onMouseDrag (e) {

    }

    onMouseUp (e) {

    }
}
