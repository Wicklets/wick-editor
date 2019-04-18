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
 * The base class for all objects within the Wick Engine.
 */
Wick.Base = class {
    /**
     * Creates a Base object.
     */
    constructor () {
        this._uuid = uuidv4();
        this._identifier = null;

        this._parent = null;
        this._children = [];

        this._project = null;

        this._view = null;
        this.view = this._generateView();

        this._guiElement = null;
        this.guiElement = this._generateGUIElement();

        this._classname = this.classname;
    }

    /**
     * Parses serialized data representing Base Objects which have been serialized using the serialize function of their class.
     * @param  {object} data Serialized data that was returned by a Base Object's serialize function.
     * @return {Wick.Base}   A deserialized Base Object. Can be any Wick Base subclass.
     */
    static deserialize (data) {
        var object = Wick[data.classname]._deserialize(data, new Wick[data.classname]());
        return object;
    }

    static _deserialize (data, object) {
        object._uuid = data.uuid;
        object._identifier = data.identifier;
        return object;
    }

    /**
     * Converts Wick Base object into a generic object contianing raw data and eliminating parent references.
     * @return {object} Plain JavaScript object representing Wick Base.
     */
    serialize () {
        return this._serialize();
    }

    _serialize () {
        var data = {};
        data.classname = this.classname;
        data.identifier = this._identifier;
        data.uuid = this._uuid;
        return data;
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
        this._identifier = this._getUniqueIdentifier(identifier);
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

        var self = this;
        this._children = this._children.map(child => {
            child.parent = self;
            return child;
        });
    }

    /**
     * The child objects of this object.
     * @type {Wick.Base[]}
     */
    get children () {
        return this._children;
    }

    /**
     * The parent clip.
     * @type {Wick.Clip}
     */
    get parentClip () {
        return this._getParentByInstanceOf(Wick.Clip);
    }

    /**
     * The parent timeline.
     * @type {Wick.Timeline}
     */
    get parentTimeline () {
        return this._getParentByInstanceOf(Wick.Timeline);
    }

    /**
     * The parent layer.
     * @type {Wick.Layer}
     */
    get parentLayer () {
        return this._getParentByInstanceOf(Wick.Layer);
    }

    /**
     * The parent frame.
     * @type {Wick.Frame}
     */
    get parentFrame () {
        return this._getParentByInstanceOf(Wick.Frame);
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
        this._children = this._children.map(child => {
            child.project = project;
            return child;
        });
    }

    /**
     * Check if an object is selected or not.
     * @type {boolean}
     */
    get isSelected () {
        return this.project.selection.isObjectSelected(this);
    }

    /**
     * Returns a copy of a Wick Base object.
     * @param {bool} retainUUIDs Will give all cloned Wick Base objects new UUIDs if set to true.
     * @return {Wick.Base} New copied object.
     */
    clone (retainUUIDs) {
        var clone = Wick.Base.deserialize(this.serialize());
        if(!retainUUIDs) {
            clone._regenUUIDs();
        }
        return clone;
    }

    /**
     * Returns a child object within this Wick.Base object which has the associated UUID, if it exists.
     * @param  {string} uuid UUID to search for.
     * @return {Wick.Base|null} Returns a Base object if found, otherwise returns null.
     */
    getChildByUUID (uuid) {
        if(this.uuid === uuid) {
            return this;
        }

        // Recursively search for object with the provided UUID.
        var foundChild = null;
        this._children.forEach(child => {
            var checkChild = child.getChildByUUID(uuid);
            if(checkChild) {
                foundChild = checkChild;
            }
        });
        return foundChild;
    }

    _addChild (child) {
        this._children.push(child);
        child.parent = this;
        child.project = this.project;
    }

    _removeChild (child) {
        child.parent = null;
        child.project = null;
        this._children = this._children.filter(seekChild => {
            return seekChild !== child;
        });
    }

    _getParentByInstanceOf (seekClass) {
        if(!this.parent) return null;

        if(this.parent instanceof seekClass) {
            return this.parent;
        } else {
            if(!this.parent._getParentByInstanceOf) return null;
            return this.parent._getParentByInstanceOf(seekClass);
        }
    }

    _regenUUIDs () {
        this._uuid = uuidv4();
        if(this.paperPath) this.paperPath.data.wickUUID = this._uuid; // hack to fix path cloning for now
        this._children.forEach(child => {
            child._regenUUIDs();
        });
    }

    _generateView () {
        var viewClass = Wick.View[this.classname];
        if(viewClass) {
            return new viewClass();
        } else {
            return null
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
            return child !== this;
        }).map(child => {
            return child.identifier;
        });

        if(otherIdentifiers.indexOf(identifier) === -1) {
            return identifier;
        } else {
            return identifier + ' copy';
        }
    }
}
