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

Wick.ToolSettings = class {
    static get DEFAULT_SETTINGS () {
        return [{
            type: 'color',
            name: 'fillColor',
            default: new Wick.Color('#000000')
        }, {
            type: 'color',
            name: 'strokeColor',
            default: new Wick.Color('#000000')
        }, {
            type: "number",
            name: 'strokeWidth',
            default: 1,
            min: 0,
            max: 100,
            step: 1,
        }, {
            type: "number",
            name: 'brushSize',
            default: 10,
            min: 1,
            max: 100,
            step: 1,
        }, {
            type: "number",
            name: 'eraserSize',
            default: 10,
            min: 1,
            max: 100,
            step: 1,
        }, {
            type: "number",
            name: 'cornerRadius',
            default: 0,
            min: 0,
            max: 100,
            step: 1,
        }, {
            type: "number",
            name: 'brushStabilizerWeight',
            default: 20,
            min: 0,
            max: 100,
            step: 1,
        }, {
            type: "boolean",
            name: 'pressureEnabled',
            default: false,
        }, {
            type: "boolean",
            name: 'relativeBrushSize',
            default: true,
        }, {
            type: "number",
            name: 'gapFillAmount',
            default: 1,
            min: 0,
            max: 5,
            step: 1,
        }, {
        /**
         * The render style of the onion skinned frames.
         * "standard": Objects on onion skinned frames are rendered fully
         * "outlines": Only the strokes of objects on onion skinned frames are rendered
         * "tint": Objects are rendered fully but with a slight tint
         */
            type: "choice",
            name: 'onionSkinStyle',
            default: 'standard',
            options: ['standard', 'outlines', 'tint']
        }, {
            type: "number",
            name: 'onionSkinOutlineWidth',
            default: 2,
            min: 1,
            max: 25,
            step: .1,
        }, {
            type: 'color',
            name: 'backwardOnionSkinTint',
            default: new Wick.Color('rgba(255, 0, 0, .5)'),
        }, {
            type: 'color',
            name: 'forwardOnionSkinTint',
            default: new Wick.Color('rgba(0, 0, 255, .5)'),
        },{
            type: "choice",
            name: 'brushMode',
            default: 'none',
            options: ['none', 'behind', 'inside']
        }];
    }

    /**
     * Create a new ToolSettings object.
     */
    constructor () {
        this._settings = {};
        this._onSettingsChangedCallback = () => {};

        this.resetAllSettings();
        this.loadSettingsFromLocalstorage();
    }

    /**
     * Returns the appropriate key to use to store a tool setting by name.
     * @param {String} settingName name of tool setting.
     * @returns {String} Key to be used.
     */
    getStorageKey (settingName) {
        return "WICK.TOOLSETTINGS."+settingName;
    }

    /**
     * Creates the tool settings at the start of the editor. Will open with previously used settings if they exist.
     */
    createSetting (args) {
        if(!args) console.error('createSetting: args is required');
        if(!args.name) console.error('createSetting: args.name is required');
        if(args.default === undefined) console.error('createSetting: args.default is required');

        let name = args.name;
        let type = args.type;

        // Create a default setting to start.
        this._settings[args.name] = {
            type: args.type,
            name: args.name,
            value: args.default,
            default: args.default,
            min: args.min,
            max: args.max,
            step: args.step,
            options: args.options,
        };
    }

    /**
     * Update a value in the settings.
     * @param {string} name - The name of the setting to update.
     * @param {string|number|Color} value - The value of the setting to change to.
     */
    setSetting (name, value) {
        var setting = this._settings[name];

        if (!setting) return;

        // Check to make sure there's no type mismatch
        if((typeof value) !== (typeof setting.value)) {
            console.warn('Warning: Wick.ToolSettings: Type mismatch while setting ' + name);
            console.warn(value);
            return;
        }

        var min = setting.min;
        if(min !== undefined) {
            value = Math.max(min, value);
        }

        var max = setting.max;
        if(max !== undefined) {
            value = Math.min(max, value);
        }

        setting.value = value;

        this._fireOnSettingsChanged(name, value);

        if (setting.type === 'color') {
            localforage.setItem(this.getStorageKey(name), value.rgba);
        } else {
            localforage.setItem(this.getStorageKey(name), value);
        }
    }

    /**
     * Retrieve a value in the settings.
     * @param {string} name - The name of the setting to retrieve.
     */
    getSetting (name) {
        var setting = this._settings[name];

        if(!setting) {
            console.error("ToolSettings.getSetting: invalid setting: " + name);
            return
        }

        return setting.value;
    }

    /**
     * Returns an object with the setting restrictions for a provided setting.
     * @param {String} name name of tool setting
     * @returns {Object} an object containing the values min, max, step and options where appropriate.
     */
    getSettingRestrictions (name) {
        var setting = this._settings[name];
        if (!setting) console.error("ToolSettings.getSettingRestrictions: invalid setting: " + name);

        return {
            min: setting.min,
            max: setting.max,
            step: setting.step,
            options: setting.options,
        };
    }

    /**
     * Returns an array containing all settings with all information.
     * @returns {Object[]} Array of settings objects.
     */
    getAllSettings () {
        var allSettings = [];
        for(var name in this._settings) {
            allSettings.push(this._settings[name]);
        }
        return allSettings;
    }

    /**
     * Receives a call back that will be provided the name and value of the setting that was changed.
     */
    onSettingsChanged (callback) {
        this._onSettingsChangedCallback = callback;
    }

    /**
     * Reset settings to the deafults.
     */
    resetAllSettings () {
        Wick.ToolSettings.DEFAULT_SETTINGS.forEach(setting => {
            this.createSetting(setting);
        });
    }

    /**
     * Load settings from localstorage if they exist.
     */
    loadSettingsFromLocalstorage () {
        Wick.ToolSettings.DEFAULT_SETTINGS.forEach(setting => {
            // Get stored tool setting if it exists.
            localforage.getItem(this.getStorageKey(name)).then( (value) => {
                if (value) {
                    this._settings[args.name] = {
                        type: args.type,
                        name: args.name,
                        value: type === 'color' ? new window.Wick.Color(value) : value,
                        default: args.default,
                        min: args.min,
                        max: args.max,
                        step: args.step,
                        options: args.options,
                    };
                }
            });
        });
    }

    _fireOnSettingsChanged (name, value) {
        this._onSettingsChangedCallback(name, value);
    }
 }
