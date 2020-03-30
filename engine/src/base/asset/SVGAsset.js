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
     * @param {function} callback - called when the Path is done loading.
     */
    walkItems(project, item) {
        //TODO: Actually create layers and groups
        // create paths for all the path items, this also needs to be done for the following item.className=:
        // 'Group', 'Layer', 'Path', 'CompoundPath', 'Shape', 'Raster', 'SymbolItem', 'PointText'
        // I think path automatically handles this, but maybe not layer or group
        item.children.forEach(childItem => {
            if (item.classname == "Group" || item.classname == "Layer") {
                walkItems(childItem);
            } else {
                var path = new Wick.Path({
                    json: childItem.exportJSON();
                })
            }
        })
    }

    /**
     * Creates a new Wick SVG that uses this asset's data.
     * @param {function} callback - called when the Path is done loading.
     */
    createInstance(callback, project) {
        // TODO
        // needs to take a base64 encoded string.
        //we need a viewSVG and an SVG object that extends base by the looks of things.
        Wick.SVGFile.fromSVGFile(this.src, data => {
            var paperProject = new paper.Project(project.view.paper.view);
            var item = paperProject.importSVG(data, options.expandShapes = true);
            walkItems(project, item);
            callback(item);
            item.remove();
        });
    }
}