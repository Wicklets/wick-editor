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

Wick.GUIElement.Button = class extends Wick.GUIElement {
    constructor (model, iconSrc, actionFn) {
        super(model);

        var svgContainer = document.createElement('div');
        svgContainer.innerHTML = iconSrc;
        var xml = new XMLSerializer().serializeToString(svgContainer.children[0]);
        var svg64 = btoa(xml);
        var b64Start = 'data:image/svg+xml;base64,';
        var image64 = b64Start + svg64;

        this.icon = new Image();
        this.icon.src = image64;

        this.actionFn = actionFn;

    }

    draw () {
        super.draw();
    }

    onMouseDown (e) {
        this.actionFn(e);
    }
}
