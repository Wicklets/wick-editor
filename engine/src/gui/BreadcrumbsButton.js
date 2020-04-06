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

Wick.GUIElement.BreadcrumbsButton = class extends Wick.GUIElement.Button {
    constructor (model) {
        super(model, {
            clickFn: () => {
                this.model.project.focus = model;
                this.projectWasModified();
            }
        });
    };

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Button label settings
        ctx.font = "14px Nunito Sans";
        var textContent = this.model.identifier || 'Clip';
        var textWidth = ctx.measureText(textContent).width;
        var textX = Wick.GUIElement.BREADCRUMBS_PADDING;
        var textY = Wick.GUIElement.BREADCRUMBS_HEIGHT/2 + Wick.GUIElement.BREADCRUMBS_PADDING;

        // Fill color based on mouse interactions
        var buttonBodyColor = 'red';
        if(this.model === this.model.project.focus) {
           buttonBodyColor = Wick.GUIElement.BREADCRUMBS_ACTIVE_BUTTON_FILL_COLOR;
        } else if(this.mouseState === 'down') {
            buttonBodyColor = Wick.GUIElement.BREADCRUMBS_INACTIVE_BUTTON_FILL_COLOR;
        } else if (this.mouseState === 'over') {
            buttonBodyColor = Wick.GUIElement.BREADCRUMBS_HOVER_BUTTON_FILL_COLOR;
        } else {
            buttonBodyColor = Wick.GUIElement.BREADCRUMBS_INACTIVE_BUTTON_FILL_COLOR;
        }

        var buttonWidth = textWidth + Wick.GUIElement.BREADCRUMBS_PADDING*2;
        this.buttonWidth = buttonWidth; // Save how large the button is to use in other places...

        // Button body
        ctx.fillStyle = buttonBodyColor;
        ctx.beginPath();
        ctx.roundRect(0, 0, buttonWidth, Wick.GUIElement.BREADCRUMBS_HEIGHT, Wick.GUIElement.FRAME_BORDER_RADIUS);
        ctx.fill();

        ctx.beginPath();
        ctx.rect(0, Wick.GUIElement.BREADCRUMBS_HEIGHT/2, buttonWidth, Wick.GUIElement.BREADCRUMBS_HEIGHT/2);
        ctx.fill();

        // Add the active highlight to the tab if necessary.
        if (this.model === this.model.project.focus) {
            ctx.fillStyle = Wick.GUIElement.BREADCRUMBS_ACTIVE_BORDER_COLOR;
            ctx.beginPath();
            ctx.rect(0, Wick.GUIElement.BREADCRUMBS_HEIGHT - Wick.GUIElement.BREADCRUMBS_HIGHLIGHT_HEIGHT, buttonWidth, Wick.GUIElement.BREADCRUMBS_HIGHLIGHT_HEIGHT);
            ctx.fill();
        }

        // Button label text
        ctx.fillStyle = '#BBBBBB';
        ctx.fillText(textContent, textX, textY);
    }

    get bounds () {
        return {
            x: 0,
            y: 0,
            width: this.buttonWidth,
            height: Wick.GUIElement.BREADCRUMBS_HEIGHT,
        }
    }
};
