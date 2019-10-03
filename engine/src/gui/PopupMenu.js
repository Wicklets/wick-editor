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

        this.width = 80;
        this.height = 40;

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

        var method = this.project.model.activeTimeline.fillGapsMethod;

        ctx.save();
        ctx.translate(this.x, this.y - this.height);
            // Background
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.roundRect(0, 0, 80, 40, 3);
            ctx.fill();

            // Buttons
            ctx.save();
            ctx.globalAlpha = method !== 'auto_extend' ? 1.0 : 0.3;
            ctx.translate(20, 20);
                this.extendFramesButton.draw(method !== 'auto_extend');
            ctx.restore();

            ctx.save();
            ctx.globalAlpha = method !== 'blank_frames' ? 1.0 : 0.3;
            ctx.translate(57, 20);
                this.emptyFramesButton.draw(method !== 'blank_frames');
            ctx.restore();
        ctx.restore();
    };
};
