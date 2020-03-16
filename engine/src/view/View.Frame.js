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

Wick.View.Frame = class extends Wick.View {
    /**
     * A multiplier for the resolution for the rasterization process.
     * E.g. a multiplier of 2 will make a path 100 pixels wide rasterize into an image 200 pixels wide.
     */
    static get RASTERIZE_RESOLUTION_MODIFIER () {
        return 1;
    }

    static get RASTERIZE_RESOLUTION_MODIFIER_FOR_DEVICE () {
        return Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER / window.devicePixelRatio;
    }

    /**
     * Create a frame view.
     */
    constructor () {
        super();

        this.clipsLayer = new this.paper.Layer();
        this.clipsLayer.remove();

        this.pathsLayer = new this.paper.Layer();
        this.pathsLayer.remove();
    }

    /**
     * Write the changes made to the view to the frame.
     */
    applyChanges () {
        this._applyClipChanges();
        this._applyPathChanges();
    }

    /**
     * Import SVG data into the paper.js layer, and updates the Frame's json data.
     * @param {string} svg - the SVG data to parse and import.
     */
    importSVG (svg) {
        var importedItem = this.pathsLayer.importSVG(svg);
        this._recursiveBreakApart(importedItem);
        this._applyPathChanges();
    }

    render () {
        this._renderPaths();
        this._renderClips();
    }

    _renderPaths (args) {
        if(!args) args = {};

        this.pathsLayer.data.wickUUID = this.model.uuid;
        this.pathsLayer.data.wickType = 'paths';

        this.pathsLayer.removeChildren();

        this.model.paths.forEach(path => {
            path.view.render();
            this.pathsLayer.addChild(path.view.item);
        });
    }

    _renderClips () {
        this.clipsLayer.data.wickUUID = this.model.uuid;
        this.clipsLayer.data.wickType = 'clips';

        this.clipsLayer.removeChildren();

        this.model.clips.forEach(clip => {
            clip.view.render();
            this.clipsLayer.addChild(clip.view.group);
        });
    }

    _applyClipChanges () {
        // Reorder clips
        var clips = this.model.clips.concat([]);
        clips.forEach(clip => {
            this.model.removeClip(clip);
        });
        this.clipsLayer.children.forEach(child => {
            this.model.addClip(clips.find(g => {
                return g.uuid === child.data.wickUUID;
            }));
        });

        // Update clip transforms
        this.clipsLayer.children.forEach(child => {
            var wickClip = Wick.ObjectCache.getObjectByUUID(child.data.wickUUID);
            console.log(child.rotation);
            wickClip.transformation = new Wick.Transformation({
                x: child.position.x,
                y: child.position.y,
                scaleX: child.scaling.x,
                scaleY: child.scaling.y,
                rotation: child.rotation,
                opacity: child.opacity,
            });
        });
    }

    _applyPathChanges () {
        // NOTE:
        // This could be optimized by updating existing paths instead of completely clearing the frame children.

        // Quickfix for now:
        // Force all dynamic text paths to render in front of all other paths.
        this.model.paths.filter(path => {
            return path.isDynamicText;
        }).forEach(path => {
            path.view.item.bringToFront();
        });

        // Clear all WickPaths from the frame
        this.model.paths.forEach(path => {
            this.model.removePath(path);
        });

        // Create new WickPaths for the frame
        this.pathsLayer.children.filter(child => {
            return child.data.wickType !== 'gui';
        }).forEach(child => {
            var originalWickPath = child.data.wickUUID ? Wick.ObjectCache.getObjectByUUID(child.data.wickUUID) : null;
            var pathJSON = Wick.View.Path.exportJSON(child);
            var wickPath = new Wick.Path({json:pathJSON});
            this.model.addPath(wickPath);
            wickPath.fontWeight = originalWickPath ? originalWickPath.fontWeight : 400;
            wickPath.fontStyle = originalWickPath ? originalWickPath.fontStyle : 'normal';
            wickPath.identifier = originalWickPath ? originalWickPath.identifier : null;
            child.name = wickPath.uuid;
        });
    }

    // Helper function for SVG import (paper.js imports SVGs as one big group.)
    _recursiveBreakApart (item) {
        item.applyMatrix = true;

        if(item instanceof paper.Shape) {
            var path = item.toPath();
            item.parent.addChild(path);
            item.remove();
        }

        if(item instanceof paper.Group) {
            var children = item.removeChildren();
            item.parent.addChildren(children);
            item.remove();

            children.forEach(child => {
                this._recursiveBreakApart(child);
            });
        }
    }
}
