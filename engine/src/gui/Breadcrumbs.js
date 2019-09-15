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

Wick.GUIElement.Breadcrumbs = class extends Wick.GUIElement {
    /**
     * Create a new GUIElement
     */
    constructor (model) {
        super(model);

        this._buttons = {};
    };

    /**
     * Draw this GUIElement
     */
    draw () {
        var ctx = this.ctx;

        // Background rectangle to cover rest of the GUI
        ctx.fillStyle = Wick.GUIElement.BREADCRUMBS_BG_COLOR;
        ctx.beginPath();
        ctx.rect(0, 0, this.canvas.width, Wick.GUIElement.BREADCRUMBS_HEIGHT);
        ctx.fill();

        // Generate buttons for each Clip in the lineage
        var totalWidth = 0;
        this.model.project.focus.lineage.reverse().forEach(clip => {
            var button = this._buttons[clip.uuid];

            if(!button) {
                button = new Wick.GUIElement.BreadcrumbsButton(clip);
                this._buttons[clip.uuid] = button;
            }

            ctx.save();
            ctx.translate(totalWidth, 0);
                button.draw();
            ctx.restore();
            totalWidth += button.buttonWidth;
        });
    };
};
