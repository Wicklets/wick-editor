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

Wick.ToolSettings = class {
    static get DEFAULT_SETTINGS () {
        return [{
            name: 'fillColor',
            default: new Wick.Color('#000000')
        }, {
            name: 'strokeColor',
            default: new Wick.Color('#000000')
        }, {
            name: 'strokeWidth',
            default: 1,
            min: 0,
            max: 100,
            step: 1,
        }, {
            name: 'brushSize',
            default: 10,
            min: 1,
            max: 100,
            step: 1,
        }, {
            name: 'eraserSize',
            default: 10,
            min: 1,
            max: 100,
            step: 1,
        }, {
            name: 'cornerRadius',
            default: 0,
            min: 0,
            max: 100,
            step: 1,
        }, {
            name: 'brushStabilizerWeight',
            default: 20,
            min: 0,
            max: 100,
            step: 1,
        }, {
            name: 'pressureEnabled',
            default: false,
        }, {
            name: 'relativeBrushSize',
            default: true,
        }, {
            name: 'gapFillAmount',
            default: 1,
            min: 0,
            max: 5,
            step: 1,
        }];
    }

    /**
     * Create a new ToolSettings object.
     */
    constructor () {
        this._settings = {};
        this._onSettingsChangedCallback = () => {};

        Wick.ToolSettings.DEFAULT_SETTINGS.forEach(setting => {
            this.createSetting(setting);
        });
    }

    /**
     *
     */
    createSetting (args) {
        if(!args) console.error('createSetting: args is required');
        if(!args.name) console.error('createSetting: args.name is required');
        if(args.default === undefined) console.error('createSetting: args.default is required');

        this._settings[args.name] = {
            name: args.name,
            value: args.default,
            default: args.default,
            min: args.min,
            max: args.max,
        };
    }

    /**
     * Update a value in the settings.
     * @param {string} name - The name of the setting to update.
     * @param {string|number|Color} value - The value of the setting to change to.
     */
    setSetting (name, value) {
        var setting = this._settings[name];

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
    }

    /**
     * Retrieve a value in the settings.
     * @param {string} name - The name of the setting to retrieve.
     */
    getSetting (name) {
        var setting = this._settings[name];
        if(!setting) console.error("ToolSettings.getSetting: invalid setting: " + name);
        return setting.value;
    }

    /**
     *
     */
    getSettingRestrictions (name) {
        var setting = this._settings[name];
        if(!setting) console.error("ToolSettings.getSettingRestrictions: invalid setting: " + name);
        return {
            min: setting.min,
            max: setting.max,
            step: setting.step,
        };
    }

    /**
     *
     */
    getAllSettings () {
        var allSettings = [];
        for(var name in this._settings) {
            allSettings.push(this._settings[name]);
        }
        return allSettings;
    }

    /**
     *
     */
    onSettingsChanged (callback) {
        this._onSettingsChangedCallback = callback;
    }

    _fireOnSettingsChanged (name, value) {
        this._onSettingsChangedCallback(name, value);
    }
 }
