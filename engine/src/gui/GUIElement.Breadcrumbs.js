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
    constructor (model) {
        super(model);
    };

    build () {
        super.build();

        var cornerCover = new paper.Path.Rectangle({
            fillColor: 'red',
            from: new paper.Point(0, 0),
            to: new paper.Point(Wick.GUIElement.BREADCRUMBS_HEIGHT, 50),
        });
        this.item.addChild(cornerCover);

        var testlabel = new paper.PointText({
            point: [20, 20],
            content: 'this is the breadcrumbs sdnaskjdnaskjdbalkjdb',
        });
        this.item.addChild(testlabel);
    };
};
