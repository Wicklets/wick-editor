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

Wick.Tools.Text = class extends Wick.Tool {
    /**
     *
     */
    constructor () {
        super();

        this.name = 'text';

        this.hoveredOverText = null;
        this.editingText = null;
    }

    /**
     *
     * @type {string}
     */
    get cursor () {
        return 'text';
    }

    onActivate (e) {

    }

    onDeactivate (e) {
        if(this.editingText) {
            this.finishEditingText();
        }
        this.hoveredOverText = null;
    }

    onMouseMove (e) {
        super.onMouseMove(e);

        if(e.item && e.item.className === 'PointText' && !e.item.parent.parent) {
            this.hoveredOverText = e.item;
            this.setCursor('text');
        } else {
            this.hoveredOverText = null;
        }
    }

    onMouseDown (e) {
        if (this.editingText) {
            this.finishEditingText();
        } else if(this.hoveredOverText) {
            this.editingText = this.hoveredOverText;
            e.item.edit(this.project.view.paper);
        } else {
            var text = new this.paper.PointText(e.point);
            text.justification = 'left';
            text.fillColor = 'black';
            text.content = 'Text';
            text.fontSize = 24;
            this.fireEvent('canvasModified');
        }
    }

    onMouseDrag (e) {

    }

    onMouseUp (e) {

    }

    /**
     * Stop editing the current text and apply changes.
     */
    finishEditingText () {
        if(!this.editingText) return;
        this.editingText.finishEditing();
        if(this.editingText.content === '') {
            this.editingText.remove();
        }
        this.editingText = null;
        this.fireEvent('canvasModified');
    }
}
