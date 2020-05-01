/*
 * Copyright 2020 WICKLETS LLC
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
    static get BASE_ONION_OPACITY() {
        return 0.35;
    }

    constructor(wickLayer) {
        super();

        this.activeFrameLayers = [];
        this.onionSkinnedFramesLayers = [];

        this.activeFrameContainers = [];
    }

    render() {
        // Add active frame layers
        this.activeFrameLayers = [];
        var frame = this.model.activeFrame;
        if (frame) {
            frame.view.render();

            this.activeFrameLayers.push(frame.view.objectsLayer);

            frame.view.objectsLayer.locked = false;
            frame.view.objectsLayer.opacity = 1.0;
        }

        // Disable mouse events on layers if they are locked.
        // (However, this is ignored while the project is playing so the interact tool always works.)
        // (This is also ignored for layers which are inside clips and not the current focus.)
        this.activeFrameLayers.forEach(layer => {
            if (this.model.project.playing || !this.model.parentClip.isFocus) {
                layer.locked = false;
            } else {
                layer.locked = this.model.locked;
            }
        });

        // Add onion skinning, if necessary.
        this.onionSkinnedFramesLayers = [];

        if (this.model.project &&
            this.model.project.onionSkinEnabled &&
            !this.model.project.playing &&
            this.model.parentClip.isFocus){
                this.addOnionSkin();
        }

    }

    addOnionSkin () {
        this.model.frames.filter(frame => {
            return frame.onionSkinned;
        }).forEach(frame => {
            this.onionSkinFrame(frame);
        });
    }

    onionSkinFrame (frame) {
        var onionSkinSeekBackwards = this.model.project.onionSkinSeekBackwards;
        var onionSkinSeekForwards = this.model.project.onionSkinSeekForwards;
        var playheadPosition = this.model.project.focus.timeline.playheadPosition;

        frame.view.render();

        this.onionSkinnedFramesLayers.push(frame.view.pathsLayer);
        this.onionSkinnedFramesLayers.push(frame.view.clipsLayer);

        var seek = 1;
        if(frame.midpoint < playheadPosition) {
            seek = onionSkinSeekBackwards;
        } else if(frame.midpoint > playheadPosition) {
            seek = onionSkinSeekForwards;
        }

        var dist = frame.distanceFrom(playheadPosition);
        var onionMult = ((seek - dist) + 1) / seek;
        onionMult = Math.min(1, Math.max(0, onionMult));
        var opacity = onionMult * Wick.View.Layer.BASE_ONION_OPACITY;

        frame.view.clipsLayer.locked = true;
        frame.view.pathsLayer.locked = true;
        frame.view.clipsLayer.opacity = opacity;
        frame.view.pathsLayer.opacity = opacity;
    }
}
