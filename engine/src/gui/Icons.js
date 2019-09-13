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

Wick.GUIElement.Icons = class {
    static loadIcon (name, src) {
        if(this._icons && this._icons[name]) {
            // Icon is already loaded.
            return;
        }

        // Convert SVG string into base64 dataURI
        var svgContainer = document.createElement('div');
        svgContainer.innerHTML = src;
        var xml = new XMLSerializer().serializeToString(svgContainer.children[0]);
        var svg64 = btoa(xml);
        var b64Start = 'data:image/svg+xml;base64,';
        var image64 = b64Start + svg64;

        if(!this._icons) {
            this._icons = {};
        }

        this._icons[name] = new Image();
        this._icons[name].src = image64;
    }

    static getIcon (name) {
        var icon = this._icons[name];
        if(!icon) {
            console.error('Warning: Missing icon: ' + name);
        }
        return icon;
    }
}
