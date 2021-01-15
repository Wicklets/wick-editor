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

/**
 * Class representing a Wick Selection.
 */
Wick.Selection = class extends Wick.Base {
    static get LOCATION_NAMES() {
        return ['Canvas', 'Timeline', 'AssetLibrary'];
    }

    /**
     * Create a Wick Selection.
     */
    constructor(args) {
        if (!args) args = {};
        super(args);

        this._selectedObjectsUUIDs = args.selectedObjects || [];
        this._widgetRotation = args.widgetRotation || 0;
        this._pivotPoint = { x: 0, y: 0 };
        this._originalWidth = 0;
        this._originalHeight = 0;

        this.SELECTABLE_OBJECT_TYPES = ['Path', 'Clip', 'Frame', 'Tween', 'Layer', 'Asset', 'Button', 
        'ClipAsset', 'FileAsset', 'FontAsset', 'GIFAsset', 'ImageAsset', 'SoundAsset', 'SVGAsset'];
        this.SELECTABLE_OBJECT_TYPES_SET = new Set(this.SELECTABLE_OBJECT_TYPES);
    }

    _serialize(args) {
        var data = super._serialize(args);
        data.selectedObjects = Array.from(this._selectedObjectsUUIDs);
        data.widgetRotation = this._widgetRotation;
        data.pivotPoint = {
            x: this._pivotPoint.x,
            y: this._pivotPoint.y,
        };
        data.originalWidth = this._originalWidth;
        data.originalHeight = this._originalHeight;
        return data;
    }

    _deserialize(data) {
        super._deserialize(data);
        this._selectedObjectsUUIDs = data.selectedObjects || [];
        this._widgetRotation = data.widgetRotation;
        this._pivotPoint = {
            x: data.pivotPoint.x,
            y: data.pivotPoint.y
        };
        this._originalWidth = data.originalWidth;
        this._originalHeight = data.originalHeight;
    }

    get classname() {
        return 'Selection';
    }

    /**
     * The names of all attributes of the selection that can be changed.
     * @type {string[]}
     */
    get allAttributeNames() {
        return [
            "strokeWidth",
            "fillColor",
            "strokeColor",
            "name",
            "filename",
            "fontSize",
            "fontFamily",
            "fontWeight",
            "fontStyle",
            "src",
            "frameLength",
            "x",
            "y",
            "originX",
            "originY",
            "width",
            "height",
            "rotation",
            "opacity",
            "sound",
            "soundVolume",
            "soundStart",
            "identifier",
            "easingType",
            "fullRotations",
            "scaleX",
            "scaleY",
            "animationType",
            "singleFrameNumber",
            "isSynced",
        ];
    }

    /**
     * Returns true if an object is selectable.
     * @param {object} object object to check if selectable
     * @returns {boolean} true if selectable, false otherwise.
     */
    isSelectable (object) {
        return this.SELECTABLE_OBJECT_TYPES_SET.has(object.classname);
    }

    /**
     * Add a wick object to the selection. If selecting multiple objects, you should use
     * selection.selectMultipleObjects.
     * @param {Wick.Base} object - The object to select.
     */
    select(object) {

        // Only allow specific objects to be selectable.
        if (!this.isSelectable(object)) {
            console.warn("Tried to select a " + object.classname + " object. This type is not selectable");
            return;
        }

        // Don't do anything if the object is already selected
        if (this.isObjectSelected(object)) {
            return;
        }

        // Activate the cursor tool when selection changes
        if (this._locationOf(object) === 'Canvas') {
            this.project.activeTool = this.project.tools.cursor;
            object.parentLayer && object.parentLayer.activate();
        }

        // Only allow selection of objects of in the same location
        if (this._locationOf(object) !== this.location) {
            this.clear();
        }

        // Add the object to the selection!
        this._selectedObjectsUUIDs.push(object.uuid);

        // Select in between frames (for shift+click selecting frames)
        if (object instanceof Wick.Frame) {
            this._selectInBetweenFrames(object);
        }

        this._resetPositioningValues();

        // Make sure the view gets updated the next time its needed...
        this.view.dirty = true;
    }

    /**
     * Select multiple objects. Must be selectable objects. Significantly faster than selecting multiple elements
     * with a select() independently.
     * @param {object[]} objects 
     */
    selectMultipleObjects (objects) {
        let UUIDsToAdd = [];

        objects.forEach(obj => {
            if (this.isSelectable(obj) && !this.isObjectSelected(obj)) {
                // Clear the selection if any of the selected objects are not in the same place as the objects
                // being selected.
                if (this.location !== this._locationOf(obj)) {
                    this.clear();
                }

                UUIDsToAdd.push(obj.uuid);
            }
        });

        UUIDsToAdd.forEach(uuid => {
            this._selectedObjectsUUIDs.push(uuid);
        });

        this._resetPositioningValues();
        this.view.dirty = true;
    }

    /**
     * Remove a wick object from the selection.
     * @param {Wick.Base} object - The object to deselect.
     */
    deselect(object) {
        this._selectedObjectsUUIDs = this._selectedObjectsUUIDs.filter(uuid => {
            return uuid !== object.uuid;
        });

        this._resetPositioningValues();

        // Make sure the view gets updated the next time its needed...
        this.view.dirty = true;
    }

    /**
     * Remove multiple objects from the selection. Does nothing if an object is not selected.
     * @param {object[]} objects objects to remove from the selection.
     */
    deselectMultipleObjects (objects) {
        objects = objects.filter(obj => obj);
        let uuids = objects.map(obj => obj.uuid);
        uuids = new Set(uuids);

        this._selectedObjectsUUIDs = this._selectedObjectsUUIDs.filter(uuid => !uuids.has(uuid));

        this._resetPositioningValues();
        this.view.dirty = true;
    }

    /**
     * Remove all objects from the selection with an optional filter.
     * @param {string} filter - A location or a type (see SELECTABLE_OBJECT_TYPES and LOCATION_NAMES)
     */
    clear(filter) {
        if (filter === undefined) {
            this._selectedObjectsUUIDs = [];
            this._resetPositioningValues();
            this.view.dirty = true;
        } else {
            this.deselectMultipleObjects(this.project.selection.getSelectedObjects(filter));
        }
    }

    /**
     * Checks if a given object is selected.
     * @param {Wick.Base} object - The object to check selection of.
     */
    isObjectSelected(object) {
        return this._selectedObjectsUUIDs.indexOf(object.uuid) !== -1;
    }

    /**
     * Get the first object in the selection if there is a single object in the selection.
     * @return {Wick.Base} The first object in the selection.
     */
    getSelectedObject() {
        if (this.numObjects === 1) {
            return this.getSelectedObjects()[0];
        } else {
            return null;
        }
    }

    /**
     * Get the objects in the selection with an optional filter.
     * @param {string} filter - A location or a type (see SELECTABLE_OBJECT_TYPES and LOCATION_NAMES)
     * @return {Wick.Base[]} The selected objects.
     */
    getSelectedObjects(filter) {
        var objects = this._selectedObjectsUUIDs.map(uuid => {
            return Wick.ObjectCache.getObjectByUUID(uuid);
        });

        if (Wick.Selection.LOCATION_NAMES.indexOf(filter) !== -1) {
            var location = filter;
            if (this.location !== location) {
                return [];
            } else {
                return this.getSelectedObjects();
            }
        } else if (typeof filter === 'string') {
            var classname = filter;
            objects = objects.filter(object => {
                return object instanceof Wick[classname];
            });
        }

        return objects;
    }

    /**
     * Get the UUIDs of the objects in the selection with an optional filter.
     * @param {string} filter - A location or a type (see SELECTABLE_OBJECT_TYPES and LOCATION_NAMES)
     * @return {string[]} The UUIDs of the selected objects.
     */
    getSelectedObjectUUIDs(filter) {
        return this.getSelectedObjects(filter).map(object => {
            return object.uuid;
        });
    }

    /**
     * The location of the objects in the selection. (see LOCATION_NAMES)
     * @type {string}
     */
    get location() {
        if (this.numObjects === 0) return null;
        return this._locationOf(this.getSelectedObjects()[0]);
    }

    /**
     * The types of the objects in the selection. (see SELECTABLE_OBJECT_TYPES)
     * @type {string[]}
     */
    get types() {
        var types = this.getSelectedObjects().map(object => {
            return object.classname;
        });
        var uniqueTypes = [...new Set(types)];
        return uniqueTypes;
    }

    /**
     * A single string describing the contents of the selection.
     * @type {string}
     */
    get selectionType() {
        let selection = this;

        if (selection.location === 'Canvas') {
            if (selection.numObjects === 1) {
                var selectedObject = selection.getSelectedObject();
                if (selectedObject instanceof window.Wick.Path) {
                    return selectedObject.pathType;
                } else if (selectedObject instanceof window.Wick.Button) {
                    return 'button';
                } else if (selectedObject instanceof window.Wick.Clip) {
                    return 'clip';
                }
            } else if (selection.types.length === 1) {
                if (selection.types[0] === 'Path') {
                    return 'multipath';
                } else {
                    return 'multiclip';
                }
            } else {
                return 'multicanvas';
            }
        } else if (selection.location === 'Timeline') {
            if (selection.numObjects === 1) {
                if (selection.getSelectedObject() instanceof window.Wick.Frame) {
                    return 'frame';
                } else if (selection.getSelectedObject() instanceof window.Wick.Layer) {
                    return 'layer';
                } else if (selection.getSelectedObject() instanceof window.Wick.Tween) {
                    return 'tween';
                }
            } else if (selection.types.length === 1) {
                if (selection.getSelectedObjects()[0] instanceof window.Wick.Frame) {
                    return 'multiframe';
                } else if (selection.getSelectedObjects()[0] instanceof window.Wick.Layer) {
                    return 'multilayer';
                } else if (selection.getSelectedObjects()[0] instanceof window.Wick.Tween) {
                    return 'multitween';
                }
            } else {
                return 'multitimeline';
            }
        } else if (selection.location === 'AssetLibrary') {
            if (selection.getSelectedObjects()[0] instanceof window.Wick.ImageAsset) {
                return 'imageasset';
            } else if (selection.getSelectedObjects()[0] instanceof window.Wick.SoundAsset) {
                return 'soundasset';
            } else if (selection.getSelectedObjects()[0] instanceof window.Wick.SVGAsset) {
                return 'svgasset';
            } else {
                return 'multiassetmixed'
            }
        } else {
            return 'unknown';
        }
    }

    /**
     * The number of objects in the selection.
     * @type {number}
     */
    get numObjects() {
        return this._selectedObjectsUUIDs.length;
    }

    /**
     * The rotation of the selection (used for canvas selections)
     * @type {number}
     */
    get widgetRotation() {
        return this._widgetRotation;
    }

    set widgetRotation(widgetRotation) {
        this._widgetRotation = widgetRotation;
    }

    /**
     * The point that transformations to the selection will be based around.
     * @type {object}
     */
    get pivotPoint() {
        return this._pivotPoint;
    }

    set pivotPoint(pivotPoint) {
        this._pivotPoint = pivotPoint;
    }

    /**
     * The animation type of a clip.
     * @type {string}
     */
    get animationType () {
        if (this.getSelectedObject() && this.selectionType === 'clip') {
            return this.getSelectedObject().animationType;
        } else {
            return null;
        }
    }

    set animationType (newType) {
        if (this.getSelectedObject()) {
            this.getSelectedObject().animationType = newType;
        } else {
            console.error("Cannot set the animation type of multiple objects...");
        }
    }

    /**
     * If a clip is set to singleFrame, this number will be used to determine that frame.
     */
    get singleFrameNumber () {
        if (this.getSelectedObject() && this.selectionType === 'clip') {
            return this.getSelectedObject().singleFrameNumber;
        } else {
            return null;
        }
    }

    set singleFrameNumber (frame) {
        if (this.getSelectedObject()) {
            this.getSelectedObject().singleFrameNumber = frame;
        } else {
            console.error("Cannot set singleFrameNumber of multiple objects...");
        }

    }

    /**
     * Tags that belong to selected clip.
     */
    get clipTags () {
        if (this.getSelectedObject() && this.selectionType === 'clip') {
            return this.getSelectedObject().clipTags;
        } else {
            return null;
        }
    }

    /**
     * Add clip tag to selected clip.
     * @param {string} tag tag to add
     */
    addClipTag (tag) {
        if (this.getSelectedObject() && this.selectionType === 'clip') {
            this.getSelectedObject().addClipTag(tag);
        } 
    }

    /**
     * Removes tag from selected clip.
     * @param {string} tag tag to remove
     */
    removeClipTag (tag) {
        if (this.getSelectedObject() && this.selectionType === 'clip') {
            this.getSelectedObject().removeClipTag(tag);
        } 
    }

    /**
     * The position of the selection.
     * @type {number}
     */
    get x() {
        return this.view.x;
    }

    set x(x) {
        this.view.x = x;
        this.project.tryToAutoCreateTween();
    }

    /**
     * The position of the selection.
     * @type {number}
     */
    get y() {
        return this.view.y;
    }

    set y(y) {
        this.view.y = y;
        this.project.tryToAutoCreateTween();
    }

    /**
     * The origin position the selection.
     * @type {number}
     */
    get originX() {
        // If there's only 1 object selected, the origin is that object's position.
        if (this.getSelectedObject() && (this.selectionType === "clip" || this.selectionType === "button")) {
            return this.getSelectedObject().transformation.x;
        } else {
            return this.x + this.width / 2;
        }
    }

    set originX(x) {
        if (this.getSelectedObject() && (this.selectionType === "clip" || this.selectionType === "button")) {
            this.getSelectedObject().x = x;
            this.pivotPoint = { x: x, y: this.pivotPoint.y };
        } else {
            this.x = x - this.width / 2;
        }
    }

    /**
     * The origin position the selection.
     * @type {number}
     */
    get originY() {
        // If there's only 1 object selected, the origin is that object's position.
        if (this.getSelectedObject() && (this.selectionType === "clip" || this.selectionType === "button")) {
            return this.getSelectedObject().y
        } else {
            return this.y + this.height / 2;
        }
    }

    set originY(y) {
        if (this.getSelectedObject() && (this.selectionType === "clip" || this.selectionType === "button")) {
            this.getSelectedObject().y = y;
            this.pivotPoint = { x: this.pivotPoint.x, y: y };
        } else {
            this.y = y - this.height / 2;
        }
    }


    /**
     * The width of the selection.
     * @type {number}
     */
    get width() {
        return this.view.width;
    }

    set width(width) {
        this.project.tryToAutoCreateTween();
        this.view.width = width;
    }

    /**
     * The height of the selection.
     * @type {number}
     */
    get height() {
        return this.view.height;
    }

    set height(height) {
        this.project.tryToAutoCreateTween();
        this.view.height = height;
    }

    /**
     * The rotation of the selection.
     * @type {number}
     */
    get rotation() {
        return this.view.rotation;
    }

    set rotation(rotation) {
        this.project.tryToAutoCreateTween();
        this.view.rotation = rotation;
    }

    /**
     * It is the original width of the selection at creation.
     * @type {number}
     */
    get originalWidth() {
        return this._originalWidth;
    }

    set originalWidth(originalWidth) {
        this._originalWidth = originalWidth;
    }

    /**
     * It is the original height of the selection at creation.
     * @type {number}
     */
    get originalHeight() {
        return this._originalHeight;
    }

    set originalHeight(originalHeight) {
        this._originalHeight = originalHeight;
    }

    /**
     * The scale of the selection on the X axis.
     * @type {number}
     */
    get scaleX() {
        // Clips store their scale state internally
        if (this.selectionType === "clip" || this.selectionType === "button") {
            return this.getSelectedObject().transformation.scaleX;
        } else {
            // Paths do not save their internal scale state.
            return this.width / this.originalWidth;
        }
    }

    set scaleX(scaleX) {
        // Clips store their scale state internally
        if (this.selectionType === "clip" || this.selectionType === "button") {
            this.getSelectedObject().scaleX = scaleX;
        } else {
            this.width = this.originalWidth * scaleX;
        }
    }

    /**
     * The scale of the selection on the Y axis.
     * @type {number}
     */
    get scaleY() {
        // Clips store their scale state internally
        if (this.selectionType === "clip" || this.selectionType === "button") {
            return this.getSelectedObject().transformation.scaleY;
        } else {
            return this.height / this.originalHeight;
        }
    }

    set scaleY(scaleY) {
        // Clips store their scale state internally
        if (this.selectionType === "clip" || this.selectionType === "button") {
            this.getSelectedObject().scaleY = scaleY;
        } else {
            this.height = this.originalHeight * scaleY;
        }
    }

    /**
     * Determines if a clip is synced to the timeline.
     */
    get isSynced () {
        // Clips store can be synced to the animation timeline
        if (this.selectionType === "clip") {
            return this.getSelectedObject().isSynced;
        } else {
            return false;
        }
    }

    set isSynced (syncBool) {
        if (!typeof syncBool === "boolean") return;

        if (this.selectionType === "clip") {
            this.getSelectedObject().isSynced = syncBool;
        }
    }

    /**
     * Flips the selected obejcts horizontally.
     */
    flipHorizontally() {
        this.project.tryToAutoCreateTween();
        this.view.flipHorizontally();
    }

    /**
     * Flips the selected obejcts vertically.
     */
    flipVertically() {
        this.project.tryToAutoCreateTween();
        this.view.flipVertically();
    }

    /**
     * Sends the selected objects to the back.
     */
    sendToBack() {
        this.view.sendToBack();
    }

    /**
     * Brings the selected objects to the front.
     */
    bringToFront() {
        this.view.bringToFront();
    }

    /**
     * Moves the selected objects forwards.
     */
    moveForwards() {
        this.view.moveForwards();
    }

    /**
     * Moves the selected objects backwards.
     */
    moveBackwards() {
        this.view.moveBackwards();
    }

    /**
     * The identifier of the selected object.
     * @type {string}
     */
    get identifier() {
        return this._getSingleAttribute('identifier');
    }

    set identifier(identifier) {
        this._setSingleAttribute('identifier', identifier);
    }

    /**
     * The name of the selected object.
     * @type {string}
     */
    get name() {
        return this._getSingleAttribute('name');
    }

    set name(name) {
        this._setSingleAttribute('name', name);
    }

    /**
     * The fill color of the selected object.
     * @type {paper.Color}
     */
    get fillColor() {
        return this._getSingleAttribute('fillColor');
    }

    set fillColor(fillColor) {
        this._setSingleAttribute('fillColor', fillColor);
    }

    /**
     * The stroke color of the selected object.
     * @type {paper.Color}
     */
    get strokeColor() {
        return this._getSingleAttribute('strokeColor');
    }

    set strokeColor(strokeColor) {
        this._setSingleAttribute('strokeColor', strokeColor);
    }

    /**
     * The stroke width of the selected object.
     * @type {number}
     */
    get strokeWidth() {
        return this._getSingleAttribute('strokeWidth');
    }

    set strokeWidth(strokeWidth) {
        this._setSingleAttribute('strokeWidth', strokeWidth);
    }

    /**
     * The font family of the selected object.
     * @type {string}
     */
    get fontFamily() {
        return this._getSingleAttribute('fontFamily');
    }

    set fontFamily(fontFamily) {
        this._setSingleAttribute('fontFamily', fontFamily);
    }

    /**
     * The font size of the selected object.
     * @type {number}
     */
    get fontSize() {
        return this._getSingleAttribute('fontSize');
    }

    set fontSize(fontSize) {
        this._setSingleAttribute('fontSize', fontSize);
    }

    /**
     * The font weight of the selected object.
     * @type {number}
     */
    get fontWeight() {
        return this._getSingleAttribute('fontWeight');
    }

    set fontWeight(fontWeight) {
        this._setSingleAttribute('fontWeight', fontWeight);
    }

    /**
     * The font style of the selected object. ('italic' or 'oblique')
     * @type {string}
     */
    get fontStyle() {
        return this._getSingleAttribute('fontStyle');
    }

    set fontStyle(fontStyle) {
        this._setSingleAttribute('fontStyle', fontStyle);
    }

    /**
     * The opacity of the selected object.
     * @type {number}
     */
    get opacity() {
        return this._getSingleAttribute('opacity');
    }

    set opacity(opacity) {
        this.project.tryToAutoCreateTween();
        this._setSingleAttribute('opacity', opacity);
    }

    /**
     * The sound attached to the selected frame.
     * @type {Wick.SoundAsset}
     */
    get sound() {
        return this._getSingleAttribute('sound');
    }

    set sound(sound) {
        this._setSingleAttribute('sound', sound);
    }

    /**
     * The length of the selected frame.
     * @type {number}
     */
    get frameLength() {
        return this._getSingleAttribute('length');
    }

    set frameLength(frameLength) {
        this._setSingleAttribute('length', frameLength);
        var layer = this.project.activeLayer;
        layer.resolveOverlap(this.getSelectedObjects());
        layer.resolveGaps();
    }

    /**
     * The volume of the sound attached to the selected frame.
     * @type {number}
     */
    get soundVolume() {
        return this._getSingleAttribute('soundVolume');
    }

    set soundVolume(soundVolume) {
        this._setSingleAttribute('soundVolume', soundVolume);
    }

    /**
     * The starting position of the sound on the frame in ms.
     * @type {number}
     */
    get soundStart() {
        return this._getSingleAttribute('soundStart');
    }

    set soundStart(soundStart) {
        this._setSingleAttribute('soundStart', soundStart);
    }

    /**
     * The easing type of a selected tween. See Wick.Tween.VALID_EASING_TYPES.
     * @type {string}
     */
    get easingType() {
        return this._getSingleAttribute('easingType');
    }

    set easingType(easingType) {
        return this._setSingleAttribute('easingType', easingType);
    }

    /**
     * The amount of rotations to perform during a tween. Positive value = clockwise rotation.
     * @type {Number}
     */
    get fullRotations () {
        return this._getSingleAttribute('fullRotations');
    }

    set fullRotations (fullRotations) {
        return this._setSingleAttribute('fullRotations', fullRotations);
    }

    /**
     * The filename of the selected asset. Read only.
     * @type {string}
     */
    get filename() {
        return this._getSingleAttribute('filename');
    }

    /**
     * True if the selection is scriptable. Read only.
     * @type {boolean}
     */
    get isScriptable() {
        return this.numObjects === 1 && this.getSelectedObjects()[0].isScriptable;
    }

    /**
     * The source (dataURL) of the selected ImageAsset or SoundAsset. Read only.
     * @type {string}
     */
    get src () {
        return this.numObjects === 1 && this.getSelectedObjects()[0].src;
    }

    /**
     * Get a list of only the farthest right frames on each layer.
     * @returns {Wick.Frame[]}
     */
    getRightmostFrames() {
        var selectedFrames = this.getSelectedObjects('Frame');

        var rightmostFrames = {};
        selectedFrames.forEach(frame => {
            var layerid = frame.parentLayer.uuid;
            if (!rightmostFrames[layerid] || frame.end > rightmostFrames[layerid].end) {
                rightmostFrames[layerid] = frame;
            }
        });

        var result = [];
        for (var id in rightmostFrames) {
            result.push(rightmostFrames[id]);
        }

        return result;
    }

    /**
     * Get a list of only the farthest left frames on each layer.
     * @returns {Wick.Frame[]}
     */
    getLeftmostFrames() {
        var selectedFrames = this.getSelectedObjects('Frame');

        var leftmostFrames = {};
        selectedFrames.forEach(frame => {
            var layerid = frame.parentLayer.uuid;
            if (!leftmostFrames[layerid] || frame.start < leftmostFrames[layerid].end) {
                leftmostFrames[layerid] = frame;
            }
        });

        var result = [];
        for (var id in leftmostFrames) {
            result.push(leftmostFrames[id]);
        }

        return result;
    }

    _locationOf(object) {
        if (object instanceof Wick.Frame ||
            object instanceof Wick.Tween ||
            object instanceof Wick.Layer) {
            return 'Timeline';
        } else if (object instanceof Wick.Asset) {
            return 'AssetLibrary';
        } else if (object instanceof Wick.Path ||
            object instanceof Wick.Clip) {
            return 'Canvas';
        }
    }

    /* Helper function: Calculate the selection x,y */
    _resetPositioningValues() {
        var selectedObject = this.getSelectedObject();

        if (selectedObject instanceof Wick.Clip) {
            // Single clip selected: Use that Clip's transformation for the pivot point and rotation
            this._widgetRotation = selectedObject.transformation.rotation;
            this._pivotPoint = {
                x: selectedObject.transformation.x,
                y: selectedObject.transformation.y,
            }
        } else {
            // Path selected or multiple objects selected: Reset rotation and use center for pivot point
            this._widgetRotation = 0;

            var boundsCenter = this.view._getSelectedObjectsBounds().center;
            this._pivotPoint = {
                x: boundsCenter.x,
                y: boundsCenter.y,
            };

            // Always pull original size values.
            this._originalWidth = this.view._getSelectedObjectsBounds().width;
            this._originalHeight = this.view._getSelectedObjectsBounds().height;
        }
    }

    /* helper function for getting a single value from multiple selected objects */
    _getSingleAttribute(attributeName) {
        if (this.numObjects === 0) return null;
        return this.getSelectedObjects()[0][attributeName];
    }

    /* helper function for updating the same attribute on all items in the selection  */
    _setSingleAttribute(attributeName, value) {
        this.getSelectedObjects().forEach(selectedObject => {
            selectedObject[attributeName] = value;
        });
    }

    /*helper function for shift+selecting frames*/
    _selectInBetweenFrames(selectedFrame) {
        var frameBounds = {
            playheadStart: null,
            playheadEnd: null,
        };

        // Calculate bounding box of all selected frames
        var selectedFrames = this.getSelectedObjects('Frame');
        selectedFrames.filter(frame => {
            return frame.parentLayer === selectedFrame.parentLayer;
        }).forEach(frame => {
            var start = frame.start;
            var end = frame.end;

            if (!frameBounds.playheadStart || !frameBounds.playheadEnd) {
                frameBounds.playheadStart = start;
                frameBounds.playheadEnd = end;
            }

            if (start < frameBounds.playheadStart) {
                frameBounds.playheadStart = start;
            }
            if (end > frameBounds.playheadEnd) {
                frameBounds.playheadEnd = end;
            }
        });

        // Select all frames inside bounding box
        this.project.activeTimeline.getAllFrames().filter(frame => {
            return !frame.isSelected &&
                frame.parentLayer === selectedFrame.parentLayer &&
                frame.inRange(frameBounds.playheadStart, frameBounds.playheadEnd)
        }).forEach(frame => {
            this._selectedObjectsUUIDs.push(frame.uuid);
        });
    }
}