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
 * Class representing a Wick Project.
 */
Wick.Project = class extends Wick.Base {
    /**
     * Create a project.
     * @param {string} name - Project name. Default "My Project".
     * @param {number} width - Project width in pixels. Default 720.
     * @param {number} height - Project height in pixels. Default 480.
     * @param {number} framerate - Project framerate in frames-per-second. Default 12.
     * @param {Color} backgroundColor - Project background color in hex. Default #ffffff.
     */
    constructor(args) {
        if (!args) args = {};
        super(args);

        this._name = args.name || 'My Project';
        this._width = args.width || 720;
        this._height = args.height || 480;
        this._framerate = args.framerate || 12;
        this._backgroundColor = args.backgroundColor || new Wick.Color('#ffffff');
        this._hitTestOptions = this.getDefaultHitTestOptions();

        this.pan = { x: 0, y: 0 };
        this._zoom = 1.0;
        this.rotation = 0.0;

        this._onionSkinEnabled = false;
        this.onionSkinSeekBackwards = 1;
        this.onionSkinSeekForwards = 1;

        this.selection = new Wick.Selection();
        this.history = new Wick.History();
        this.clipboard = new Wick.Clipboard();

        this.root = new Wick.Clip({ project: this });
        this.root._identifier = 'Project';

        this.focus = this.root;

        this._mousePosition = { x: 0, y: 0 };
        this._lastMousePosition = { x: 0, y: 0 };
        this._isMouseDown = false;
        this._internalErrorMessages = [];

        this.soundsPlayed = []; // List of all sounds that have been played during this play through of the project.

        this._mouseTargets = [];

        this._keysDown = [];
        this._keysLastDown = [];
        this._currentKey = null;

        this._tickIntervalID = null;

        this._hideCursor = false;
        this._muted = false;
        this._publishedMode = false; // Review the publishedMode setter for rules.
        this._showClipBorders = true;

        this._userErrorCallback = null;

        this._tools = {
            brush: new Wick.Tools.Brush(),
            cursor: new Wick.Tools.Cursor(),
            ellipse: new Wick.Tools.Ellipse(),
            eraser: new Wick.Tools.Eraser(),
            eyedropper: new Wick.Tools.Eyedropper(),
            fillbucket: new Wick.Tools.FillBucket(),
            interact: new Wick.Tools.Interact(),
            line: new Wick.Tools.Line(),
            none: new Wick.Tools.None(),
            pan: new Wick.Tools.Pan(),
            pathcursor: new Wick.Tools.PathCursor(),
            pencil: new Wick.Tools.Pencil(),
            rectangle: new Wick.Tools.Rectangle(),
            text: new Wick.Tools.Text(),
            zoom: new Wick.Tools.Zoom(),
        };
        for (var toolName in this._tools) {
            this._tools[toolName].project = this;
        }
        this.activeTool = 'cursor';

        this._toolSettings = new Wick.ToolSettings();
        this._toolSettings.onSettingsChanged((name, value) => {
            if (name === 'fillColor') {
                this.selection.fillColor = value.rgba;
            } else if (name === 'strokeColor') {
                this.selection.strokeColor = value.rgba;
            }
        });

        this._playing = false;

        this._scriptSchedule = [];
        this._error = null;

        this.history.project = this;
        this.history.pushState(Wick.History.StateType.ONLY_VISIBLE_OBJECTS);
    }

    /**
     * Prepares the project to be used in an editor.
     */
    prepareProjectForEditor () {
        this.project.resetCache();
        this.project.recenter();
        this.project.view.prerender();
        this.project.view.render();
    }

    /**
     * Used to initialize the state of elements within the project. Should only be called after
     * deserialization of project and all objects within the project.
     */
    initialize () {
        // Fixing all clip positions... This should be done in an internal method when the project is done loading...
        this.activeFrame && this.activeFrame.clips.forEach(clip => {
            clip.applySingleFramePosition();
        });
    }

    /**
     * Resets the cache and removes all unlinked items from the project.
     */
    resetCache () {
      Wick.ObjectCache.removeUnusedObjects(this);
    }

    /**
     * TODO: Remove all elements created by this project.
     */
    destroy () {
        this.guiElement.removeAllEventListeners();
    }

    _deserialize (data) {
        super._deserialize(data);

        this.name = data.name;
        this.width = data.width;
        this.height = data.height;
        this.framerate = data.framerate;
        this.backgroundColor = new Wick.Color(data.backgroundColor);

        this._focus = data.focus;

        this._hideCursor = false;
        this._muted = false;
        this._renderBlackBars = true;

        this._hitTestOptions = this.getDefaultHitTestOptions();

        // reset rotation, but not pan/zoom.
        // not resetting pan/zoom is convenient when preview playing.
        this.rotation = 0;
    }

    _serialize(args) {
        var data = super._serialize(args);

        data.name = this.name;
        data.width = this.width;
        data.height = this.height;
        data.backgroundColor = this.backgroundColor.rgba;
        data.framerate = this.framerate;

        data.onionSkinEnabled = this.onionSkinEnabled
        data.onionSkinSeekForwards = this.onionSkinSeekForwards;
        data.onionSkinSeekBackwards = this.onionSkinSeekBackwards;

        data.focus = this.focus.uuid;

        // Save some metadata which will eventually end up in the wick file
        data.metadata = Wick.WickFile.generateMetaData();

        return data;
    }

    getDefaultHitTestOptions() {
        return {mode: 'RECTANGLE', offset: true, overlap: true, intersections: false};
    }

    get classname() {
        return 'Project';
    }

    /**
     * Assign a function to be called when a user error happens (not script
     * errors - errors such as drawing tool errors, invalid selection props, etc)
     * @param {Function} fn - the function to call when errors happen
     */
    onError (fn) {
        this._userErrorCallback = fn;
    }

    /**
     * Called when an error occurs to forward to the onError function
     * @param {String} message - the message to display for the error
     */
    errorOccured (message) {
        if (this._userErrorCallback) this._userErrorCallback(message);
        this._internalErrorMessages.push(message);
    }

    /**
     * The width of the project.
     * @type {number}
     */
    get width() {
        return this._width;
    }

    set width(width) {
        if (typeof width !== 'number') return;
        if (width < 1) width = 1;
        if (width > 200000) width = 200000;
        this._width = width;
    }

    /**
     * The height of the project.
     * @type {number}
     */
    get height() {
        return this._height;
    }

    set height(height) {
        if (typeof height !== 'number') return;
        if (height < 1) height = 1;
        if (height > 200000) height = 200000;
        this._height = height;
    }

    /**
     * The framerate of the project.
     * @type {number}
     */
    get framerate() {
        return this._framerate;
    }

    set framerate(framerate) {
        if (typeof framerate !== 'number') return;
        if (framerate < 1) framerate = 1;
        if (framerate > 9999) framerate = 9999;
        this._framerate = framerate;
    }

    /**
     * The background color of the project.
     * @type {string}
     */
    get backgroundColor() {
        return this._backgroundColor;
    }

    set backgroundColor(backgroundColor) {
        this._backgroundColor = backgroundColor;
    }

    get hitTestOptions() {
        return this._hitTestOptions;
    }

    set hitTestOptions(options) {
        if (options) {
            if (options.mode === 'CIRCLE' || options.mode === 'RECTANGLE' || options.mode === 'CONVEX') {
                this._hitTestOptions.mode = options.mode;
            }
            if (typeof options.offset === 'boolean') {
                this._hitTestOptions.offset = options.offset;
            }
            if (typeof options.overlap === 'boolean') {
                this._hitTestOptions.overlap = options.overlap;
            }
            if (typeof options.intersections === 'boolean') {
                this._hitTestOptions.intersections = options.intersections;
            }
        }
    }

    /**
     * The timeline of the active clip.
     * @type {Wick.Timeline}
     */
    get activeTimeline() {
        return this.focus.timeline;
    }

    /**
     * The active layer of the active timeline.
     * @type {Wick.Layer}
     */
    get activeLayer() {
        return this.activeTimeline.activeLayer;
    }

    /**
     * The active frame of the active layer.
     * @type {Wick.Frame}
     */
    get activeFrame() {
        return this.activeLayer.activeFrame;
    }

    /**
     * The active frames of the active timeline.
     * @type {Wick.Frame[]}
     */
    get activeFrames() {
        return this.focus.timeline.activeFrames;
    }

    /**
     * All frames in this project.
     * @type {Wick.Frame[]}
     */
    getAllFrames() {
        return this.root.timeline.getAllFrames(true);
    }

    /**
     * The project selection.
     * @type {Wick.Selection}
     */
    get selection() {
        return this.getChild('Selection');
    }

    set selection(selection) {
        if (this.selection) {
            this.removeChild(this.selection);
        }
        this.addChild(selection);
    }

    /**
     * An instance of the Wick.History utility class for undo/redo functionality.
     * @type {Wick.History}
     */
    get history() {
        return this._history;
    }

    set history(history) {
        this._history = history;
    }

    /**
     * Value used to determine the zoom of the canvas.
     */
    get zoom () {
        return this._zoom;
    }

    set zoom(z) {
        const max = this.view.calculateFitZoom() * 10;
        const min = .10;
        this._zoom = Math.max(min, Math.min(max, z));
    }

    /**
     * Undo the last action.
     * @returns {boolean} true if there was something to undo, false otherwise.
     */
    undo() {
        // Undo discards in-progress brush strokes.
        if (this._tools.brush.isInProgress()) {
            this._tools.brush.discard();
            return true;
        }

        this.selection.clear();
        var success = this.project.history.popState();
        return success;
    }

    /**
     * Redo the last action that was undone.
     * @returns {boolean} true if there was something to redo, false otherwise.
     */
    redo() {
        this.selection.clear();
        var success = this.project.history.recoverState();
        return success;
    }

    /**
     * The assets belonging to the project.
     * @type {Wick.Asset[]}
     */
    get assets() {
        return this.getChildren(['ImageAsset', 'SoundAsset', 'ClipAsset', 'FontAsset', 'SVGAsset']);
    }

    /**
     * Adds an asset to the project.
     * @param {Wick.Asset} asset - The asset to add to the project.
     */
    addAsset(asset) {
        if (this.assets.indexOf(asset) === -1) {
            this.addChild(asset);
        }
    }

    /**
     * Removes an asset from the project. Also removes all instances of that asset from the project.
     * @param {Wick.Asset} asset - The asset to remove from the project.
     */
    removeAsset(asset) {
        asset.removeAllInstances();
        this.removeChild(asset);
    }

    /**
     * Retrieve an asset from the project by its UUID.
     * @param {string} uuid - The UUID of the asset to get.
     * @return {Wick.Asset} The asset
     */
    getAssetByUUID(uuid) {
        var asset = this.getAssets().find(asset => {
            return asset.uuid === uuid;
        });

        if (asset) {
            return asset;
        } else {
            console.warn('Wick.Project.getAssetByUUID: No asset found with uuid ' + uuid);
        }
    }

    /**
     * Retrieve an asset from the project by its name.
     * @param {string} name - The name of the asset to get.
     * @return {Wick.Asset} The asset
     */
    getAssetByName(name) {
        return this.getAssets().find(asset => {
            return asset.name === name;
        });
    }

    /**
     * The assets belonging to the project.
     * @param {string} type - Optional, filter assets by type ("Sound"/"Image"/"Clip"/"Button")
     * @returns {Wick.Asset[]} The assets in the project
     */
    getAssets(type) {
        if (!type) {
            return this.assets;
        } else {
            return this.assets.filter(asset => {
                return asset instanceof Wick[type + 'Asset'];
            });
        }
    }

    /**
     * A list of all "fontFamily" in the asset library.
     * @returns {string[]}
     */
    getFonts() {
        return this.getAssets('Font').map(asset => {
            return asset.fontFamily;
        });
    }

    /**
     * Check if a FontAsset with a given fontFamily exists in the project.
     * @param {string} fontFamily - The font to check for
     * @returns {boolean}
     */
    hasFont(fontFamily) {
        return this.getFonts().find(seekFontFamily => {
            return seekFontFamily === fontFamily;
        }) !== undefined;
    }

    /**
     * The root clip.
     * @type {Wick.Clip}
     */
    get root() {
        return this.getChild('Clip');
    }

    set root(root) {
        if (this.root) {
            this.removeChild(this.root);
        }
        this.addChild(root);
    }

    /**
     * The currently focused clip.
     * @type {Wick.Clip}
     */
    get focus() {
        return this._focus && Wick.ObjectCache.getObjectByUUID(this._focus);
    }

    set focus(focus) {
        var focusChanged = this.focus !== null && this.focus !== focus;

        this._focus = focus.uuid;

        if (focusChanged) {
            this.selection.clear();

            // Reset timelines of subclips of the newly focused clip
            focus.timeline.clips.forEach(subclip => {
                subclip.timeline.playheadPosition =  1;
                subclip.applySingleFramePosition(); // Make sure to visualize single frame clips properly.
            });

            // Reset pan and zoom and clear selection on focus change
            this.resetZoomAndPan();
        } else {
            // Make sure the single frame
            focus.timeline.clips.forEach(subclip => {
                subclip.applySingleFramePosition();
            });
        }


    }

    /**
     * The position of the mouse
     * @type {object}
     */
    get mousePosition() {
        return this._mousePosition;
    }

    set mousePosition(mousePosition) {
        this._lastMousePosition = { x: this.mousePosition.x, y: this.mousePosition.y };
        this._mousePosition = mousePosition;
    }

    /**
     * The amount the mouse has moved in the last tick
     * @type {object}
     */
    get mouseMove() {
        let moveX = this.mousePosition.x - this._lastMousePosition.x;
        let moveY = this.mousePosition.y - this._lastMousePosition.y;
        return { x: moveX, y: moveY };
    }

    /**
     * Determine if the mouse is down.
     * @type {boolean}
     */
    get isMouseDown() {
        return this._isMouseDown;
    }

    set isMouseDown(isMouseDown) {
        this._isMouseDown = isMouseDown;
    }

    /**
     * The keys that are currenty held down.
     * @type {string[]}
     */
    get keysDown() {
        return this._keysDown;
    }

    set keysDown(keysDown) {
        this._keysDown = keysDown;
    }

    /**
     * The keys were just pressed (i.e., are currently held down, but were not last tick).
     * @type {string[]}
     */
    get keysJustPressed() {
        // keys that are in _keysDown, but not in _keysLastDown
        return this._keysDown.filter(key => {
            return this._keysLastDown.indexOf(key) === -1;
        });
    }

    /**
     * The keys that were just released (i.e. were down last tick back are no longer down.)
     * @return {string[]}
     */
    get keysJustReleased() {
        return this._keysLastDown.filter(key => {
            return this._keysDown.indexOf(key) === -1;
        });
    }

    /**
     * Check if a key is being pressed.
     * @param {string} key - The name of the key to check
     */
    isKeyDown(key) {
        return this.keysDown.indexOf(key) !== -1;
    }

    /**
     * Check if a key was just pressed.
     * @param {string} key - The name of the key to check
     */
    isKeyJustPressed(key) {
        return this.keysJustPressed.indexOf(key) !== -1;
    }

    /**
     * The key to be used in the global 'key' variable in the scripting API. Update currentKey before you run any key script.
     * @type {string[]}
     */
    get currentKey() {
        return this._currentKey;
    }

    set currentKey(currentKey) {
        this._currentKey = currentKey;
    }

    /**
     * Creates an asset from a File object and adds that asset to the project.
     * @param {File} file - File object to be read and converted into an asset.
     * @param {function} callback Function with the created Wick Asset. Can be passed undefined on improper file input.
     */
    importFile(file, callback) {
        let imageTypes = Wick.ImageAsset.getValidMIMETypes();
        let soundTypes = Wick.SoundAsset.getValidMIMETypes();
        let fontTypes = Wick.FontAsset.getValidMIMETypes();
        let clipTypes = Wick.ClipAsset.getValidMIMETypes();
        let svgTypes = Wick.SVGAsset.getValidMIMETypes();

        let imageExtensions = Wick.ImageAsset.getValidExtensions();
        let soundExtensions = Wick.SoundAsset.getValidExtensions();
        let fontExtensions = Wick.FontAsset.getValidExtensions();
        let clipExtensions = Wick.ClipAsset.getValidExtensions();
        let svgExtensions = Wick.SVGAsset.getValidExtensions();

        // Fix missing mimetype for wickobj files
        var type = file.type;
        
        if (file.type === '' && file.name.endsWith('.wickobj')) {
            type = 'application/json';
        }
        
        var extension = "";
        
        if (file.name) {
            extension = file.name.split('.').pop();
        } else if (file.file && typeof file.file === 'string') {
            extension = file.file.split('.').pop();
        }

        let asset = undefined;
        if (imageTypes.indexOf(type) !== -1 || imageExtensions.indexOf(extension) !== -1) {
            asset = new Wick.ImageAsset();
        } else if (soundTypes.indexOf(type) !== -1 || soundExtensions.indexOf(extension) !== -1) {
            asset = new Wick.SoundAsset();
        } else if (fontTypes.indexOf(type) !== -1 || fontExtensions.indexOf(extension) !== -1) {
            asset = new Wick.FontAsset();
        } else if (clipTypes.indexOf(type) !== -1 || clipExtensions.indexOf(extension) !== -1) {
            asset = new Wick.ClipAsset();
        } else if (svgTypes.indexOf(type) !== -1 || svgExtensions.indexOf(extension) !== -1) {
            asset = new Wick.SVGAsset();
        }

        if (asset === undefined) {
            console.warn('importFile(): Could not import file ' + file.name + ', filetype: "' + file.type + '" is not supported.');
            console.warn('Supported File Types Are:', {
                image: imageTypes, 
                sound: soundTypes,
                font: fontTypes,
                clip: clipTypes,
                svg: svgTypes
            });
            console.warn('Supported File Extensions Are', {
                image: imageExtensions,
                sound: soundExtensions,
                font: fontExtensions,
                clip: clipExtensions,
                svg: svgExtensions,
            })
            callback(null);
            return;
        }

        let reader = new FileReader();

        reader.onload = () => {
            let dataURL = reader.result;
            asset.src = dataURL;
            asset.filename = file.name;
            asset.name = file.name;
            this.addAsset(asset);
            asset.load(() => {
                callback(asset);
            });
        }

        reader.readAsDataURL(file);
    }

    /**
     * True if onion skinning is on. False otherwise.
     */
    get onionSkinEnabled () {
        return this._onionSkinEnabled;
    }

    set onionSkinEnabled (bool) {
        if (typeof bool !== "boolean") return;

        // Get all onion skinned frames, if we're turning off onion skinning.
        let onionSkinnedFrames = [];
        if (!bool) onionSkinnedFrames = this.getAllOnionSkinnedFrames();

        this._onionSkinEnabled = bool;

        // Rerender any onion skinned frames.
        onionSkinnedFrames.forEach(frame => {
            frame.view.render();
        });
    }

    /**
     * Returns all frames that should currently be onion skinned.
     * @returns {Wick.Frame[]} Array of Wick frames that sould be onion skinned.
     */
    getAllOnionSkinnedFrames () {
        let onionSkinnedFrames = [];
        this.activeTimeline.layers.forEach(layer => {
            let frames = layer.frames.filter(frame => {
                return frame.onionSkinned;
            });

            onionSkinnedFrames = onionSkinnedFrames.concat(frames);
        });

        return onionSkinnedFrames;
    }

    /**
     * Deletes all objects in the selection.
     */
    deleteSelectedObjects() {
        var objects = this.selection.getSelectedObjects();

        this.selection.clear();

        this.activeTimeline.deferFrameGapResolve();
        objects.forEach(object => {
            if (object.remove) {
                object.remove();
            }
            else if (['ImageAsset', 'SoundAsset', 'ClipAsset', 'FontAsset', 'SVGAsset'].indexOf(object.classname) !== -1) {
                this.removeAsset(object);
            }
        });
        this.activeTimeline.resolveFrameGaps([]);
    }

    /**
     * Perform a boolean operation on all selected paths.
     * @param {string} booleanOpName - The name of the boolean op function to use. See Wick.Path.booleanOp.
     */
    doBooleanOperationOnSelection(booleanOpName) {
        var paths = this.selection.getSelectedObjects('Path');
        this.selection.clear();
        var booleanOpResult = Wick.Path.booleanOp(paths, booleanOpName);

        paths.forEach(path => {
            // Don't remove the topmost path if performing subtration
            if (paths.indexOf(path) === paths.length - 1 && booleanOpName === 'subtract') {
                return;
            }
            path.remove();
        });

        this.activeFrame.addPath(booleanOpResult);
        this.selection.select(booleanOpResult);
    }

    /**
     * Copy the contents of the selection to the clipboard.
     * @returns {boolean} True if there was something to copy, false otherwise
     */
    copySelectionToClipboard() {
        var objects = this.selection.getSelectedObjects();
        if (objects.length === 0) {
            return false;
        } else {
            this.clipboard.copyObjectsToClipboard(this, objects);
            return true;
        }
    }

    /**
     * Copy the contents of the selection to the clipboard, and delete what was copied.
     * @returns {boolean} True if there was something to cut, false otherwise
     */
    cutSelectionToClipboard() {
        if (this.copySelectionToClipboard()) {
            this.deleteSelectedObjects();
            return true;
        } else {
            return false;
        }
    }

    /**
     * Paste the contents of the clipboard into the project.
     * @returns {boolean} True if there was something to paste in the clipboard, false otherwise.
     */
    pasteClipboardContents() {
        return this.clipboard.pasteObjectsFromClipboard(this);
    }

    /**
     * Copy and paste the current selection.
     * @returns {boolean} True if there was something to duplicate, false otherwise
     */
    duplicateSelection() {
        if (!this.copySelectionToClipboard()) {
            return false;
        } else {
            return this.pasteClipboardContents();
        }
    }

    /**
     * Move the current selection above, below, or inside target.
     * @param {object} target - The target object (to become parent of selection)
     * @param {number} index - index to insert at
     * @returns {boolean} - true if project did change
     */
    moveSelection(target, index) {
        // Indices give us a way to order the selection from top to bottom
        let get_indices = (obj) => {
            var indices = [];
            while (obj.parent !== null) {
                let parent = obj.parent;
                if (parent.classname === 'Frame') {
                    indices.unshift(parent.getChildren().length - 1 - parent.getChildren().indexOf(obj));
                }
                else {
                    indices.unshift(parent.getChildren().indexOf(obj));
                }
                obj = parent;
            }
            return indices;
        }
        // Assumes i1, i2 same length, ordering same as outliner
        let compare_indices = (i1, i2) => {
            for (let i = 0; i < i1.length; i++) {
                if (i1[i] < i2[i]) {
                    return 1;
                }
                else if (i1[i] > i2[i]) {
                    return -1;
                }
            }
            return 0;
        }

        let selection = this.selection.getSelectedObjects()
        if (selection.length === 0) {
            return false;
        }
        let selection_indices = selection.map(get_indices);
        let l = selection_indices[0].length;
        for (let i = 0; i < selection_indices.length; i++) {
            if (selection_indices[i].length !== l) {
                // Must all have the same depth
                return false;
            }
        }
        let zip = selection_indices.map((o, i) => {return [o, selection[i]]});
        zip.sort(([i1,], [i2,]) => compare_indices(i1,i2));
        if (target.classname === 'Frame') {
            // Render order is reversed for children of frames
            zip.reverse();
        }
        for (let i = 0; i < zip.length; i++) {
            let [, obj] = zip[i];
            index -= target.insertChild(obj, index) ? 1 : 0;
        }
        return true;
    }

    /**
     * Cut the currently selected frames.
     */
    cutSelectedFrames() {
        this.selection.getSelectedObjects('Frame').forEach(frame => {
            frame.cut();
        });
    }

    /**
     * Inserts a blank frame into the timeline at the position of the playhead.
     * If the playhead is over an existing frame, that frame will be cut in half,
     * and a blank frame will be added to fill the empty space created by the cut.
     */
    insertBlankFrame() {
        var playheadPosition = this.activeTimeline.playheadPosition;
        var newFrames = [];

        // Insert new frames
        if (this.selection.numObjects > 0) {
            // Insert frames on all frames that are both active and selected
            /*this.activeTimeline.activeFrames.filter(frame => {
                return frame.isSelected;
            }).forEach(frame => {
                newFrames.push(frame.parentLayer.insertBlankFrame(playheadPosition));
            });*/
            this.selection.getSelectedObjects('Frame').forEach(frame => {
                newFrames.push(frame.parentLayer.insertBlankFrame(playheadPosition));
            });
        } else {
            // Insert one frame on the active layer
            newFrames.push(this.activeLayer.insertBlankFrame(playheadPosition));
        }

        // Select the newly added frames
        this.selection.clear();
        newFrames.forEach(frame => {
            this.selection.select(frame);
        });
    }

    /**
     * A tween can be created if frames are selected or if there is a frame under the playhead on the active layer.
     */
    get canCreateTween() {
        // Frames are selected, a tween can be created
        var selectedFrames = this.selection.getSelectedObjects('Frame');
        if (selectedFrames.length > 0) {
            // Make sure you can only create tweens on contentful frames
            if (selectedFrames.find(frame => {
                    return !frame.contentful;
                })) {
                return false
            } else {
                return true;
            }
        }

        // There is a frame under the playhead on the active layer, a tween can be created
        var activeFrame = this.activeLayer.activeFrame;
        if (activeFrame) {
            // ...but only if that frame is contentful
            return activeFrame.contentful;
        }

        return false;
    }

    /**
     * Create a new tween on all selected frames OR on the active frame of the active layer.
     */
    createTween() {
        var selectedFrames = this.selection.getSelectedObjects('Frame');
        if (selectedFrames.length > 0) {
            // Create a tween on all selected frames
            this.selection.getSelectedObjects('Frame').forEach(frame => {
                frame.createTween();
            });
        } else {
            // Create a tween on the active frame
            this.activeLayer.activeFrame.createTween();
        }
    }

    /**
     * Tries to create a tween if there is an empty space between tweens.
     */
    tryToAutoCreateTween() {
        var frame = this.activeFrame;
        if (frame.tweens.length > 0 && !frame.getTweenAtPosition(frame.getRelativePlayheadPosition())) {
            frame.createTween();
        }
    }

    /**
     * Move the right edge of all frames right one frame.
     */
    extendFrames(frames) {
        frames.forEach(frame => {
            frame.end++;
        });
        this.activeTimeline.resolveFrameOverlap(frames);
        this.activeTimeline.resolveFrameGaps(frames);
    }

    /**
     * Move the right edge of all frames right one frame, and push other frames away.
     */
    extendFramesAndPushOtherFrames(frames) {
        frames.forEach(frame => {
            frame.extendAndPushOtherFrames();
        });
    }

    /**
     * Move the right edge of all frames left one frame.
     */
    shrinkFrames(frames) {
        frames.forEach(frame => {
            if (frame.length === 1) return;
            frame.end--;
        });
        this.activeTimeline.resolveFrameOverlap(frames);
        this.activeTimeline.resolveFrameGaps(frames);
    }

    /**
     * Move the right edge of all frames left one frame, and pull other frames along.
     */
    shrinkFramesAndPullOtherFrames(frames) {
        frames.forEach(frame => {
            frame.shrinkAndPullOtherFrames();
        });
    }

    /**
     * Shift all selected frames over one frame to the right
     */
    moveSelectedFramesRight() {
        var frames = this.selection.getSelectedObjects('Frame');
        frames.forEach(frame => {
            frame.end++;
            frame.start++;
        });
        this.activeTimeline.resolveFrameOverlap(frames);
        this.activeTimeline.resolveFrameGaps();
    }

    /**
     * Shift all selected frames over one frame to the left
     */
    moveSelectedFramesLeft() {
        var frames = this.selection.getSelectedObjects('Frame');
        frames.forEach(frame => {
            frame.start--;
            frame.end--;
        });
        this.activeTimeline.resolveFrameOverlap(frames);
        this.activeTimeline.resolveFrameGaps();
    }

    /**
     * Selects all objects that are visible on the canvas (excluding locked layers and onion skinned objects)
     */
    selectAll() {
        this.selection.clear();
        this.activeFrames.filter(frame => {
            return !frame.parentLayer.locked &&
                !frame.parentLayer.hidden;
        }).forEach(frame => {
            frame.paths.forEach(path => {
                this.selection.select(path);
            });
            frame.clips.forEach(clip => {
                this.selection.select(clip);
            });
        });
    }

    /**
     * Adds an image path to the active frame using a given asset as its image src.
     * @param {Wick.Asset} asset - the asset to use for the image src
     * @param {number} x - the x position to create the image path at
     * @param {number} y - the y position to create the image path at
     * @param {function} callback - the function to call after the path is created.
     */
    createImagePathFromAsset(asset, x, y, callback) {
        asset.createInstance(path => {
            this.activeFrame.addPath(path);
            path.x = x;
            path.y = y;
            callback(path);
        });
    }

    /**
     * Adds an instance of a clip asset to the active frame.
     * @param {Wick.Asset} asset - the asset to create the clip instance from
     * @param {number} x - the x position to create the image path at
     * @param {number} y - the y position to create the image path at
     * @param {function} callback - the function to call after the path is created.
     */
    createClipInstanceFromAsset(asset, x, y, callback) {
        asset.createInstance(clip => {
            this.activeFrame.addPath(clip);
            clip.x = x;
            clip.y = y;
            callback(clip);
        }, this);
    }

    /**
     * Adds an instance of a clip asset to the active frame.
     * @param {Wick.Asset} asset - the asset to create the SVG file instance from
     * @param {number} x - the x position to import the SVG file at
     * @param {number} y - the y position to import the SVG file at
     * @param {function} callback - the function to call after the path is created.
     */
    createSVGInstanceFromAsset(asset, x, y, callback) {
        asset.createInstance(svg => {
            this.addObject(svg);
            svg.x = x;
            svg.y = y;
            //this.addObject(svg);
            callback(svg);
        });
    }

    /**
     * Creates a symbol from the objects currently selected.
     * @param {string} identifier - the identifier to give the new symbol
     * @param {string} type - "Clip" or "Button"
     */
    createClipFromSelection(args) {
        if (!args) {
            args = {};
        };

        if (args.type !== 'Clip' && args.type !== 'Button') {
            console.error('createClipFromSelection: invalid type: ' + args.type);
            return;
        }

        let clip;

        if (args.type === 'Button') {
            clip = new Wick[args.type]({
                identifier: args.identifier,
                transformation: new Wick.Transformation({
                    x: this.selection.x + this.selection.width / 2,
                    y: this.selection.y + this.selection.height / 2,
                }),
                objects: this.selection.getSelectedObjects('Canvas')
            });
        } else {
            clip = new Wick[args.type]({
                identifier: args.identifier,
                transformation: new Wick.Transformation({
                    x: this.selection.x + this.selection.width / 2,
                    y: this.selection.y + this.selection.height / 2,
                })
            });
            clip.addObjects(this.selection.getSelectedObjects('Canvas'));
        }

        // Add the clip to the frame prior to adding objects.
        this.activeFrame.addClip(clip);

        // TODO add to asset library
        this.selection.clear();
        this.selection.select(clip);
    }

    /**
     * Breaks selected clips into their children clips and paths.
     */
    breakApartSelection() {
        var leftovers = [];
        var clips = this.selection.getSelectedObjects('Clip');

        this.selection.clear();

        clips.forEach(clip => {
            leftovers = leftovers.concat(clip.breakApart());
        });

        leftovers.forEach(object => {
            this.selection.select(object);
        });
    }

    /**
     * Sets the project focus to the timeline of the selected clip.
     * @returns {boolean} True if selected clip is focused, false otherwise.
     */
    focusTimelineOfSelectedClip() {
        if (this.selection.getSelectedObject() instanceof Wick.Clip) {
            this.focus = this.selection.getSelectedObject();
            return true;
        }
        return false;
    }

    /**
     * Sets the project focus to the parent timeline of the currently focused clip.
     * @returns {boolean} True if parent clip is focused, false otherwise.
     */
    focusTimelineOfParentClip() {
        if (!this.focus.isRoot) {
            this.focus = this.focus.parentClip;
            return true;
        }
        return false;
    }

    /**
     * Plays the sound in the asset library with the given name.
     * @param {string} assetName - Name of the sound asset to play
     * @param {Object} options - options for the sound. See Wick.SoundAsset.play
     */
    playSound(assetName, options) {
        var asset = this.getAssetByName(assetName);

        if(!asset) {
            console.warn('playSound(): No asset with name: "' + assetName + '"');
        } else if (!(asset instanceof Wick.SoundAsset)) {
            console.warn('playSound(): Asset is not a sound: "' + assetName + '"');
        } else {
            return this.playSoundFromAsset(asset, options);
        }

    }

    /**
     * Generates information for a single sound that is being played.
     * @param {Wick.Asset} asset - Asset to be played.
     * @param {Object} options - Options including start (ms), end (ms), offset (ms), src (sound source), filetype (string).
     */
    generateSoundInfo (asset, options) {
        if (!asset) return {};
        if (!options) options = {};

        let playheadPosition = this.focus.timeline.playheadPosition;

        let soundStartMS = (1000/this.framerate) * (playheadPosition - 1); // Adjust by one to account for sounds on frame 1 starting at 0ms.
        let soundEndMS = 0;
        let seekMS = options.seekMS || 0;

        if (options.frame) {
            let soundLengthInFrames = options.frame.end - (options.frame.start - 1);
            soundEndMS = soundStartMS +  (1000/this.framerate) * soundLengthInFrames;
        } else {
            soundEndMS = soundStartMS + asset.duration * 1000;
        }

        let soundInfo = {
            playheadPosition: playheadPosition,
            start: soundStartMS,
            end: soundEndMS,
            offset: seekMS,
            src: asset.src,
            filetype: asset.fileExtension,
            name: asset.name,
            volume: options.volume || 1,
            playedFrom: options.playedFrom || undefined, // uuid of object that played the sound.
        }

        return soundInfo
    }

    /**
     * Plays a sound from a presented asset.
     * @param {Wick.SoundAsset} asset - Name of the sound asset to play.
     */
    playSoundFromAsset (asset, options) {
        let soundInfo = this.generateSoundInfo(asset, options);
        this.soundsPlayed.push(soundInfo);
        return asset.play(options);
    }

    /**
     * Stops sound(s) currently playing.
     * @param {string} assetName - The name of the SoundAsset to stop.
     * @param {number} id - (optional) The ID of the sound to stop. Returned by playSound. If an ID is not given, all instances of the given sound asset will be stopped.
     */
    stopSound(id) {
        var asset = this.getAssetByName(assetName);
        if (!asset) {
            console.warn('stopSound(): No asset with name: "' + assetName + '"');
        } else if (!(asset instanceof Wick.SoundAsset)) {
            console.warn('stopSound(): Asset is not a sound: "' + assetName + '"');
        } else {
            return asset.stop(id);
        }
    }

    /**
     * Stops all sounds playing from frames and sounds played using playSound().
     */
    stopAllSounds() {
        // Stop all sounds started with Wick.Project.playSound();
        this.getAssets('Sound').forEach(soundAsset => {
            soundAsset.stop();
        });

        // Stop all sounds on frames
        this.getAllFrames().forEach(frame => {
            frame.stopSound();
        });
    }

    /**
     * Disable all sounds from playing
     */
    mute() {
        this._muted = true;
    }

    /**
     * Enable all sounds to play
     */
    unmute() {
        this._muted = false;
    }

    /**
     * Is the project currently muted?
     * @type {boolean}
     */
    get muted() {
        return this._muted;
    }

    /**
     * Should the project render black bars around the canvas area?
     * (These only show up if the size of the window/element that the project
     * is inside is a different size than the project dimensions).
     * @type {boolean}
     */
    get renderBlackBars () {
        return this._renderBlackBars;
    }

    set renderBlackBars (renderBlackBars) {
        this._renderBlackBars = renderBlackBars;
    }

    /**
     * In "Published Mode", all layers will be rendered even if they are set to be hidden.
     * This is enabled during GIF/Video export, and enabled when the project is run standalone.
     * @type {boolean}
     */
    get publishedMode() {
        return this._publishedMode;
    }

    set publishedMode (publishedMode) {
        let validModes = [false, "interactive", "imageSequence", "audioSequence"];

        if (validModes.indexOf(publishedMode) === -1) {
            throw new Error("Published Mode: " + publishedMode + " is invalid. Must be one of type: " + validModes);
        }

        this._publishedMode = publishedMode;
    }

    /**
     * Returns true if the project is published, false otherwise.
     */
    get isPublished () {
        return this.publishedMode !== false;
    }

    /**
     * Toggle whether or not to render borders around clips.
     * @type {boolean}
     */
    get showClipBorders() {
        return this._showClipBorders;
    }

    set showClipBorders(showClipBorders) {
        this._showClipBorders = showClipBorders;
    }

    /**
     * The current error, if one was thrown, during the last tick.
     * @type {Object}
     */
    get error() {
        return this._error;
    }

    set error (error) {
        if (this._error && error) {
            return;
        } else if (error && !this._error) {
            console.error(error);
        }

        this._error = error;
    }

    /**
     * Schedules a script to be run at the end of the current tick.
     * @param {string} uuid - the UUID of the object running the script.
     * @param {string} name - the name of the script to run, see Tickable.possibleScripts.
     * @param {Object} parameters - An object of key,value pairs to send as parameters to the script which runs.
     */
    scheduleScript (uuid, name, parameters) {
        this._scriptSchedule.push({
            uuid: uuid,
            name: name,
            parameters: parameters,
        });
    }

    /**
     * Run scripts in schedule, in order based on Tickable.possibleScripts.
     */
    runScheduledScripts () {
        this._error = null;
        Wick.Tickable.possibleScripts.forEach(scriptOrderName => {
            this._scriptSchedule.forEach(scheduledScript => {
                var {uuid, name, parameters} = scheduledScript;

                // Make sure we only run the script based on the current iteration through possibleScripts
                if (name !== scriptOrderName) {
                    return;
                }

                // Run the script on the corresponding object!
                Wick.ObjectCache.getObjectByUUID(uuid).runScript(name, parameters);
            });
        });
    }

    /**
     * Checks if the project is currently playing.
     * @type {boolean}
     */
    get playing() {
        return this._playing;
    }

    /**
     * Start playing the project.
     * Arguments: onError: Called when a script error occurs during a tick.
     *            onBeforeTick: Called before every tick
     *            onAfterTick: Called after every tick
     * @param {object} args - Optional arguments
     */
    play(args) {
        if (!args) args = {};
        if (!args.onError) args.onError = () => {};
        if (!args.onBeforeTick) args.onBeforeTick = () => {};
        if (!args.onAfterTick) args.onAfterTick = () => {};

        window._scriptOnErrorCallback = args.onError;

        this._playing = true;
        this.view.paper.view.autoUpdate = false;

        if (this._tickIntervalID) {
            this.stop();
        }

        this.history.saveSnapshot('state-before-play');

        this.selection.clear();

        // Start tick loop
        this._tickIntervalID = setInterval(() => {
            args.onBeforeTick();

            this.tools.interact.determineMouseTargets();
            var error = this.tick();
            this.view.paper.view.update();
            if(error) {
                this.stop();
                return;
            }

            args.onAfterTick();
        }, 1000 / this.framerate);
    }

    /**
     * Ticks the project.
     * @returns {object} An object containing information about an error, if one occured while running scripts. Null otherwise.
     */
    tick () {
        this.root._identifier = 'Project';

        // Process input
        this._mousePosition = this.tools.interact.mousePosition;
        this._isMouseDown = this.tools.interact.mouseIsDown;

        this._keysDown = this.tools.interact.keysDown;
        this._currentKey = this.tools.interact.lastKeyDown;

        this._mouseTargets = this.tools.interact.mouseTargets;

        // Reset scripts before ticking
        this._scriptSchedule = [];

        // Tick the focused clip
        this.focus._attachChildClipReferences();

        this.focus.tick();

        this.runScheduledScripts();

        // Save the current keysDown
        this._lastMousePosition = {x: this._mousePosition.x, y: this._mousePosition.y};
        this._keysLastDown = [].concat(this._keysDown);

        this.view.render();

        if(this._error) {
            return this._error;
        } else {
            return null;
        }
    }

    /**
     * Stop playing the project.
     */
    stop() {
        this._playing = false;
        this.view.paper.view.autoUpdate = true;

        // Run unload scripts on all objects
        this.getAllFrames().forEach(frame => {
            frame.clips.forEach(clip => {
                clip.scheduleScript('unload');
            });
        });
        this.runScheduledScripts();

        this.stopAllSounds();

        clearInterval(this._tickIntervalID);
        this._tickIntervalID = null;

        // Loading the snapshot to restore project state also moves the playhead back to where it was originally.
        // We actually don't want this, preview play should actually move the playhead after it's stopped.
        var currentPlayhead = this.focus.timeline.playheadPosition;

        // Load the state of the project before it was played
        this.history.loadSnapshot('state-before-play');
        // Wick.ObjectCache.removeUnusedObjects(this);

        if (this.error) {
            // An error occured.
            var errorObjUUID = this._error.uuid;
            var errorObj = Wick.ObjectCache.getObjectByUUID(errorObjUUID);

            // Focus the parent of the object that caused the error so that we can select the error-causer.
            this.focus = errorObj.parentClip;

            // Select the object that caused the error
            this.selection.clear();
            this.selection.select(errorObj);

            window._scriptOnErrorCallback && window._scriptOnErrorCallback(this.error);
        } else {
            this.focus.timeline.playheadPosition = currentPlayhead;
        }

        this.resetCache();

        delete window._scriptOnErrorCallback;
    }

    /**
     * Inject the project into an element on a webpage and start playing the project.
     * @param {Element} element - the element to inject the project into
     */
    inject(element) {
        this.view.canvasContainer = element;
        this.view.fitMode = 'fill';
        this.view.canvasBGColor = this.backgroundColor.hex;

        window.onresize = function() {
            project.view.resize();
        }
        this.view.resize();
        this.view.prerender();

        this.focus = this.root;
        this.focus.timeline.playheadPosition = 1;

        this.publishedMode = "interactive";
        this.play({
            onAfterTick: (() => {
                this.view.render();
            }),
            onError: (error => {
                console.error('Project threw an error!');
                console.error(error);
            }),
        });
    }

    /**
     * Sets zoom and pan such that the canvas fits in the window, with some padding.
     */
    recenter () {
        this.pan = {x: 0, y: 0};

        var paddingResize = 0.96;
        this.zoom = this.view.calculateFitZoom();
        this.zoom *= paddingResize;
    }

    /**
     * Resets zoom and pan (zoom resets to 1.0, pan resets to (0,0)).
     */
    resetZoomAndPan () {
        this.pan = {x: 0, y: 0};
        this.zoom = 1;
    }

    /**
     * Zooms the canvas in.
     */
    zoomIn() {
        this.zoom *= 1.25;
    }

    /**
     * Zooms the canvas out.
     */
    zoomOut() {
        this.zoom *= 0.8;
    }

    /**
     * All tools belonging to the project.
     * @type {Array<Wick.Tool>}
     */
    get tools() {
        return this._tools;
    }

    /**
     * The tool settings for the project's tools.
     * @type {Wick.ToolSettings}
     */
    get toolSettings() {
        return this._toolSettings;
    }

    /**
     * The currently activated tool.
     * @type {Wick.Tool}
     */
    get activeTool() {
        return this._activeTool;
    }

    set activeTool(activeTool) {
        var newTool;

        if (typeof activeTool === 'string') {
            var tool = this.tools[activeTool];
            if (!tool) {
                console.error('set activeTool: invalid tool: ' + activeTool);
            }
            newTool = tool;
        } else {
            newTool = activeTool;
        }

        // Clear selection if we changed between drawing tools
        if (newTool.name !== 'pan' &&
            newTool.name !== 'eyedropper' &&
            newTool.name !== 'cursor') {
            this.selection.clear();
        }

        this._activeTool = newTool;
    }

    /**
     * Returns an object associated with this project, by uuid.
     * @param {string} uuid 
     */
    getObjectByUUID(uuid) {
        return Wick.ObjectCache.getObjectByUUID(uuid);
    }

    /**
     * Adds an object to the project.
     * @param {Wick.Base} object
     * @return {boolean} returns true if the obejct was added successfully, false otherwise.
     */
    addObject(object) {
        if (object instanceof Wick.Path) {
            this.activeFrame.addPath(object);
        } else if (object instanceof Wick.Clip) {
            this.activeFrame.addClip(object);
        } else if (object instanceof Wick.Frame) {
            this.activeTimeline.addFrame(object);
        } else if (object instanceof Wick.Asset) {
            this.addAsset(object);
        } else if (object instanceof Wick.Layer) {
            this.activeTimeline.addLayer(object);
        } else if (object instanceof Wick.Tween) {
            this.activeTimeline.addTween(object);
        } else {
            return false;
        }
        return true;
    }


    /**
     * Create a sequence of images from every frame in the project.
     * @param {object} args - Options for generating the image sequence
     * @param {string} imageType - MIMEtype to use for rendered images. Defaults to 'image/png'.
     * @param {function} onProgress - Function to call for each image loaded, useful for progress bars
     * @param {function} onFinish - Function to call when the images are all loaded.
     */
    generateImageSequence (args) {
        if(!args) args = {};
        if(!args.imageType) args.imageType = 'image/png';
        if(!args.onProgress) args.onProgress = () => {};
        if(!args.onFinish) args.onFinish = () => {};
        if(!args.width) args.width = this.width;
        if(!args.height) args.height = this.height;

        

        var renderCopy = this;
        renderCopy.renderBlackBars = true; // Turn off black bars (removes black lines)

        var oldCanvasContainer = this.view.canvasContainer;

        this.history.saveSnapshot('before-gif-render');
        this.mute();
        this.selection.clear();
        this.publishedMode = "imageSequence";
        // this.tick();

        // Put the project canvas inside a div that's the same size as the project so the frames render at the correct resolution.
        let container = window.document.createElement('div');

        container.style.width  = (args.width/window.devicePixelRatio)+'px';
        container.style.height = (args.height/window.devicePixelRatio)+'px';
        window.document.body.appendChild(container);
        renderCopy.view.canvasContainer = container;
        renderCopy.view.resize();

        // Calculate the zoom needed to fit the project into the requested container width/height
        var zoom = 1;
        if (args.height < args.width) {
            zoom = args.height / this.height;
        } else {
            zoom = args.width / this.width;
        }

        // Set the initial state of the project.
        renderCopy.focus = renderCopy.root;
        renderCopy.focus.timeline.playheadPosition = 1;
        renderCopy.onionSkinEnabled = false;
        renderCopy.zoom = zoom / window.devicePixelRatio;
        renderCopy.pan = {x: 0, y: 0};

        // renderCopy.tick();

        // We need full control over when paper.js renders, if we leave autoUpdate on, it's possible to lose frames if paper.js doesnt automatically render as fast as we are generating the images.
        // (See paper.js docs for info about autoUpdate)
        renderCopy.view.paper.view.autoUpdate = false;

        var frameImages = [];
        var numMaxFrameImages = renderCopy.focus.timeline.length;
        var renderFrame = () => {
            var frameImage = new Image();

            frameImage.onload = () => {
                frameImages.push(frameImage);

                var currentPos = renderCopy.focus.timeline.playheadPosition;
                args.onProgress(currentPos, numMaxFrameImages);

                if (currentPos >= numMaxFrameImages) {
                    // reset autoUpdate back to normal
                    renderCopy.view.paper.view.autoUpdate = true;

                    this.view.canvasContainer = oldCanvasContainer;
                    this.view.resize();

                    this.history.loadSnapshot('before-gif-render');
                    this.publishedMode = false;
                    this.view.render();

                    window.document.body.removeChild(container);

                    args.onFinish(frameImages);
                } else {
                    var oldPlayhead = renderCopy.activeTimeline.playheadPosition
                    renderCopy.tick();
                    renderCopy.activeTimeline.playheadPosition = oldPlayhead + 1;
                    renderFrame();
                }
            }

            renderCopy.view.render();
            renderCopy.view.paper.view.update();
            frameImage.src = renderCopy.view.canvas.toDataURL(args.imageType);
        }

        this.resetSoundsPlayed();
        renderFrame();
    }

    resetSoundsPlayed () {
        this.soundsPlayed = [];
    }

    /**
     * Play the project through to generate an audio track.
     */
    generateAudioSequence (args) {
        if (!args) args = {};
        if (!args.onProgress) args.onProgress = (frame, maxFrames) => {}
        if (!args.onFinish) args.onFinish = (output) => {}

        var renderCopy = this;
        var oldCanvasContainer = this.view.canvasContainer;

        this.history.saveSnapshot('before-audio-render');
        this.mute();
        this.selection.clear();
        this.publishedMode = "audioSequence";

        // Put the project canvas inside a div that's the same size as the project so the frames render at the correct resolution.
        let container = window.document.createElement('div');
        container.style.width  = (args.width /window.devicePixelRatio)+'px';
        container.style.height = (args.height/window.devicePixelRatio)+'px';
        window.document.body.appendChild(container);
        renderCopy.view.canvasContainer = container;
        renderCopy.view.resize();

        // Set the initial state of the project.
        renderCopy.focus = renderCopy.root;
        renderCopy.focus.timeline.playheadPosition = 1;

        // renderCopy.tick(); // This is commented out to not miss frame 1.


        renderCopy.view.paper.view.autoUpdate = false;
        var numMaxFrameImages = renderCopy.focus.timeline.length;
        var renderFrame = () => {
            var currentPos = renderCopy.focus.timeline.playheadPosition;
            args.onProgress(currentPos, numMaxFrameImages);

            if(currentPos >= numMaxFrameImages) {
                // reset autoUpdate back to normal
                renderCopy.view.paper.view.autoUpdate = true;

                this.view.canvasContainer = oldCanvasContainer;
                this.view.resize();

                this.history.loadSnapshot('before-audio-render');
                this.publishedMode = false;
                this.view.render();

                window.document.body.removeChild(container);
                args.onFinish([...this.soundsPlayed]);
            } else {
                var oldPlayhead = renderCopy.activeTimeline.playheadPosition
                renderCopy.tick();
                renderCopy.activeTimeline.playheadPosition = oldPlayhead + 1;
                renderFrame();
            }
        }

        this.resetSoundsPlayed();
        renderFrame();
    }

    /**
     * Create an object containing info on all sounds in the project.
     * Format:
     *   start: The amount of time in milliseconds to cut from the beginning of the sound.
     *   end: The amount of time that the sound will play before stopping.
     *   offset: The amount of time to offset the start of the sound.
     *   src: The source of the sound as a dataURL.
     *   filetype: The file type of the sound asset.
     */
    getAudioInfo() {
        return this.root.timeline.frames.filter(frame => {
            return frame.sound !== null;
        }).map(frame => {
            return {
                start: frame.soundStartMS,
                end: frame.soundEndMS,
                offset: frame.soundStart,
                src: frame.sound.src,
                filetype: frame.sound.fileExtension,
            }
        });
    }

    /**
     * Generate an audiobuffer containing all the project's sounds merged together.
     * @param {object} args - takes soundInfo (list of soundInfo to use for audioGeneration).
     * @param {Function} callback - callback used to recieve the final audiobuffer.
     */
    generateAudioTrack(args, callback) {
        var audioTrack = new Wick.AudioTrack(this);

        audioTrack.toAudioBuffer({
            callback: callback,
            soundInfo: args.soundInfo ? args.soundInfo : undefined,
            onProgress: args.onProgress,
        });
    }

    /**
     * Check if an object is a mouse target (if the mouse is currently hovered over the object)
     * @param {Wick.Tickable} object - the object to check if it is a mouse target
     */
    objectIsMouseTarget(object) {
        return this._mouseTargets.indexOf(object) !== -1;
    }

    /**
     * Whether or not to hide the cursor while project is playing.
     * @type {boolean}
     */
    get hideCursor() {
        return this._hideCursor;
    }

    set hideCursor(hideCursor) {
        this._hideCursor = hideCursor;
    }

    /**
     * Returns true if there is currently an active frame to draw onto.
     * @type {boolean}
     */
    get canDraw() {
        return !this.activeLayer.locked &&
            !this.activeLayer.hidden;
    }

    /**
     * Loads all Assets in the project's asset library. This must be called after opening a project.
     * @param {function} callback - Called when all assets are done loading.
     */
    loadAssets(callback) {
        if (this.assets.length === 0) {
            callback();
            return;
        }

        var loadedAssetCount = 0;
        this.assets.forEach(asset => {
            asset.load(() => {
                loadedAssetCount++;
                if (loadedAssetCount === this.assets.length) {
                    callback();
                }
            });
        });
    }

    /**
     * Remove assets from the project that are never used.
     */
    cleanupUnusedAssets () {
        this.assets.forEach(asset => {
            if(!asset.hasInstances()) {
                asset.remove();
            }
        });
    }
}
