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

Wick.GUIElement.PopupMenu = class extends Wick.GUIElement {
    constructor (model, args) {
        super(model, args);

        this.x = args.x;
        this.y = args.y;

        this.extendFramesButton = new Wick.GUIElement.ActionButton(this.model, {
            tooltip: 'Extend Frames',
            icon: 'add_tween',
            clickFn: () => {
                this.project.model.activeTimeline.fillGapsMethod = 'auto_extend';
                this.projectWasModified();
            }
        });

        this.emptyFramesButton = new Wick.GUIElement.ActionButton(this.model, {
            tooltip: 'Add Blank Frames',
            icon: 'add_tween',
            clickFn: () => {
                this.project.model.activeTimeline.fillGapsMethod = 'blank_frames';
                this.projectWasModified();
            }
        });
    };

    draw (isActive) {
        super.draw();

        var ctx = this.ctx;

        // Background
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.rect(0, 0, 100, 100);
        ctx.fill();

        // Buttons
        ctx.save();
        ctx.translate(50, 50);
            this.extendFramesButton.draw(true);
        ctx.restore();

        ctx.save();
        ctx.translate(50, 80);
            this.emptyFramesButton.draw(true);
        ctx.restore();
    };
};
