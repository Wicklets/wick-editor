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
        /*
        var lastButton = null;
        this.model.focus.lineage.reverse().forEach(clip => {
            var button = new Wick.GUIElement.BreadcrumbsButton(clip);
            button.build();
            this.item.addChild(button.item);

            if(lastButton) {
                button.item.position.x = lastButton.item.bounds.right;
            };
            lastButton = button;
        });
        */
    };
};

/*

Wick.GUIElement.BreadcrumbsButton = class extends Wick.GUIElement.Clickable {
    constructor (model) {
        super(model);

    };

    get cursor () {
        if (this.model === this.model.project.focus) {
            return 'default';
        } else {
            return 'pointer';
        }
    }

    build () {
        super.build();

        var buttonBodyColor = 'red';

        if(this.model === this.model.project.focus) {
           buttonBodyColor = Wick.GUIElement.BREADCRUMBS_ACTIVE_BUTTON_FILL_COLOR;
        } else if(this.isBeingClicked) {
            buttonBodyColor = Wick.GUIElement.BREADCRUMBS_INACTIVE_BUTTON_FILL_COLOR;
        } else if (this.isHoveredOver) {
            buttonBodyColor = Wick.GUIElement.BREADCRUMBS_HOVER_BUTTON_FILL_COLOR;
        } else {
            buttonBodyColor = Wick.GUIElement.BREADCRUMBS_INACTIVE_BUTTON_FILL_COLOR;
        }

        var label = new paper.PointText({
            point: [Wick.GUIElement.BREADCRUMBS_PADDING, Wick.GUIElement.BREADCRUMBS_HEIGHT/2 + Wick.GUIElement.BREADCRUMBS_PADDING],
            fillColor: '#BBBBBB',
            fontFamily: 'Nunito Sans',
            fontStyle: 'normal',
            fontSize: '14px',
            content: this.model.identifier || 'Clip',
        });

        this.item.addChild(label);

        // One padding is added by shifting the text right...
        var buttonWidth = label.bounds.width + Wick.GUIElement.BREADCRUMBS_PADDING*2;
        var buttonBody = new paper.Path.Rectangle({
            fillColor: buttonBodyColor,
            from: new paper.Point(0, 0),
            to: new paper.Point(buttonWidth, Wick.GUIElement.BREADCRUMBS_HEIGHT),
            radius: Wick.GUIElement.FRAME_BORDER_RADIUS,
        });

        var buttonBodyBottomSharp = new paper.Path.Rectangle({
            fillColor: buttonBodyColor,
            from: new paper.Point(0, Wick.GUIElement.BREADCRUMBS_HEIGHT - Wick.GUIElement.BREADCRUMBS_PADDING),
            to: new paper.Point(buttonWidth, Wick.GUIElement.BREADCRUMBS_HEIGHT),
        });

        // Add shadow and mask for bottom radius.
        var buttonBodyDropShadow = new paper.Path.Rectangle({
            fillColor: Wick.GUIElement.BREADCRUMBS_SHADOW_COLOR,
            from: new paper.Point(Wick.GUIElement.BREADCRUMBS_DROP_SHADOW_DEPTH, 0),
            to: new paper.Point(buttonWidth + Wick.GUIElement.BREADCRUMBS_DROP_SHADOW_DEPTH, Wick.GUIElement.BREADCRUMBS_HEIGHT),
            radius: Wick.GUIElement.FRAME_BORDER_RADIUS,
        });

        var buttonBodyDropShadowBottomSharp = new paper.Path.Rectangle({
            fillColor: Wick.GUIElement.BREADCRUMBS_SHADOW_COLOR,
            from: new paper.Point(Wick.GUIElement.BREADCRUMBS_DROP_SHADOW_DEPTH, Wick.GUIElement.BREADCRUMBS_HEIGHT - Wick.GUIElement.BREADCRUMBS_PADDING),
            to: new paper.Point(buttonWidth + Wick.GUIElement.BREADCRUMBS_DROP_SHADOW_DEPTH, Wick.GUIElement.BREADCRUMBS_HEIGHT),
        });


        this.item.addChild(buttonBody);
        this.item.addChild(buttonBodyBottomSharp);
        this.item.addChild(buttonBodyDropShadow);
        this.item.addChild(buttonBodyDropShadowBottomSharp);
        buttonBody.sendToBack();
        buttonBodyDropShadow.sendToBack();
        buttonBodyDropShadowBottomSharp.sendToBack();

        // Add the active highlight to the tab, if necessary.
        if (this.model === this.model.project.focus) {
            var highlight = new paper.Path.Rectangle({
                fillColor: Wick.GUIElement.BREADCRUMBS_ACTIVE_BORDER_COLOR,
                from: new paper.Point(0, Wick.GUIElement.BREADCRUMBS_HEIGHT - Wick.GUIElement.BREADCRUMBS_HIGHLIGHT_HEIGHT),
                to: new paper.Point(buttonWidth, Wick.GUIElement.BREADCRUMBS_HEIGHT),
            });
            this.item.addChild(highlight);
        }

    };
};


*/
