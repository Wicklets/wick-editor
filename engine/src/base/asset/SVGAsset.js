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
     * A list of Wick Paths, Clips and Layers that use this SVGAsset as their image source.
     * I think this should return Assets not Paths
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
        return false;
    }

    /**
     * Removes all Items using this asset as their source from the project.
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
     * Walks through the items tree creating the apprptiate wick object for each node*
     * @param {paper.Item} item - called when the Path is done loading.
     * @returns {Wick.Base}
     */
    static walkItems(item) {
            // create paths for all the path items, this also needs to be done for the following item.className=:
            // 'Group', 'Layer', 'Path', 'CompoundPath', 'Shape', 'Raster', 'SymbolItem', 'PointText'
            // I think path automatically handles this, but maybe not layer or group
            var wickItem = null; // Groups (clips) and layers do this differently so they must be handled separately

            if (item instanceof paper.Layer || (item.name !== null && item.name.startsWith("layer") && item instanceof paper.Group)) {
                wickItem = new Wick.Layer(); // If we've just added a layer set it to be the active layer
                //TODO: Find out how multiple layers are handled

                var frame = new Wick.Frame();
                wickItem.addFrame(frame);
                var groupChildren = Array.from(item.children); //prevent any side effects
                groupChildren.forEach(childItem => {
                    var wickChildItem = Wick.SVGAsset.walkItems(childItem).copy();

                    if (wickChildItem instanceof Wick.Clip) {
                        frame.addClip(wickChildItem);
                    } else if (wickChildItem instanceof Wick.Path) {
                        frame.addPath(wickChildItem);
                    } else if (wickChildItem instanceof Wick.Layer) {
                        frame.addLayer(wickChildItem);
                        //console.error("SVG Import: Error importing, nested layers.ignoring."); // Insert text
                    } else {
                        console.error("SVG Import: Unknown item type.".concat(wickChildItem.classname)); // Insert text
                    }
                });
            } else if (item instanceof paper.Group) {
                wickItem = new Wick.Clip();
                var wickObjects = [];
                var layers = [];
                var groupChildren = Array.from(item.children); //prevent any side effects
                groupChildren.forEach(childItem => {
                    var clipActiveLayer = wickItem.activeLayer;
                    ///This should be clips and paths not layers
                    var walkItem = Wick.SVGAsset.walkItems(childItem).copy();

                    if (walkItem instanceof Wick.Layer) {
                        //console.error("SVG Import: Clip has a child that is a layer, this should never happen. ignoring."); // Insert text
                        layers.push(walkItem);
                        clipActiveLayer.activate();
                    } else {
                        wickObjects.push(walkItem);
                    }
                });
                wickItem.addObjects(wickObjects); //add the items to the project
                // add layers after onjects so the objexts don't get bound to the new layer
                var layersCopy = Array.from(layers); //prevent any side effects
                layersCopy.forEach(layer => {
                    wickItem.timeline.addLayer(layer);
                });
            } else if (item instanceof paper.Shape) {
                //console.error("SVG Import: Item is an instance of a shape. This should never happen as all shapes should be converted to paths when we call paperProject.importSVG(data, options.expandShapes = true);");
                wickItem = new Wick.Path({ //json: item.clone().toPath().exportJSON()
                });
            } else {
                //'Path', 'CompoundPath', 'Raster', 'SymbolItem', 'PointText' all handled by Path which takes the loaded paper object expressed as JSON to load
                wickItem = new Wick.Path({
                    json: item.exportJSON()
                });
            }

            return wickItem;
        }
        /**
         * Walks through the items tree creating the appropriate wick object for each node
         * @param {Paper.Item} item - the item to turn into paths
         */

    /**
     * Walks through the items tree converting shapes into paths. This should be possible to do in the walkitems routine
     * @param {Paper.Item} item - called when the Path is done loading.
     */
    static _breakAppartShapesRecursively(item) {
        item.applyMatrix = true;
        if (item instanceof paper.Group || item instanceof paper.Layer) {
            var children = Array.from(item.children);
            children.forEach(childItem => {
                Wick.SVGAsset._breakAppartShapesRecursively(childItem);
            })
        } else if (item instanceof paper.Shape) { //This should have been done automatically by the import options, spo shouldn't be needed
            var path = item.toPath();
            //item.parent.addChild(path);
            //path.insertAbove(item);
            //item.remove();
            item.replaceWith(path);
        }
    }


    /**
     * Creates a new Wick SVG that uses this asset's data.
     * @param {function} callback - called when the SVG is done loading.
     */


    createInstance(callback) {
        // needs to take a base64 encoded string.
        //we need a viewSVG and an SVG object that extends base by the looks of things.

        /*
                var myPath = new paper.Path();
                myPath.strokeColor = 'black';
                myPath.add(new paper.Point(0, 0));
                myPath.add(new paper.Point(100, 50));
                var anItem = this.walkItems(myPath);
                this.project.addObject(anItem);
                var myLayer = new paper.Layer();
                var secondPath = new paper.Path.Circle(new paper.Point(150, 50), 35);
                secondPath.fillColor = 'green';
                var aLayer = this.walkItems(myLayer);
                this.project.addObject(aLayer);
                    // Create two circle shaped paths:
                var firstPath = new paper.Path.Circle(new paper.Point(80, 50), 35);
                var secondPath = new paper.Path.Circle(new paper.Point(120, 50), 35);
                var group = new paper.Group([firstPath, secondPath]);
                // Change the fill color of the items contained within the group:
                group.style = {
                    fillColor: 'red',
                    strokeColor: 'black'
                };
                var agroup = this.walkItems(group);
                this.project.addObject(agroup);
          */
        var importSVG = function(data) {
            var item = paper.project.importSVG(data, {
                expandShapes: true,
                insert: false
            });
            Wick.SVGAsset._breakAppartShapesRecursively(item);
            var wickItem = Wick.SVGAsset.walkItems(item).copy();
            callback(wickItem);
        };

        Wick.SVGFile.fromSVGFile(this.src, importSVG);
    }

};