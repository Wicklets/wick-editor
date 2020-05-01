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
    static get RASTERIZE_RESOLUTION_MODIFIER() {
        return 1;
    }

    static get RASTERIZE_RESOLUTION_MODIFIER_FOR_DEVICE() {
        return Wick.View.Frame.RASTERIZE_RESOLUTION_MODIFIER / window.devicePixelRatio;
    }

    /**
     * Create a frame view.
     */
    constructor() {
        super();

        this.objectsLayer = new this.paper.Layer();
        this.objectsLayer.remove();

    }

    /**
     * Write the changes made to the view to the frame.
     */
    applyChanges() {
        this._applyDrawableChanges();
    }

    /**
     * Update the view based on the model
     */
    render() {
        this._renderObjects();
    }

    _renderObjects() {
        this.objectsLayer.data.wickUUID = this.model.uuid;
        this.objectsLayer.data.wickType = 'clipsandpaths';
        this.objectsLayer.removeChildren();
        this.model.drawable.forEach(object => {
            object.view.render();
            if (object.view.model instanceof Wick.Path) {
                this.objectsLayer.addChild(object.view.item);
            } else {
                this.objectsLayer.addChild(object.view.group);
            }
        });
    }

    _applyDrawableChanges() {

        this.model.drawable.filter(path => {
            return path instanceof Wick.Path && path.isDynamicText;
        }).forEach(path => {
            path.view.item.bringToFront();
        }); // Clear all WickPaths from the frame

        // Reorder clips
        var drawables = this.model.drawable.concat([]);
        drawables.forEach(drawable => {
            // should realkly be remove child
            this.model.removeClip(drawable);
        });



        this.objectsLayer.children.filter(child => {
            return child.data.wickType !== 'gui';
        }).forEach(child => {
            if (child instanceof paper.Group || child instanceof Wick.Clip) {
                this.model.addClip(drawables.find(g => {
                    return g.uuid === child.data.wickUUID;
                }));
            } else {
                var originalWickPath = child.data.wickUUID ? Wick.ObjectCache.getObjectByUUID(child.data.wickUUID) : null;
                var pathJSON = Wick.View.Path.exportJSON(child);
                var wickPath = new Wick.Path({
                    json: pathJSON
                });
                this.model.addPath(wickPath);
                wickPath.fontWeight = originalWickPath ? originalWickPath.fontWeight : 400;
                wickPath.fontStyle = originalWickPath ? originalWickPath.fontStyle : 'normal';
                wickPath.identifier = originalWickPath ? originalWickPath.identifier : null;
                child.name = wickPath.uuid;
            }
        }); // Update clip transforms



        this.objectsLayer.children.filter(child => {
            return child.data.wickType !== 'gui';
        }).forEach(child => {
            if (child instanceof paper.Group || child instanceof Wick.Clip) {
                var wickClip = Wick.ObjectCache.getObjectByUUID(child.data.wickUUID);
                wickClip.transformation = new Wick.Transformation({
                    x: child.position.x,
                    y: child.position.y,
                    scaleX: child.scaling.x,
                    scaleY: child.scaling.y,
                    rotation: child.rotation,
                    opacity: child.opacity

                });
            }
        });
    }


};
