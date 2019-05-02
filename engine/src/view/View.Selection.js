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

Wick.View.Selection = class extends Wick.View {
    constructor () {
        super();

        this.layer = new this.paper.Layer();

        this.paper.project.selection = null;
    }

    updateModelSelection (items) {
        this.model.clear();
        items.forEach(item => {
            var uuid = item.data.wickUUID;
            if(!uuid) {
                console.error('path is missing a wickUUID. the selection selected something it shouldnt have, or the view was not up-to-date.');
                console.error(item);
            }
            var wickObject = Wick.ObjectCache.getObjectByUUID(uuid);
            this.model.select(wickObject);
        })
    }

    applyChanges () {
        this.model.transformation.x = this.paper.project.selection.transformation.x;
        this.model.transformation.y = this.paper.project.selection.transformation.y;
        this.model.transformation.scaleX = this.paper.project.selection.transformation.scaleX;
        this.model.transformation.scaleY = this.paper.project.selection.transformation.scaleY;
        this.model.transformation.rotation = this.paper.project.selection.transformation.rotation;
    }

    _renderSVG () {
        this.layer.clear();

        /*if(this.paper.project.selection) {
            this.paper.project.selection.finish({discardTransformation: true});
        }*/

        this.paper.project.selection = new this.paper.Selection({
            layer: this.layer,
            items: this._selectedPaperItems(),
            x: this.model.transformation.x,
            y: this.model.transformation.y,
            scaleX: this.model.transformation.scaleX,
            scaleY: this.model.transformation.scaleY,
            rotation: this.model.transformation.rotation,
        });
    }

    _selectedPaperItems () {
        var paths = this.model.getSelectedObjects('Path').map(object => {
            return object.view.item;
        });

        var clips = this.model.getSelectedObjects('Clip').map(object => {
            return object.view.group;
        });

        return paths.concat(clips);
    }
}
