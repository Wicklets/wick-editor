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
     * Add an object to the cache.
     * @param {Wick.Base} object - the object to add
     */
    addObject (object) {
        this._objects[object.uuid] = object;

        /*object.children.forEach(child => {
            this.addObject(child);
        });*/
    }

    /**
     * Remove an object from the cache.
     * @param {Wick.Base} object - the object to remove from the cache
     */
    removeObject (object) {
        delete this._objects[object.uuid];
    }

    /**
     * Remove all objects from the Object Cache.
     */
    removeAllObjects () {
        this._objects = {};
    }

    /**
     * Get an object by its UUID.
     * @returns {Wick.Base}
     */
    getObjectByUUID (uuid) {
        if(!uuid) {
            console.error('ObjectCache: getObjectByUUID: uuid is required.');
        }

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

    /**
     * Remove all objects that are in the project, but are no longer linked to the root object.
     * This is basically a garbage collection function.
     * Only call this when you're ready to finish editing the project because old objects need to be retained somewhere for undo/redo.
     * @param {Wick.Project} project - the project to use to determine which objects have no references
     */
    removeUnusedObjects (project) {
        this.getActiveObjects(project).forEach(object => {
            this.removeObject(object);
        });
    }

    /**
     * Get all objects that are referenced in the given project.
     * @param {Wick.Project} project - the project to check if children are active in.
     * @returns {Wick.Base[]} the active objects.
     */
    getActiveObjects (project) {
        var children = project.getChildrenRecursive();
        var uuids = children.map(child => {
            return child.uuid;
        });

        return this.getAllObjects().filter(object => {
            return uuids.indexOf(object.uuid) !== -1;
        });
    }
}

Wick.ObjectCache = new WickObjectCache();
