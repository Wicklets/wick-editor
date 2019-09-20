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

Wick.GUIElement.LayerCreateLabel = class extends Wick.GUIElement {
    constructor (model) {
        super(model);

        this.cursor = 'pointer';
    }

    draw () {
        super.draw();

        var ctx = this.ctx;

        ctx.fillStyle = (this.mouseState === 'over') ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)';

        var width = Wick.GUIElement.LAYERS_CONTAINER_WIDTH - Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES*2;
        var height = this.gridCellHeight - Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM*2;

        // Body
        ctx.save();
        ctx.translate(Wick.GUIElement.LAYER_LABEL_MARGIN_SIDES, Wick.GUIElement.LAYER_LABEL_MARGIN_TOP_BOTTOM);
            ctx.beginPath();
            ctx.roundRect(0, 0, width, height, Wick.GUIElement.LAYER_LABEL_BORDER_RADIUS);
            ctx.fill();
        ctx.restore();

        // Plus sign
        ctx.font = "20px " + Wick.GUIElement.LAYER_LABEL_FONT_FAMILY;
        ctx.fillStyle = Wick.GUIElement.ADD_FRAME_OVERLAY_PLUS_COLOR
        ctx.fillText('+', 90, this.gridCellHeight / 2 + 5);
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
        var newLayer = new Wick.Layer();
        this.model.project.activeTimeline.addLayer(newLayer);
        newLayer.activate();
        this.model.project.selection.clear();
        this.model.project.selection.select(newLayer);
        this.projectWasModified();
    }
}
