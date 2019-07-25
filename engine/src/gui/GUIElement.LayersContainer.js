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

Wick.GUIElement.LayersContainer = class extends Wick.GUIElement {
    /**
     *
     */
    constructor (model) {
        super(model);

        this._layerLabels = {};
        this.createLayerLabel = new Wick.GUIElement.CreateLayerLabel(model);
        this.bg = new Wick.GUIElement.LayersContainerBG(model);
    }

    /**
     *
     */
    get width () {
        return Wick.GUIElement.LAYERS_CONTAINER_WIDTH;
    }

    /**
     *
     */
    build () {
        super.build();

        // Build layer labels
        this.model.layers.forEach(layer => {
            // Create/cache FramesStrips elements
            var layerLabel = this._layerLabels[layer.uuid];
            if(!layerLabel) {
                layerLabel = new Wick.GUIElement.LayerLabel(layer);
            }
            this._layerLabels[layer.uuid] = layerLabel;

            layerLabel.width = this.width;
            layerLabel.build();
            this.item.addChild(layerLabel.item);
            layerLabel.item.sendToBack();
        });

        this.createLayerLabel.index = this.model.layers.length;
        this.createLayerLabel.width = this.width;
        this.createLayerLabel.build();
        this.item.addChild(this.createLayerLabel.item);
        this.createLayerLabel.item.sendToBack();

        // Build BG
        this.bg.build();
        this.item.addChild(this.bg.item);
        this.bg.item.sendToBack();
    }

    _positionScrollableElements () {
        this.item.position.y = Wick.GUIElement.NUMBER_LINE_HEIGHT+this.scrollY;
        this.bg.item.position.y = Wick.GUIElement.NUMBER_LINE_HEIGHT-this.scrollY;
    }
}
