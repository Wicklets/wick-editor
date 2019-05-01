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
    constructor (args) {
        if(!args) args = {};
        super(args);

        this._selectedObjectsUUIDs = args.selectedObjects || [];
    }

    deserialize (data) {
        super.deserialize(data);
        this._selectedObjectsUUIDs = data.selectedObjects || [];
    }

    serialize (args) {
        var data = super.serialize(args);
        data.selectedObjects = Array.from(this._selectedObjectsUUIDs);
        return data;
    }

    get classname () {
        return 'Selection';
    }

    /**
     * Add a wick object to the selection.
     * @param {Wick.Base} object - The object to select.
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

        this._selectedObjectsUUIDs.push(object.uuid);
    }

    /**
     * Remove a wick object from the selection.
     * @param {Wick.Base} object - The object to deselect.
     */
    deselect (object) {
        this._selectedObjectsUUIDs = this._selectedObjectsUUIDs.filter(uuid => {
            return uuid !== object.uuid;
        });
    }

    /**
     * Remove all objects from the selection with an optional filter.
     * @param {string} filter - A location or a type (see SELECTABLE_OBJECT_TYPES and LOCATION_NAMES)
     */
    clear (filter) {
        this.project.selection.getSelectedObjects(filter).forEach(object => {
            this.deselect(object);
        });
    }

    /**
     * Checks if a given object is selected.
     * @param {Wick.Base} object - The object to check selection of.
     */
    isObjectSelected (object) {
        return this._selectedObjectsUUIDs.indexOf(object.uuid) !== -1;
    }

    /**
     * Get the first object in the selection if there is a single object in the selection.
     * @return {Wick.Base} The first object in the selection.
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
     * @return {Wick.Base[]} The selected objects.
     */
    getSelectedObjects (filter) {
        var objects = this._selectedObjectsUUIDs.map(uuid => {
            return Wick.ObjectCache.getObjectByUUID(uuid);
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
     * Get the UUIDs of the objects in the selection with an optional filter.
     * @param {string} filter - A location or a type (see SELECTABLE_OBJECT_TYPES and LOCATION_NAMES)
     * @return {string[]} The UUIDs of the selected objects.
     */
    getSelectedObjectUUIDs (filter) {
        return this.getSelectedObjects(filter).map(object => {
            return object.uuid;
        });
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
        return this._selectedObjectsUUIDs.length;
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
