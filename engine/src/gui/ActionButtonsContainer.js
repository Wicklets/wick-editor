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

Wick.GUIElement.ActionButtonsContainer = class extends Wick.GUIElement {
    constructor (model) {
        super(model);

        this.deleteFrameButton = new Wick.GUIElement.ActionButton(this.model, {
            tooltip: 'Delete',
            icon: 'delete_frame',
            clickFn: () => {
                this.model.project.deleteSelectedObjects();
                this.projectWasModified();
            }
        });

        this.insertBlankFrameButton = new Wick.GUIElement.ActionButton(this.model, {
            tooltip: 'Insert Blank Frame',
            icon: 'cut_frame',
            clickFn: () => {
                this.model.project.insertBlankFrame();
                this.projectWasModified();
            }
        });

        this.cutFrameButton = new Wick.GUIElement.ActionButton(this.model, {
            tooltip: 'Cut Frame',
            icon: 'cut_frame',
            clickFn: () => {
                this.model.project.cutSelectedFrames();
                this.projectWasModified();
            }
        });

        this.addTweenButton = new Wick.GUIElement.ActionButton(this.model, {
            tooltip: 'Add Tween',
            icon: 'add_tween',
            clickFn: () => {
                this.model.project.createTweenOnSelectedFrames();
                this.projectWasModified();
            }
        });
    };

    draw () {
        var ctx = this.ctx;

        // Background
        ctx.fillStyle = Wick.GUIElement.TIMELINE_BACKGROUND_COLOR;
        ctx.beginPath();
        ctx.rect(0, 0, Wick.GUIElement.LAYERS_CONTAINER_WIDTH, Wick.GUIElement.NUMBER_LINE_HEIGHT);
        ctx.fill();

        var frameButtonsAreActive = this.model.project.selection.getSelectedObjects('Frame').length > 0;
        var deleteButtonIsActive = this.model.project.selection.getSelectedObjects('Timeline').length > 0;
        ctx.save();

        ctx.globalAlpha = deleteButtonIsActive ? 1.0 : 0.3;

        ctx.save();
        ctx.translate(80, 0);
            // Delete Frame button
            ctx.save();
            ctx.translate(0, 20);
                this.deleteFrameButton.draw(deleteButtonIsActive);
            ctx.restore();

            ctx.globalAlpha = frameButtonsAreActive ? 1.0 : 0.3;

            // Copy Frame Forward button
            ctx.save();
            ctx.translate(30, 20);
                this.insertBlankFrameButton.draw(frameButtonsAreActive);
            ctx.restore();

            // Cut Frame button
            /*ctx.save();
            ctx.translate(60, 20);
                this.cutFrameButton.draw(frameButtonsAreActive);
            ctx.restore();*/

            // Add Tween button
            ctx.save();
            ctx.translate(60, 20);
                this.addTweenButton.draw(frameButtonsAreActive);
            ctx.restore();
        ctx.restore();

        ctx.restore();
    };
};
