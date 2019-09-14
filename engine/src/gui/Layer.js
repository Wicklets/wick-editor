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

Wick.GUIElement.Layer = class extends Wick.GUIElement {
    constructor (model) {
        super(model);
        
        this.canAutoScrollY = true;

        this.hideButton = new Wick.GUIElement.LayerButton(model, {
            tooltip: 'Show/Hide Layer',
            clickFn: () => {
                this.model.hidden = !this.model.hidden;
            }
        });

        this.lockButton = new Wick.GUIElement.LayerButton(model, {
            tooltip: 'Lock/Unlock Layer',
            clickFn: () => {
                this.model.locked = !this.model.locked;
            }
        });
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        // Body
        if (this.model.hidden) {
            ctx.fillStyle = Wick.GUIElement.LAYER_LABEL_HIDDEN_FILL_COLOR;
        } else if (this.model.isActive) {
            ctx.fillStyle = Wick.GUIElement.LAYER_LABEL_ACTIVE_FILL_COLOR;
        } else {
            ctx.fillStyle = Wick.GUIElement.LAYER_LABEL_INACTIVE_FILL_COLOR;
        }

        if(this.model.isSelected) {
            ctx.strokeStyle = Wick.GUIElement.SELECTED_ITEM_BORDER_COLOR;
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = 'rgba(0,0,0,0)';
            ctx.lineWidth = 0;
        }

        var width = Wick.GUIElement.LAYERS_CONTAINER_WIDTH - Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES*2;
        var height = this.gridCellHeight - Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM*2;

        ctx.save();
        ctx.translate(Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES, Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM);
            ctx.beginPath();
            ctx.roundRect(0, 0, width, height, Wick.GUIElement.LAYER_LABEL_BORDER_RADIUS);
            ctx.fill();
            ctx.stroke();
        ctx.restore();

        // Layer name
        var maxWidth = Wick.GUIElement.LAYERS_CONTAINER_WIDTH - 60;
        ctx.font = "16px " + Wick.GUIElement.LAYER_LABEL_FONT_FAMILY;
        ctx.fillStyle = this.model.isActive
          ? Wick.GUIElement.LAYER_LABEL_ACTIVE_FONT_COLOR
          : Wick.GUIElement.LAYER_LABEL_INACTIVE_FONT_COLOR;
        ctx.fillText(this.model.name, 53, this.gridCellHeight / 2 + 6, maxWidth);

        // Buttons
        ctx.save();
        ctx.translate(20, 20);
            this.hideButton.draw(this.model.hidden ? 'eye_closed' : 'eye_open', this.model.hidden);
        ctx.restore();

        ctx.save();
        ctx.translate(40, 20);
            this.lockButton.draw(this.model.locked ? 'lock_closed' : 'lock_open', this.model.locked);
        ctx.restore();
    }

    get bounds () {
        return {
            x: 0,
            y: 0,
            width: Wick.GUIElement.LAYERS_CONTAINER_WIDTH,
            height: this.gridCellHeight,
        }
    }

    onMouseDown (e) {
        this.model.activate();
        this.model.project.selection.clear();
        this.model.project.selection.select(this.model);
    }
}
