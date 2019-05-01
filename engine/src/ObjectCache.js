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
 * Global utility class for storing and retrieving large file data.
 */
WickObjectCache = class {
    /**
     * Create a WickObjectCache.
     */
    constructor () {
        this._objects = {};
    }

    /**
     * Add an object to this project.
     * @param {Wick.Base} object - the object to add
     */
    addObject (object) {
        this._objects[object.uuid] = object;

        /*object.children.forEach(child => {
            this.addObject(child);
        });*/
    }

    /**
     *
     */
    serialize () {
        var objectInfos = {};

        for (var uuid in this._objects) {
            var object = this._objects[uuid];
            objectInfos[uuid] = object.serialize();
        }

        return objectInfos;
    }

    /**
     *
     */
    deserialize (data) {
        for (var uuid in data) {
            var objectData = data[uuid];
            var object = Wick.Base.fromData(objectData);
            this.addObject(object);
        }
    }

    /**
     * Remove all objects from the Object Cache.
     */
    removeAllObjects () {
        this._objects = {};
    }

    /**
     * Remove all objects that are in the project, but are no longer linked to the root object.
     * This is basically a garbage collection function.
     * Only call this when you're ready to finish editing the project because old objects need to be retained somewhere for undo/redo.
     */
    removeUnusedObjects () {
        // TODO
    }

    /**
     * Get an object by its UUID.
     * @returns {Wick.Base}
     */
    getObjectByUUID (uuid) {
        var object = this._objects[uuid];
        if(!object) {
            console.warn("Warning: object with uuid " + uuid + " was not found in the cache.");
            return null;
        } else {
            return object;
        }
    }

    /**
     * All objects in the cache.
     * @returns {Wick.Base[]}
     */
    getAllObjects () {
        var allObjects = [];

        for (var uuid in this._objects) {
            allObjects.push(this._objects[uuid]);
        }

        return allObjects;
    }
}

Wick.ObjectCache = new WickObjectCache();
