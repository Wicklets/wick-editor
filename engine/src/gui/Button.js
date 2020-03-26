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

Wick.GUIElement.Button = class extends Wick.GUIElement {
    /**
     * Create a new button.
     * @param {Wick.Base} model - See Wick.GUIElement constructor
     * @param {function} clickFn - The function to call when the button is clicked
     * @param {string} tooltip - (Optional) The title of the tooltip
     */
    constructor (model, args) {
        super(model);

        if(!args) args = {};
        this._clickFn = args.clickFn;
        this._tooltip = args.tooltip;

        this.tooltip = new Wick.GUIElement.Tooltip(this.model, this._tooltip);

        this.cursor = 'pointer';
    }

    draw () {
        super.draw();
    }

    onMouseDown (e) {
        this._clickFn(e);
    }
}
