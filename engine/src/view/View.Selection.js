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
    /**
     * Create a new Selection view.
     */
    constructor () {
        super();

        this.layer = new this.paper.Layer();

        this.selection = null;
    }

    /**
     * The current paper.js Selection instance.
     * @type {paper.Selection}
     */
    get selection () {
        return this.paper.project.selection;
    }

    set selection (selection) {
        this.paper.project.selection = selection;
    }

    /**
     * Update the model based on the view.
     */
    applyChanges () {
        if(this._modelAndViewHaveSameItems()) {
            this.model.transformation.x = this.selection.transformation.x;
            this.model.transformation.y = this.selection.transformation.y;
            this.model.transformation.scaleX = this.selection.transformation.scaleX;
            this.model.transformation.scaleY = this.selection.transformation.scaleY;
            this.model.transformation.rotation = this.selection.transformation.rotation;
        } else {
            this.model.clear();
            this._selectedItemsInView().forEach(item => {
                var uuid = item.data.wickUUID;
                if(!uuid) {
                    console.error('path is missing a wickUUID. the selection selected something it shouldnt have, or the view was not up-to-date.');
                    console.error(item);
                }
                var wickObject = Wick.ObjectCache.getObjectByUUID(uuid);
                this.model.select(wickObject);
            });

            this.model.transformation.x = 0;
            this.model.transformation.y = 0;
            this.model.transformation.scaleX = 1;
            this.model.transformation.scaleY = 1;
            this.model.transformation.rotation = 0;
        }
    }

    _renderSVG () {
        this.layer.clear();

        // We need to create a new paper selection. Destroy the current one.
        if(this.selection) {
            this.selection.finish({discardTransformation: this._modelAndViewHaveSameItems()});
        }

        this.selection = new this.paper.Selection({
            layer: this.layer,
            items: this._selectedItemsInModel(),
            x: this.model.transformation.x,
            y: this.model.transformation.y,
            scaleX: this.model.transformation.scaleX,
            scaleY: this.model.transformation.scaleY,
            rotation: this.model.transformation.rotation,
        });
    }

    _selectedItemsInView () {
        return this.selection ? this.selection.items : [];
    }

    _selectedItemsInModel () {
        var paths = this.model.getSelectedObjects('Path').map(object => {
            return object.view.item;
        });

        var clips = this.model.getSelectedObjects('Clip').map(object => {
            return object.view.group;
        });

        return paths.concat(clips);
    }

    _modelAndViewHaveSameItems () {
        var modelIDs = this._selectedItemsInModel().map(item => {
            return item.id;
        });
        var viewIDs = this._selectedItemsInView().map(item => {
            return item.id;
        });

        //https://stackoverflow.com/questions/47666515/comparing-arrays-in-javascript-where-order-doesnt-matter

        if(modelIDs.length !== viewIDs.length) return false;

        modelIDs.sort();
        viewIDs.sort();

        for(let i=0; i<modelIDs.length; i++){
            if(modelIDs[i] !== viewIDs[i]) return false;
        }
        return true;
    }
}
