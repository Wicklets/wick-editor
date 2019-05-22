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

        this._view = null;
        this.view = this._generateView();

        this._guiElement = null;
        this.guiElement = this._generateGUIElement();

        this._classname = this.classname;
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
        this._uuid = data.uuid;
        this._identifier = data.identifier;
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
        return data;
    }

    /**
     * Returns a copy of a Wick Base object.
     * @return {Wick.Base} The object resulting from the copy
     */
    copy () {
        var data = this.serialize();
        data.uuid = uuidv4();
        var copy = Wick.Base.fromData(data);

        return copy;
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
}
