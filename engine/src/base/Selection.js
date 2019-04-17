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
 * Class representing a Wick Selection.
 */
Wick.Selection = class extends Wick.Base {
    static get SELECTABLE_OBJECT_TYPES () {
        return ['Path', 'Clip', 'Frame', 'Tween', 'Layer', 'Asset'];
    }

    static get LOCATION_NAMES () {
        return ['Canvas', 'Timeline', 'AssetLibrary'];
    }

    /**
     * Create a Wick Selection.
     */
    constructor () {
        super();

        this._uuids = [];
    }

    static _deserialize (data, object) {
        super._deserialize(data, object);
        object._uuids = [].concat(data.uuids || []);
        return object;
    }

    serialize () {
        var data = super.serialize();
        data.uuids = [].concat(this._uuids);
        return data;
    }

    get classname () {
        return 'Selection';
    }

    /**
     * Add a wick object to the selection.
     * @param {Wick.Frame|Wick.Layer|Wick.Tween|Wick.Asset|Wick.Clip|Wick.Path} object - The object to select.
     */
    select (object) {
        // Do not allow selection of objects not defined to be selectable
        if(!Wick.Selection.SELECTABLE_OBJECT_TYPES.find(type => {
            return object instanceof Wick[type];
        })) {
            console.warn("Tried to select a " + object.classname + " object. This type is not selectable");
            return;
        }

        // Don't do anything if the object is already selected
        if(this.isObjectSelected(object)){
            return;
        }

        // Only allow selection of objects of in the same location
        if(this._locationOf(object) !== this.location) {
            this.clear();
        }

        this._uuids.push(object.uuid);

        // Update the view so that all the selection transform values are updated
        this.project.view.render();
    }

    /**
     * Remove a wick object from the selection.
     * @param {Wick.Frame|Wick.Layer|Wick.Tween|Wick.Asset|Wick.Clip|Wick.Path} object - The object to deselect.
     */
    deselect (object) {
        this._uuids = this._uuids.filter(uuid => {
            return uuid !== object.uuid;
        });

        // Update the view so that all the selection transform values are updated
        this.project.view.render();
    }

    /**
     * Remove all objects from the selection with an optional filter.
     * @param {string} filter - A location or a type (see SELECTABLE_OBJECT_TYPES and LOCATION_NAMES)
     */
    clear (filter) {
        this.project.selection.getSelectedObjects(filter).forEach(object => {
            this.deselect(object)
        });

        // Update the view so that all the selection transform values are updated
        this.project.view.render();
    }

    /**
     * Checks if a given object is selected.
     * @param {Wick.Frame|Wick.Layer|Wick.Tween|Wick.Asset|Wick.Clip|Wick.Path} object - The object to check selection of.
     */
    isObjectSelected (object) {
        return this._uuids.indexOf(object.uuid) !== -1;
    }

    /**
     * Get the first object in the selection if there is a single object in the selection.
     * @return {Wick.Frame|Wick.Layer|Wick.Tween|Wick.Asset|Wick.Clip|Wick.Path} The first object in the selection.
     */
    getSelectedObject () {
        if(this.numObjects === 1) {
            return this.getSelectedObjects()[0];
        } else {
            return null;
        }
    }

    /**
     * Get the objects in the selection with an optional filter.
     * @param {string} filter - A location or a type (see SELECTABLE_OBJECT_TYPES and LOCATION_NAMES)
     * @return {Wick.Frame|Wick.Layer|Wick.Tween|Wick.Asset|Wick.Clip|Wick.Path[]} The selected objects.
     */
    getSelectedObjects (filter) {
        var objects = this._uuids.map(uuid => {
            return this.project.getChildByUUID(uuid);
        });

        if(Wick.Selection.LOCATION_NAMES.indexOf(filter) !== -1) {
            var location = filter;
            if(this.location !== location) {
                return [];
            } else {
                return this.getSelectedObjects();
            }
        } else if (typeof filter === 'string') {
            var classname = filter;
            objects = objects.filter(object => {
                return object instanceof Wick[classname];
            });
        }

        return objects;
    }

    /**
     * The location of the objects in the selection. (see LOCATION_NAMES)
     */
    get location () {
        if(this.numObjects === 0) return null;
        return this._locationOf(this.getSelectedObjects()[0]);
    }

    /**
     * The types of the objects in the selection. (see SELECTABLE_OBJECT_TYPES)
     */
    get types () {
        var types = this.getSelectedObjects().map(object => {
            return object.classname;
        });
        var uniqueTypes = [...new Set(types)];
        return uniqueTypes;
    }

    /**
     * The number of objects in the selection.
     */
    get numObjects () {
        return this._uuids.length;
    }

    /**
     * The X position of the selection. This always uses the top-left corner of the objects.
     */
    get x () {
        return Wick.View.paperScope.selection.x;
    }

    set x (x) {
        Wick.View.paperScope.selection.x = x;
    }

    /**
     * The Y position of the selection. This always uses the top-left corner of the objects.
     */
    get y () {
        return Wick.View.paperScope.selection.y;
    }

    set y (y) {
        Wick.View.paperScope.selection.y = y;
    }

    /**
     * The width of the selected objects.
     */
    get width () {
        return Wick.View.paperScope.selection.width;
    }

    set width (width) {
        Wick.View.paperScope.selection.width = width;
    }

    /**
     * The height of the selected objects.
     */
    get height () {
        return Wick.View.paperScope.selection.height;
    }

    set height (height) {
        Wick.View.paperScope.selection.height = height;
    }

    /**
     * The X scale of the selected objects.
     */
    get scaleX () {
        return Wick.View.paperScope.selection.scaleX;
    }

    set scaleX (scaleX) {
        Wick.View.paperScope.selection.scaleX = scaleX;
    }

    /**
     * The Y scale of the selected objects.
     */
    get scaleY () {
        return Wick.View.paperScope.selection.scaleY;
    }

    set scaleY (scaleY) {
        Wick.View.paperScope.selection.scaleY = scaleY;
    }

    /**
     * The rotation of the selected objects.
     */
    get rotation () {
        return Wick.View.paperScope.selection.rotation;
    }

    set rotation (rotation) {
        Wick.View.paperScope.selection.rotation = rotation;
    }

    /**
     * The fill color of the selected objects.
     * Will return an array of multiple colors if the selected objects have different colors.
     */
    get fillColor () {
        return Wick.View.paperScope.selection.fillColor;
    }

    set fillColor (fillColor) {
        Wick.View.paperScope.selection.fillColor = fillColor;
    }

    /**
     * The stroke width of the selected objects.
     * Will return an array of multiple values if the selected objects have different stroke widths.
     */
    get strokeWidth () {
        return Wick.View.paperScope.selection.strokeWidth;
    }

    set strokeWidth (strokeWidth) {
        Wick.View.paperScope.selection.strokeWidth = strokeWidth;
    }

    /**
     * The stroke color of the selected objects.
     * Will return an array of multiple colors if the selected objects have different colors.
     */
    get strokeColor () {
        return Wick.View.paperScope.selection.strokeColor;
    }

    set strokeColor (strokeColor) {
        Wick.View.paperScope.selection.strokeColor = strokeColor;
    }

    /**
     * The opacity color of the selected objects.
     * Will return an array of multiple values if the selected objects have different stroke widths.
     */
    get opacity () {
        return Wick.View.paperScope.selection.opacity;
    }

    set opacity (opacity) {
        Wick.View.paperScope.selection.opacity = opacity;
    }

    /**
     * The centerpoint of the selected objects.
     */
    get center () {
        return Wick.View.paperScope.selection.center;
    }

    /**
     * The name of the selection.
     * If there are multiple objects selected, null is always returned.
     */
    get name () {
        if(this.numObjects !== 1) {
            return null;
        } else {
            return this.getSelectedObject().identifier;
        }
    }

    set name (name) {
        if(this.numObjects === 1) {
            this.getSelectedObject().identifier = name;
        }
    }

    /**
     * The sound attached to the selected object.
     * If there is no sound, or multiple frames are selected, null is returned.
     */
    get sound () {
        if(this.numObjects !== 1) {
            return null;
        } else {
            return this.getSelectedObject().sound;
        }
    }

    set sound (sound) {
        if(this.numObjects === 1 && this.getSelectedObject() instanceof Wick.Frame) {
            this.getSelectedObject().sound = sound;
        }
    }

    /**
     * The volume of the sound attached to the selected object.
     * If there is no sound, or multiple frames are selected, null is returned.
     */
    get soundVolume () {
        if(this.sound) {
            return this.getSelectedObject().soundVolume;
        } else {
            return null;
        }
    }

    set soundVolume (soundVolume) {
        if(this.sound) {
            this.getSelectedObject().soundVolume = soundVolume;
        }
    }

    /**
     * Flip the selected items horizontally.
     */
    flipHorizontally () {
        Wick.View.paperScope.selection.flipHorizontally();
    }

    /**
     * Flip the selected items vertically.
     */
    flipVertically () {
        Wick.View.paperScope.selection.flipVertically();
    }

    /**
     * Move all selected items to be behind all other objects.
     */
    sendToBack () {
        Wick.View.paperScope.selection.sendToBack();
    }

    /**
     * Move all selected items to be in front of all other objects.
     */
    bringToFront () {
        Wick.View.paperScope.selection.bringToFront();
    }

    /**
     * Move all selected items backwards one place.
     */
    moveBackwards () {
        Wick.View.paperScope.selection.moveBackwards();
    }

    /**
     * Move all selected items forwards one place.
     */
    moveForwards () {
        Wick.View.paperScope.selection.moveForwards();
    }

    _locationOf (object) {
        if(object instanceof Wick.Frame
        || object instanceof Wick.Tween
        || object instanceof Wick.Layer) {
            return 'Timeline';
        } else if (object instanceof Wick.Asset) {
            return 'AssetLibrary';
        } else if (object instanceof Wick.Path
                || object instanceof Wick.Clip) {
            return 'Canvas';
        }
    }
}
