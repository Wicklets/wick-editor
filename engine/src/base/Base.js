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

/**
 * The base class for all objects within the Wick Engine.
 */
Wick.Base = class {
    /**
     * Creates a Base object.
     * @parm {string} identifier - (Optional) The identifier of the object. Defaults to null.
     * @parm {string} name - (Optional) The name of the object. Defaults to null.
     */
    constructor(args) {
        /* One instance of each Wick.Base class is created so we can access
         * a list of all possible properties of each class. This is used
         * to clean up custom variables after projects are stopped. */
        if (!Wick._originals[this.classname]) {
            Wick._originals[this.classname] = {};
            Wick._originals[this.classname] = new Wick[this.classname];
        }

        if (!args) args = {};

        this._uuid = args.uuid || uuidv4();
        this._identifier = args.identifier || null;
        this._name = args.name || null;

        this._view = null;
        this.view = this._generateView();

        this._guiElement = null;
        this.guiElement = this._generateGUIElement();

        this._classname = this.classname;

        this._children = [];
        this._childrenData = null;
        this._parent = null;
        this._project = this.classname === 'Project' ? this : args.project ? args.project : null;

        this.needsAutosave = true;
        this._cachedSerializeData = null;

        Wick.ObjectCache.addObject(this);
    }

    /**
     * @param {object} data - Serialized data to use to create a new object.
     */
    static fromData(data) {
        if (!data.classname) {
            console.warn('Wick.Base.fromData(): data was missing, did you mean to deserialize something else?');
        }
        if (!Wick[data.classname]) {
            console.warn('Tried to deserialize an object with no Wick class: ' + data.classname);
        }

        var object = new Wick[data.classname]({ uuid: data.uuid });
        object.deserialize(data);

        if (data.classname === 'Project') {
            object.initialize();
        }

        return object;
    }

    /**
     * Converts this Wick Base object into a plain javascript object contianing raw data (no references).
     * @return {object} Plain JavaScript object representing this Wick Base object.
     */
    serialize(args) {
        // TEMPORARY: Force the cache to never be accessed.
        // This is because the cache was causing issues in the tests, and the
        // performance boost that came with the cache was not signifigant enough
        // to be worth fixing the bugs over...
        this.needsAutosave = true;

        if (this.needsAutosave || !this._cachedSerializeData) {
            // If the cache is outdated or does not exist, reserialize and cache.
            var data = this._serialize(args);
            this._cacheSerializeData(data);
            return data;
        } else {
            // Otherwise, just read from the cache
            return this._cachedSerializeData;
        }
    }

    /**
     * Parses serialized data representing Base Objects which have been serialized using the serialize function of their class.
     * @param {object} data Serialized data that was returned by a Base Object's serialize function.
     */
    deserialize(data) {
        this._deserialize(data);
        this._cacheSerializeData(data);
    }

    /* The internal serialize method that actually creates the data. Every class that inherits from Base must have one of these. */
    _serialize(args) {
        var data = {};

        data.classname = this.classname;
        data.identifier = this._identifier;
        data.name = this._name;
        data.uuid = this._uuid;
        data.children = this.getChildren().map(child => { return child.uuid });

        return data;
    }

    /* The internal deserialize method that actually reads the data. Every class that inherits from Base must have one of these. */
    _deserialize(data) {
        this._uuid = data.uuid;
        this._identifier = data.identifier;
        this._name = data.name;
        this._children = [];
        this._childrenData = data.children;

        // Clear any custom attributes set by scripts
        var compareObj = Wick._originals[this.classname];
        for (var name in this) {
            if (compareObj[name] === undefined) {
                delete this[name];
            }
        }
    }

    _cacheSerializeData(data) {
        this._cachedSerializeData = data;
        this.needsAutosave = false;
    }

    /**
     * Returns a copy of a Wick Base object.
     * @return {Wick.Base} The object resulting from the copy
     */
    copy() {
        var data = this.serialize();
        data.uuid = uuidv4();
        var copy = Wick.Base.fromData(data);
        copy._childrenData = null;

        // Copy children
        this.getChildren().forEach(child => {
            copy.addChild(child.copy());
        });

        return copy;
    }

    /**
     * Returns an object containing serialied data of this object, as well as all of its children.
     * Use this to copy entire Wick.Base objects between projects, and to export individual Clips as files.
     * @returns {object} The exported data.
     */
    export () {
        var copy = this.copy();
        copy._project = this.project;

        // the main object
        var object = copy.serialize();

        // children
        var children = copy.getChildrenRecursive().map(child => {
            return child.serialize();
        });

        // assets
        var assets = [];
        copy.getChildrenRecursive().concat(copy).forEach(child => {
            child._project = copy._project;
            child.getLinkedAssets().forEach(asset => {
                assets.push(asset.serialize({ includeOriginalSource: true }));
            });
        });

        return {
            object: object,
            children: children,
            assets: assets,
        };
    }

    /**
     * Import data created using Wick.Base.export().
     * @param {object} exportData - an object created from Wick.Base.export().
     */
    static
    import (exportData, project) {
        if (!exportData) console.error('Wick.Base.import(): exportData is required');
        if (!exportData.object) console.error('Wick.Base.import(): exportData is missing data');
        if (!exportData.children) console.error('Wick.Base.import(): exportData is missing data');

        var object = Wick.Base.fromData(exportData.object);

        // Import children as well
        exportData.children.forEach(childData => {
            // Only need to call deserialize here, we just want the object to get added to ObjectCache
            var child = Wick.Base.fromData(childData);
        });

        // Also import linked assets
        exportData.assets.forEach(assetData => {
            // Don't import assets if they exist in the project already
            // (Assets only get reimported when objects are pasted between projects)
            if (project.getAssetByUUID(assetData.uuid)) {
                return;
            }

            var asset = Wick.Base.fromData(assetData);
            project.addAsset(asset);
        });

        return object;
    }

    /**
     * Marks the object as possibly changed, so that next time autosave happens, this object is written to the save.
     * @type {boolean}
     */
    set needsAutosave(needsAutosave) {
        if (needsAutosave) {
            Wick.ObjectCache.markObjectToBeAutosaved(this);
        } else {
            Wick.ObjectCache.clearObjectToBeAutosaved(this);
        }
    }

    get needsAutosave() {
        return Wick.ObjectCache.objectNeedsAutosave(this);
    }

    /**
     * Returns the classname of a Wick Base object.
     * @type {string}
     */
    get classname() {
        return 'Base';
    }

    /**
     * The uuid of a Wick Base object.
     * @type {string}
     */
    get uuid() {
        return this._uuid;
    }

    set uuid(uuid) {
        let oldUUID = this._uuid;
        // Please try to avoid using this unless you absolutely have to ;_;
        this._uuid = uuid;

        Wick.ObjectCache.removeObjectByUUID(oldUUID);
        Wick.ObjectCache.addObject(this);
    }

    /**
     * The name of the object that is used to access the object through scripts. Must be a valid JS variable name.
     * @type {string}
     */
    get identifier() {
        return this._identifier;
    }

    set identifier(identifier) {
        // Treat empty string identifier as null
        if (identifier === '' || identifier === null) {
            this._identifier = null;
            return;
        }

        // Make sure the identifier doesn't squash any attributes of the window
        if (this._identifierNameExistsInWindowContext(identifier)) return;

        // Make sure the identifier will not be squashed by Wick API functions
        if (this._identiferNameIsPartOfWickAPI(identifier)) return;

        // Make sure the identifier is a valid js variable name
        if(!isVarName(identifier)) {
            this.project && this.project.errorOccured('Identifier must be a valid variable name.');
            return;
        }

        // Make sure the identifier is not a reserved word in js
        if (reserved.check(identifier)) return;

        // Ensure no objects with duplicate identifiers can exist
        this._identifier = this._getUniqueIdentifier(identifier);
    }

    /**
     * The name of the object.
     * @type {string}
     */
    get name() {
        return this._name;
    }

    set name(name) {
        if (typeof name !== 'string') return;
        if (name === '') this._name = null;
        this._name = name;
    }

    /**
     * The Wick.View object that is used for rendering this object on the canvas.
     */
    get view() {
        return this._view;
    }

    set view(view) {
        if (view) view.model = this;
        this._view = view;
    }

    /**
     * The object that is used for rendering this object in the timeline GUI.
     */
    get guiElement() {
        return this._guiElement;
    }

    set guiElement(guiElement) {
        if (guiElement) guiElement.model = this;
        this._guiElement = guiElement;
    }

    /**
     * Returns a single child of this object with a given classname.
     * @param {string} classname - the classname to use
     */
    getChild(classname) {
        return this.getChildren(classname)[0];
    }

    /**
     * Gets all children with a given classname(s).
     * @param {Array|string} classname - (optional) A string, or list of strings, of classnames.
     */
    getChildren(classname) {
        // Lazily generate children list from serialized data
        if (this._childrenData) {
            this._childrenData.forEach(uuid => {
                this.addChild(Wick.ObjectCache.getObjectByUUID(uuid));
            });
            this._childrenData = null;
        }

        if (classname instanceof Array) {
            var children = [];

            if (this._children !== undefined) {
                this._children.forEach(child => {
                    if (classname.indexOf(child.classname) !== -1) {
                        children.push(child)
                    }
                })
            }
            return children;
        } else if (classname === undefined) {
            // Retrieve all children if no classname was given
            return Array.from(this._children);
        } else {
            // Retrieve children by classname
            var children = [];
            this._children.forEach(child => {
                if (child.classname === classname) {
                    children.push(child);
                }
            });
            return children || [];
        }
    }

    /**
     * Get an array of all children of this object, and the children of those children, recursively.
     * @type {Wick.Base[]}
     */
    getChildrenRecursive() {
        var children = this.getChildren();
        this.getChildren().forEach(child => {
            children = children.concat(child.getChildrenRecursive());
        });
        return children;
    }

    /**
     * The parent of this object.
     * @type {Wick.Base}
     */
    get parent() {
        return this._parent;
    }

    /**
     * The parent Clip of this object.
     * @type {Wick.Clip}
     */
    get parentClip() {
        return this._getParentByClassName('Clip');
    }

    /**
     * The parent Layer of this object.
     * @type {Wick.Layer}
     */
    get parentLayer() {
        return this._getParentByClassName('Layer');
    }

    /**
     * The parent Frame of this object.
     * @type {Wick.Frame}
     */
    get parentFrame() {
        return this._getParentByClassName('Frame');
    }

    /**
     * The parent Timeline of this object.
     * @type {Wick.Timeline}
     */
    get parentTimeline() {
        return this._getParentByClassName('Timeline');
    }

    /**
     * The project that this object belongs to. Can be null if the object is not in a project.
     * @type {Wick.Project}
     */
    get project() {
        if (this._project) {
            return this._project;
        } else if (this.parent) {
            return this.parent.project
        } else {
            return null;
        }
    }

    /**
     * Check if an object is selected or not.
     * @type {boolean}
     */
    get isSelected() {
        if (!this.project) return false;
        return this.project.selection.isObjectSelected(this);
    }

    /**
     * Add a child to this object.
     * @param {Wick.Base} child - the child to add.
     */
    addChild(child) {
        var classname = child.classname;

        if (!this._children) {
            this._children = [];
        }

        child._parent = this;
        child._setProject(this.project);



        this._children.push(child);
    }

    /**
     * Insert a child into this at specified index.
     * 
     * The insertion is performed as if there is a dummy object placed
     * at index, then the child is moved one index past the dummy,
     * then the dummy is deleted. Therefore if the child starts out
     * inside this._children below index, then insertChild returns true and
     * this._children.indexOf(child) == index - 1. Otherwise, returns false and
     * this._children.indexOf(child) == index.
     * 
     * @param {Wick.Base} child - the child to add.
     * @param {number} index - where to add the child
     * @returns {boolean} - true if an item before index was moved
     */
    insertChild(child, index) {
        var classname = child.classname;

        if (child._parent === this) {
            let result = 0;
            let old_index = this._children.indexOf(child);
            if (old_index < index) {
                index --;
                result = 1;
            }
            this._children.splice(index, 0, this._children.splice(old_index, 1)[0]);
            return result;
        }

        if (child._parent) {
            child._parent.removeChild(child);
        }

        if (!this._children) {
            this._children = [];
        }

        child._parent = this;
        child._setProject(this.project);

        this._children.splice(index, 0, child);
        return 0;
    }

    /**
     * Remove a child from this object.
     * @param {Wick.Base} child - the child to remove.
     */
    removeChild(child) {
        var classname = child.classname;

        if (!this._children) {
            return;
        }

        child._parent = null;
        child._project = null;

        this._children = this._children.filter(seekChild => {
            return seekChild !== child;
        });
    }

    /**
     * Assets attached to this object.
     * @returns {Wick.Base[]}
     */
    getLinkedAssets () {
        // Implemented by Wick.Frame and Wick.Clip
        return [];
    }

    _generateView() {
        var viewClass = Wick.View[this.classname];
        if (viewClass) {
            return new viewClass(this);
        } else {
            return null;
        }
    }

    _generateGUIElement() {
        var guiElementClass = Wick.GUIElement[this.classname];
        if (guiElementClass && guiElementClass !== Wick.Button) {
            return new guiElementClass(this);
        } else {
            return null;
        }
    }

    _getParentByClassName(classname) {
        if (!this.parent) return null;

        if (this.parent instanceof Wick[classname]) {
            return this.parent;
        } else {
            if (!this.parent._getParentByClassName) return null;
            return this.parent._getParentByClassName(classname);
        }
    }

    _setProject(project) {
        this._project = project;
        this.getChildren().forEach(child => {
            if (child instanceof Wick.Base) {
                child._setProject(project);
            }
        });
    }

    _getUniqueIdentifier(identifier) {
        if (!this.parent) return identifier;

        var otherIdentifiers = this.parent.getChildren(['Clip', 'Frame', 'Button']).filter(child => {
            return child !== this && child.identifier;
        }).map(child => {
            return child.identifier;
        });

        if (otherIdentifiers.indexOf(identifier) === -1) {
            return identifier;
        } else {
            return this._getUniqueIdentifier(identifier + '_copy');
        }
    }

    _identifierNameExistsInWindowContext(identifier) {
        if (window[identifier]) {
            return true;
        } else {
            return false;
        }
    }

    _identiferNameIsPartOfWickAPI(identifier) {
        var globalAPI = new GlobalAPI(this);
        if (globalAPI[identifier]) {
            return true;
        } else {
            return false;
        }
    }
}
