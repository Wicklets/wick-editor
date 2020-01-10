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
 * Utility class for autosaving projects.
 */
Wick.AutoSave = class {
    /**
     * The key used to store the list of autosaved projects.
     * @type {string}
     */
    static get PROJECTS_LIST_KEY () {
        return 'autosavedProjects';
    }

    /**
     * Saves a given project to localforage.
     * @param {Wick.Project} project
     */
    static save (project) {
        // Get all objects in the project
        var objects = Wick.ObjectCache.getActiveObjects(project);
        console.log(objects.length + ' objects in cache');

        // Write objects with needsAutosave flag to localforage
        var objectsNeedAutosave = objects.filter(object => {
            return object.needsAutosave;
        });
        console.log(objectsNeedAutosave.length + ' objects to write to localforage');

        objectsNeedAutosave.forEach(object => {
            // Serialize and save data in localforage
            var data = object.serialize();
            localforage.setItem(object.uuid, data);
            object.needsAutosave = false;
        });

        // Update projects list
        this.getAutosavedProjects(autosavedProjects => {
            autosavedProjects[project.uuid] = project.serialize();
            this.updateAutosavedProjects(autosavedProjects);
        });
    }

    /**
     * Loads a given project from localforage.
     * @param {string} uuid
     */
    static load (uuid, callback) {
        // Retrieve the most recent autosaved project
        this.getSortedAutosavedProjects(projects => {
            if(projects.length === 0) {
                callback(null);
                return;
            }

            // Load the project
            var projectData = projects[0];

        });

        /*
        for(var uuid in projectData.objects) {
            var data = projectData.objects[uuid];
            var object = Wick.Base.fromData(data);
            Wick.ObjectCache.addObject(object);
        }
        var project = Wick.Base.fromData(projectData.project);
        Wick.ObjectCache.addObject(project);*/
    }

    /**
     * Deletes a project with a given UUID in the autosaves.
     * @param {string} uuid - uuid of project ot delete.
     */
    static delete (uuid) {
        // remove project with uuid fron autosavedProjects list

        // delete all objects in project from localforage
    }

    /**
     * Passes an object containing all currently stored autosaved projects to a callback function.
     * @param {function} callback - function to be passed object containing all autosaved projects.
     */
    static getAutosavedProjects (callback) {
        localforage.getItem(Wick.AutoSave.PROJECTS_LIST_KEY, result => {
            callback(result || {});
        });
    }

    /**
     * Passes a sorted list of all projects currently stored in autosaved by the date they were last modified.
     * @param {function} callback - function to be passed sorted list of projects.
     */
    static getSortedAutosavedProjects (callback) {
        this.getAutosavedProjects(projectsObject => {
            var list = Object.keys(projectsObject).map(key => projectsObject[key]);

            list.sort((a,b) => {
                return b.metadata.lastModified - a.metadata.lastModified;
            });

            callback(list);
        });
    }

    /**
     * Updates the list of autosaved projects.
     * @param {Object} autosavedProjects - the list of projects
     * @param {function} callback - called when saving is finished
     */
    static updateAutosavedProjects (autosavedProjects, callback) {
        localforage.setItem(Wick.AutoSave.PROJECTS_LIST_KEY, autosavedProjects, callback);
    }

    /**
     * Recursively pulls objects from localForage to build a list of all children UUIDS of a project.
     */
    static _getChildrenUUIDsRecursive (object, masterCallback) {
        var uuids = [object.uuid];
        var total = 0;

        console.log(object.children)

        object.children.forEach(childUUID => {
            console.log(childUUID)
            localforage.getItem(childUUID, child => {
              console.log("Inner", child);
                this._getChildrenUUIDsRecursive(child, (subChildUUIDs) => {
                    uuids = uuids.concat(subChildUUIDs);
                    total += 1;
                    if (total === object.children.length) {
                        masterCallback(uuids);
                    }
                });
            });
        });
    }
}
