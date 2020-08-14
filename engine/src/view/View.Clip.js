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

Wick.View.Clip = class extends Wick.View {
    static get BORDER_STROKE_WIDTH () {
        return 2;
    }

    static get BORDER_STROKE_COLOR_NORMAL () {
        return '#2636E1';
    }

    static get BORDER_STROKE_COLOR_HAS_CODE () {
        return '#01C094';
    }

    static get BORDER_STROKE_COLOR_HAS_CODE_ERROR () {
        return '#E61E07';
    }

    static get PLACEHOLDER_SIZE () {
        return 10;
    }

    /**
     * Creates a new Button view.
     */
    constructor () {
        super();

        this.group = new this.paper.Group();
        this.group.remove();
        this.group.applyMatrix = false;

        this._bounds = new paper.Rectangle();
        this._radius = null;
    }

    get bounds () {
        return this._bounds;
    }

    get absoluteBounds () {
        return this.group.bounds;
    }

    get radius () {
        if (this._radius) {
            return this._radius;
        }

        let center = this.absoluteBounds.center;
        let convert = (point) => point.getDistance(center, true);
        let compare = (a, b) => Math.max(a,b);
        let initial = 0;

        this._radius = Math.sqrt(this.reducePointsFromGroup(this.group, initial, convert, compare));

        return this._radius;
    }

    get convexHull () {
        let group = this.group;
        let initial = [];
        let convert = (point) => [[point.x, point.y]];
        let compare = (list1, list2) => list1.concat(list2);

        let points = this.reducePointsFromGroup(group, initial, convert, compare);

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

    // group: the paper group of objects
    // initial: the initial value, should be of return type
    // convert: point -> return type
    // compare: (return type, return type) -> return type
    reducePointsFromGroup (group, initial, convert, compare) {
        let val = initial;
        for (let i = 0; i < group.children.length; i++) {
            let child = group.children[i];
            if (child.className === 'Layer') {
                for (let j = 0; j < child.children.length; j++) {
                    let item = child.children[i];
                    if (item.className === 'Path') {
                        let matrix = item.globalMatrix;
                        for (let s = 0; s < item.segments.length; s++) {
                            val = compare(val, convert(matrix.transform(item.segments[s].point)));
                        }
                    }
                    else if (item.className === 'CompoundPath') {
                        for (let p = 0; p < item.children.length; p++) {
                            let path = item.children[p];
                            let matrix = item.globalMatrix;
                            for (let s = 0; s < path.segments.length; s++) {
                                val = compare(val, convert(matrix.transform(path.segments[s].point)));
                            }
                        }
                    }
                    else if (item.className === 'Group') {
                        val = compare(val, this.reducePointsFromGroup(item));
                    }
                }
            }
        }
        return val;
    }

    render () {
        // Prevent an unselectable object from being rendered
        // due to a clip having no content on the first frame.
        this.model.ensureActiveFrameIsContentful();

        // Render timeline view
        this.model.timeline.view.render();

        // Add some debug info to the paper group
        this.group.data.wickType = 'clip';
        this.group.data.wickUUID = this.model.uuid;

        // Add frame views from timeline
        this.group.removeChildren();
        this.model.timeline.view.frameLayers.forEach(layer => {
            this.group.addChild(layer);
        });

        // Update transformations
        this.group.matrix.set(new paper.Matrix());
        this._bounds = this.group.bounds.clone();
        this._radius = null;

        this.group.pivot = new this.paper.Point(0,0);
        this.group.position.x = this.model.transformation.x;
        this.group.position.y = this.model.transformation.y;
        this.group.scaling.x = this.model.transformation.scaleX;
        this.group.scaling.y = this.model.transformation.scaleY;
        this.group.rotation = this.model.transformation.rotation;
        this.group.opacity = this.model.transformation.opacity;
    }

    generateBorder () {
        var group = new this.paper.Group({insert:false});
        group.locked = true;
        group.data.wickType = 'clip_border_' + this.model.uuid;

        var bounds = this.bounds;

        // Change border colors based on if the Clip caused an error
        var strokeColor = Wick.View.Clip.BORDER_STROKE_COLOR_NORMAL;
        if(this.model.project.error && this.model.project.error.uuid === this.model.uuid) {
            strokeColor = Wick.View.Clip.BORDER_STROKE_COLOR_HAS_CODE_ERROR;
        } else if(this.model.hasContentfulScripts) {
            strokeColor = Wick.View.Clip.BORDER_STROKE_COLOR_HAS_CODE;
        }

        var border = new paper.Path.Rectangle({
            name: 'border',
            from: bounds.topLeft,
            to: bounds.bottomRight,
            strokeWidth: Wick.View.Clip.BORDER_STROKE_WIDTH / this.paper.view.zoom,
            strokeColor: strokeColor,
            insert: false,
        });
        group.addChild(border);

        group.pivot = new this.paper.Point(0,0);
        group.position.x = this.model.transformation.x;
        group.position.y = this.model.transformation.y;
        group.scaling.x = this.model.transformation.scaleX;
        group.scaling.y = this.model.transformation.scaleY;
        group.rotation = this.model.transformation.rotation;

        return group;
    }
}
