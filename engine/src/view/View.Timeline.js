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

Wick.View.Timeline = class extends Wick.View {
    constructor (wickTimeline) {
        super();

        this.activeFrameLayers = [];
        this.onionSkinnedFramesLayers = [];

        this.activeFrameContainers = [];
    }

    render () {
        this.activeFrameLayers = [];
        this.onionSkinnedFramesLayers = [];

        this._getLayersInOrder().forEach(layer => {
            layer.view.render();
            this.activeFrameLayers = this.activeFrameLayers.concat(layer.view.activeFrameLayers);
            this.onionSkinnedFramesLayers = this.onionSkinnedFramesLayers.concat(layer.view.onionSkinnedFramesLayers);
        });
    }

    _getLayersInOrder () {
        return this.model.layers.filter(layer => {
            return !layer.hidden;
        }).reverse();
    }
}
