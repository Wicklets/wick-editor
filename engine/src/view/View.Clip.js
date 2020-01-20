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

Wick.View.Clip = class extends Wick.View {
    static get BORDER_STROKE_WIDTH () {
        return 2;
    }

    static get BORDER_STROKE_COLOR_NORMAL () {
        return '#00ff00';
    }

    static get BORDER_STROKE_COLOR_ERROR () {
        return '#ff0000';
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
    }

    get bounds () {
        return this._bounds;
    }

    render () {
        // Render timeline view
        this.model.timeline.view.render();

        // Add some debug info to the paper group
        this.group.data.wickType = 'clip';
        this.group.data.wickUUID = this.model.uuid;

        // Add frame views from timeline
        this.group.removeChildren();
        this.model.timeline.view.activeFrameLayers.forEach(layer => {
            this.group.addChild(layer);
        });
        this.model.timeline.view.onionSkinnedFramesLayers.forEach(layer => {
            this.group.addChild(layer);
        });

        // Update transformations
        this.group.matrix.set(new paper.Matrix());
        this._bounds = this.group.bounds.clone();

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
            strokeColor = Wick.View.Clip.BORDER_STROKE_COLOR_ERROR;
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
        group.opacity = this.model.transformation.opacity;

        return group;
    }
}
