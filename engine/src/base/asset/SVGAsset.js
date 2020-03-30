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

Wick.SVGAsset = class extends Wick.FileAsset {
    /**
     * Returns all valid MIME types for files which can be converted to SVGAssets.
     * @return {string[]} Array of strings of MIME types in the form MediaType/Subtype.
     */
    static getValidMIMETypes() {
        return ['image/svg+xml'];
    }

    /**
     * Returns all valid extensions types for files which can be attempted to be
     * converted to SVGAssets.
     * @return  {string[]} Array of strings representing extensions.
     */
    static getValidExtensions() {
        return ['.svg']
    }

    /**
     * Create a new SVGAsset.
     * @param {object} args
     */
    constructor(args) {
        super(args);
    }

    _serialize(args) {
        var data = super._serialize(args);
        return data;
    }

    _deserialize(data) {
        super._deserialize(data);
    }

    get classname() {
        return 'SVGAsset';
    }

    /**
     * A list of Wick Paths that use this SVGAsset as their image source.
     * @returns {Wick.Path[]}
     */
    getInstances() {
        return []; // TODO
    }

    /**
     * Check if there are any objects in the project that use this asset.
     * @returns {boolean}
     */
    hasInstances() {
        return false; // TODO
    }

    /**
     * Removes all Paths using this asset as their source from the project.
     * @returns {boolean}
     */
    removeAllInstances() {
        // TODO
    }

    /**
     * Load data in the asset
     */
    load(callback) {
        // We don't need to do anything here, the data for SVGAssets is just SVG
        callback();
    }

    /**
     * Walks through the items tree creating the apprptiate wick object for each node
     * @param {Paper.Project} project - called when the Path is done loading.
     * @param {Paper.Item} item - called when the Path is done loading.
     */
    @returns { Wick.Base }

    walkItems(project, item) {
        // create paths for all the path items, this also needs to be done for the following item.className=:
        // 'Group', 'Layer', 'Path', 'CompoundPath', 'Shape', 'Raster', 'SymbolItem', 'PointText'
        // I think path automatically handles this, but maybe not layer or group
        var wickItem = NULL;

        if (item.classname instanceof paper.Group || item instanceof paper.Layer) {
            if (item instanceof paper.Group) {
                wickItem = new Wick.Clip()
            } else if (item instanceof paper.Layer) { // this is always going to be a layer if it's ot a group but put the if in for compleatness
                wickItem = new Wick.Layer()
            }

            //There are two ways of adding children in wicks. some classes take addObjects other classes have addChild
            if (wickItem instanceof Wick.Layer) {
                item.children.forEach(childItem => {
                        wickItem.activeFrame.addChild(walkItems(childItem));
                    })
                    // If we've just added a layer set it to be the active layer
                project.timeline.activeLayerIndex = project.timeline.layers.count - 1;
            } else if (wickItem instanceof Wick.Clip) {
                var wickObjects = Wick.Base[];
                item.children.forEach(childItem => {
                    wickObjects.addChild(walkItems(childItem));
                })
                wickItem.addObjects(wickObjects);
            }
        }
        //add the layer or the clip to the project
        project.addObject(wickItem);

    } else
    if (node instanceof paper.Shape) {
        //TODO: Throw an error saying to call _breakAppartShapesRecursivly because this should never happen
    } else {
        wickItem = new Wick.Path({
            json: node.exportJSON();
        })
    }
    return wickItem;
}

/**
 * Walks through the items tree creating the appropriate wick object for each node
 * @param {Paper.Item} item - the item to turn into paths
 */
_breakAppartShapesRecursively(item) {
        item.applyMatrix = true;
        if (item instanceof paper.Group || item instanceof paper.Layer) {
            item.children.forEach(childItem => {
                _breakAppartShapesRecursively(childItem);
            })
        } else if (item instanceof paper.Shape) { //This should have been done automatically by the import options, spo shouldn't be needed
            var path = item.toPath();
            item.parent.addChild(path);
            item.remove();
        }
    }
    /**
     * Creates a new Wick SVG that uses this asset's data.
     * @param {function} callback - called when the SVG is done loading.
     * @param {Wick.Project} project
     */
createInstance(callback, project) {
    // needs to take a base64 encoded string.
    //we need a viewSVG and an SVG object that extends base by the looks of things.
    Wick.SVGFile.fromSVGFile(this.src, data => {
        var paperProject = new paper.Project(project.view.paper.view); //will this do, it should really be an invisible temporary view. maybe an SVGView
        var node = paperProject.importSVG(data, options.expandShapes = true);
        // this shouldn't be needed because we set options.expandShapes = true
        _breakAppartShapesRecursively(node)
        wickItem = walkItems(project, node);
        node.remove(); //do we actually need to do this
        callback(wickItem);
    });
}
}