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

Wick.GUIElement.BreadcrumbsButton = class extends Wick.GUIElement.Clickable {
    constructor (model) {
        super(model);
    };

    build () {
        super.build();

        var label = new paper.PointText({
            point: [0, Wick.GUIElement.BREADCRUMBS_HEIGHT/2],
            fillColor: '#999999',
            fontFamily: 'Nunito Sans',
            fontStyle: 'normal',
            fontWeight: 'bold',
            fontSize: '12px',
            content: this.model.identifier || 'Clip',
        });
        this.item.addChild(label);

        var buttonBody = new paper.Path.Rectangle({
            fillColor: '#2A2E30',
            from: new paper.Point(0, 0),
            to: new paper.Point(label.bounds.width, Wick.GUIElement.BREADCRUMBS_HEIGHT),
        });
        this.item.addChild(buttonBody);
        buttonBody.sendToBack();
    };
};
