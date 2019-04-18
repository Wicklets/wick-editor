/*
 * Copyright 2018 WICKLETS LLC
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

Wick.View.Layer = class extends Wick.View {
    static get BASE_ONION_OPACITY () {
        return 0.35;
    }

    constructor (wickLayer) {
        super();

        this.activeFrameLayers = [];
        this.onionSkinnedFramesLayers = [];

        this.activeFrameContainers = [];
    }

    _renderSVG () {
        // Add active frame layers
        this.activeFrameLayers = [];
        var frame = this.model.activeFrame;
        if(frame) {
            frame.view.render();

            this.activeFrameLayers.push(frame.view.pathsLayer);
            this.activeFrameLayers.push(frame.view.clipsLayer);

            frame.view.clipsLayer.locked = false;
            frame.view.pathsLayer.locked = false;
            frame.view.clipsLayer.opacity = 1.0;
            frame.view.pathsLayer.opacity = 1.0;
        }
        this.activeFrameLayers.forEach(layer => {
            layer.locked = this.model.locked;
        });

        // Add onion skinned frame layers
        this.onionSkinnedFramesLayers = [];
        if(this.model.project && this.model.project.onionSkinEnabled) {
            var playheadPosition = this.model.project.focus.timeline.playheadPosition;
            var onionSkinEnabled = this.model.project.onionSkinEnabled;
            var onionSkinSeekBackwards = this.model.project.onionSkinSeekBackwards;
            var onionSkinSeekForwards = this.model.project.onionSkinSeekForwards;

            this.model.frames.filter(frame => {
                return !frame.inPosition(playheadPosition)
                    && frame.inRange(playheadPosition - onionSkinSeekBackwards,
                                     playheadPosition + onionSkinSeekForwards);
            }).forEach(frame => {
                frame.view.render();

                this.onionSkinnedFramesLayers.push(frame.view.pathsLayer);
                this.onionSkinnedFramesLayers.push(frame.view.clipsLayer);

                var onionMult = 1;
                if(frame.midpoint < playheadPosition) {
                    var onionMult = 1 - ((playheadPosition - frame.midpoint - 1) / onionSkinSeekBackwards);
                } else if(frame.midpoint > playheadPosition) {
                    var onionMult = 1 - ((frame.midpoint - playheadPosition - 1) / onionSkinSeekForwards);
                }
                onionMult = Math.min(1, onionMult);
                var opacity = onionMult * Wick.View.Layer.BASE_ONION_OPACITY;

                frame.view.clipsLayer.locked = true;
                frame.view.pathsLayer.locked = true;
                frame.view.clipsLayer.opacity = opacity;
                frame.view.pathsLayer.opacity = opacity;
            });
        }
    }

    _renderWebGL () {
        this.activeFrameContainers = [];
        var frame = this.model.activeFrame;
        if(frame) {
            frame.view.render();

            this.activeFrameContainers.push(frame.view.pathsContainer);
            this.activeFrameContainers.push(frame.view.clipsContainer);
        }
    }
}
