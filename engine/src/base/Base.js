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
 * The base class for all objects within the Wick Engine.
 */
Wick.Base = class {
    /**
     * Creates a Base object.
     * @parm {string} identifier - (Optional) The identifier of the object. Defaults to null.
     */
    constructor (args) {
        if(!args) args = {};

        this._uuid = uuidv4();
        this._identifier = args.identifier || null;

        this._childrenUUIDs = [];

        this._parent = null;
        this._project = null;

        this._view = null;
        this.view = this._generateView();

        this._guiElement = null;
        this.guiElement = this._generateGUIElement();

        this._classname = this.classname;

        Wick.ObjectCache.addObject(this);
    }

    /**
     * @param {object} data - Serialized data to use to create a new object.
     */
    static fromData (data) {
        if(!data.classname) {
            console.warn('Wick.Base.fromData(): data was missing, did you mean to deserialize something else?');
        }
        if(!Wick[data.classname]) {
            console.warn('Tried to deserialize an object with no Wick class: ' + data.classname);
        }

        var object = new Wick[data.classname]();
        object.deserialize(data);
        return object;
    }

    /**
     * Parses serialized data representing Base Objects which have been serialized using the serialize function of their class.
     * @param  {object} data Serialized data that was returned by a Base Object's serialize function.
     */
    deserialize (data) {
        this._childrenUUIDs = [];

        this._uuid = data.uuid;
        this._identifier = data.identifier;

        this._childrenUUIDs = Array.from(data.children);
    }

    /**
     * Call this if you deserialized a project from a .wick file before the ObjectCache has anything in it.
     */
    attachParentReferences () {
        var childrenUUIDs = this._childrenUUIDs;
        this._childrenUUIDs = [];
        childrenUUIDs.forEach(uuid => {
            var child = Wick.ObjectCache.getObjectByUUID(uuid);
            this.addChild(child);
        });
    }

    /**
     * Converts this Wick Base object into a generic object contianing raw data (no references).
     * @return {object} Plain JavaScript object representing this Wick Base object.
     */
    serialize (args) {
        if(!args) args = {};

        var data = {};
        data.classname = this.classname;
        data.identifier = this._identifier;
        data.uuid = this._uuid;
        data.children = Array.from(this._childrenUUIDs);
        return data;
    }

    /**
     * Returns a copy of a Wick Base object.
     * @return {Wick.Base} The object resulting from the clone
     */
    clone () {
        var data = this.serialize();
        data.uuid = uuidv4();
        var clone = Wick.Base.fromData(data);

        // clone children
        var origChildren = clone.children;
        clone.children.forEach(child => {
            clone.removeChild(child);
            child.parent = this;
        });
        origChildren.forEach(child => {
            var childClone = child.clone();
            clone.addChild(childClone);
        })

        return clone;
    }

    /**
     * Returns the classname of a Wick Base object.
     * @type {string}
     */
    get classname () {
        return 'Base';
    }

    /**
     * The uuid of a Wick Base object.
     * @type {string}
     */
    get uuid () {
        return this._uuid;
    }

    /**
     * The name of the object that is used to access the object through scripts. Must be a valid JS variable name.
     * @type {string}
     */
    get identifier () {
        return this._identifier;
    }

    set identifier (identifier) {
        if(!isVarName(identifier)) return;
        this._identifier = identifier;
    }

    /**
     *
     */
    get view () {
        return this._view;
    }

    set view (view) {
        if(view) view.model = this;
        this._view = view;
    }

    /**
     *
     */
    get guiElement () {
        return this._guiElement;
    }

    set guiElement (guiElement) {
        if(guiElement) guiElement.model = this;
        this._guiElement = guiElement;
    }

    /**
     * The object representing the parent of the Wick Base object.
     * @type {Wick.Base}
     */
    get parent () {
        return this._parent;
    }

    set parent (parent) {
        this._parent = parent;

        this.children.forEach(child => {
            child.parent = this;
        });
    }

    /**
     * The project which contains the Wick Base object.
     * @type {Wick.Project}
     */
    get project () {
        return this._project;
    }

    set project (project) {
        this._project = project;

        this.children.forEach(child => {
            child.project = project;
        });
    }

    /**
     * The child objects of this object.
     * @type {Wick.Base[]}
     */
    get children () {
        return this._childrenUUIDs.map(uuid => {
            var object = Wick.ObjectCache.getObjectByUUID(uuid);
            if(!object.parent) object.parent = this;
            return object;
        });
    }

    /**
     * The child objects of this object, and the children of those children
     * @returns {Wick.Base[]}
     */
    getChildrenRecursive () {
        var children = this.children;
        children.forEach(child => {
            children = children.concat(child.getChildrenRecursive());
        });
        return children;
    }

    /**
     * Add a child to this object
     * @param {Wick.Base} object - the child to add
     */
    addChild (object) {
        Wick.ObjectCache.addObject(object);
        if(!this._childrenUUIDs.find(uuid => {
            return uuid === object.uuid;
        })) {
            this._childrenUUIDs.push(object.uuid);
        }
        object.parent = this;
        object.project = this.project;
        object.identifier = object._getUniqueIdentifier(object.identifier);
    }

    /**
     * Remove a child from this object
     * @param {Wick.Base} child - the child to remove
     */
    removeChild (child) {
        child.parent = null;
        this._childrenUUIDs = this._childrenUUIDs.filter(uuid => {
            return uuid !== child.uuid;
        });
    }

    /**
     * Find a child by uuid.
     * @param {string} uuid
     */
    getChildByUUID (uuid) {
        return this.children.find(child => {
            return child.uuid === uuid;
        });
    }

    /**
     * The parent clip.
     * @type {Wick.Clip}
     */
    get parentClip () {
        return this.getParentByInstanceOf(Wick.Clip);
    }

    /**
     * The parent timeline.
     * @type {Wick.Timeline}
     */
    get parentTimeline () {
        return this.getParentByInstanceOf(Wick.Timeline);
    }

    /**
     * The parent layer.
     * @type {Wick.Layer}
     */
    get parentLayer () {
        return this.getParentByInstanceOf(Wick.Layer);
    }

    /**
     * The parent frame.
     * @type {Wick.Frame}
     */
    get parentFrame () {
        return this.getParentByInstanceOf(Wick.Frame);
    }

    /**
     * Check if an object is selected or not.
     * @type {boolean}
     */
    get isSelected () {
        if(!this.project) return false;
        return this.project.selection.isObjectSelected(this);
    }

    /**
     * Recursively find a parent that is an instance of  a given class.
     * @param {string} seekClass - the name of the class to search for
     */
    getParentByInstanceOf (seekClass) {
        if(!this.parent) return null;

        if(this.parent instanceof seekClass) {
            return this.parent;
        } else {
            if(!this.parent.getParentByInstanceOf) return null;
            return this.parent.getParentByInstanceOf(seekClass);
        }
    }

    _generateView () {
        var viewClass = Wick.View[this.classname];
        if(viewClass) {
            return new viewClass(this);
        } else {
            return null;
        }
    }

    _generateGUIElement () {
        var guiElementClass = Wick.GUIElement[this.classname];
        if(guiElementClass) {
            return new guiElementClass(this);
        } else {
            return null;
        }
    }

    _getUniqueIdentifier (identifier) {
        if(!this.parent) return identifier;

        var otherIdentifiers = this.parent.children.filter(child => {
            return child !== this && child.identifier;
        }).map(child => {
            return child.identifier;
        });

        if(otherIdentifiers.indexOf(identifier) === -1) {
            return identifier;
        } else {
            return this._getUniqueIdentifier(identifier + '_copy');
        }
    }
}
