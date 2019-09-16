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

/**
 * Class representing a Wick Project.
 */
Wick.Project = class extends Wick.Base {
    /**
     * Create a project.
     * @param {string} name - Project name. Default "My Project".
     * @param {number} width - Project width in pixels. Default 720.
     * @param {number} height - Project height in pixels. Default 405.
     * @param {number} framerate - Project framerate in frames-per-second. Default 12.
     * @param {string} backgroundColor - Project background color in hex. Default #ffffff.
     */
    constructor (args) {
        if(!args) args = {};
        super(args);

        this._name = args.name || 'My Project';
        this._width = args.width || 720;
        this._height = args.height || 405;
        this._framerate = args.framerate || 12;
        this._backgroundColor = args.backgroundColor || '#ffffff';

        this.pan = {x: 0, y: 0};
        this.zoom = 1.0;

        this.onionSkinEnabled = false;
        this.onionSkinSeekBackwards = 1;
        this.onionSkinSeekForwards = 1;

        this.selection = new Wick.Selection();
        this.history = new Wick.History();
        this.clipboard = new Wick.Clipboard();

        this.root = new Wick.Clip();
        this.root._identifier = 'Project';

        this.focus = this.root;

        this._mousePosition = {x:0, y:0};
        this._lastMousePosition = {x:0, y:0};
        this._isMouseDown = false;

        this._mouseTargets = [];

        this._keysDown = [];
        this._keysLastDown = [];
        this._currentKey = null;

        this._tickIntervalID = null;

        this._hideCursor = false;
        this._muted = false;

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
        for(var toolName in this._tools) {
            this._tools[toolName].project = this;
        }
        this.activeTool = 'cursor';

        this._toolSettings = new Wick.ToolSettings();
        this._toolSettings.onSettingsChanged((name, value) => {
            if(name === 'fillColor') {
                this.selection.fillColor = value;
            } else if (name === 'strokeColor') {
                this.selection.strokeColor = value;
            }
        });

        this._playing = false;

        this.history.project = this;
        this.history.pushState(Wick.History.StateType.ONLY_VISIBLE_OBJECTS);
    }

    deserialize (data) {
        super.deserialize(data);

        this.name = data.name;
        this.width = data.width;
        this.height = data.height;
        this.framerate = data.framerate;
        this.backgroundColor = data.backgroundColor;

        this.onionSkinEnabled = data.onionSkinEnabled;
        this.onionSkinSeekForwards = data.onionSkinSeekForwards;
        this.onionSkinSeekBackwards = data.onionSkinSeekBackwards;

        this._focus = data.focus;

        this._hideCursor = false;
        this._muted = false;
    }

    serialize (args) {
        var data = super.serialize(args);

        data.name = this.name;
        data.width = this.width;
        data.height = this.height;
        data.backgroundColor = this.backgroundColor;
        data.framerate = this.framerate;

        data.onionSkinEnabled = this.onionSkinEnabled
        data.onionSkinSeekForwards = this.onionSkinSeekForwards;
        data.onionSkinSeekBackwards = this.onionSkinSeekBackwards;

        data.focus = this.focus.uuid;

        // Save some metadata which will eventually end up in the wick file
        data.metadata = Wick.WickFile.generateMetaData();

        return data;
    }

    get classname () {
        return 'Project';
    }

    /**
     * The width of the project.
     * @type {number}
     */
    get width () {
        return this._width;
    }

    set width (width) {
        if(typeof width !== 'number') return;
        if(width < 1) width = 1;
        if(width > 200000) width = 200000;
        this._width = width;
    }

    /**
     * The height of the project.
     * @type {number}
     */
    get height () {
        return this._height;
    }

    set height (height) {
        if(typeof height !== 'number') return;
        if(height < 1) height = 1;
        if(height > 200000) height = 200000;
        this._height = height;
    }

    /**
     * The framerate of the project.
     * @type {number}
     */
    get framerate () {
        return this._framerate;
    }

    set framerate (framerate) {
        if(typeof framerate !== 'number') return;
        if(framerate < 1) framerate = 1;
        if(framerate > 9999) framerate = 9999;
        this._framerate = framerate;
    }

    /**
     * The background color of the project.
     * @type {string}
     */
    get backgroundColor () {
        return this._backgroundColor;
    }

    set backgroundColor (backgroundColor) {
        if(typeof backgroundColor !== 'string') return;
        this._backgroundColor = backgroundColor;
    }

    /**
     * The timeline of the active clip.
     * @type {Wick.Timeline}
     */
    get activeTimeline () {
        return this.focus.timeline;
    }

    /**
     * The active layer of the active timeline.
     * @type {Wick.Layer}
     */
    get activeLayer () {
        return this.activeTimeline.activeLayer;
    }

    /**
     * The active frame of the active layer.
     * @type {Wick.Frame}
     */
    get activeFrame () {
        return this.activeLayer.activeFrame;
    }

    /**
     * The active frames of the active timeline.
     * @type {Wick.Frame[]}
     */
    get activeFrames () {
        return this.focus.timeline.activeFrames;
    }

    /**
     * All frames in this project.
     * @type {Wick.Frame[]}
     */
    getAllFrames () {
        return this.root.timeline.getAllFrames(true);
    }

    /**
     * The project selection.
     * @type {Wick.Selection}
     */
    get selection () {
        return this.getChild('Selection');
    }

    set selection (selection) {
        if(this.selection) {
            this.removeChild(this.selection);
        }
        this.addChild(selection);
    }

    /**
     * An instance of the Wick.History utility class for undo/redo functionality.
     * @type {Wick.History}
     */
    get history () {
        return this._history;
    }

    set history (history) {
        this._history = history;
    }

    /**
     * Undo the last action.
     * @returns {boolean} true if there was something to undo, false otherwise.
     */
    undo () {
        this.selection.clear();
        var success = this.project.history.popState();
        return success;
    }

    /**
     * Redo the last action that was undone.
     * @returns {boolean} true if there was something to redo, false otherwise.
     */
    redo () {
        this.selection.clear();
        var success = this.project.history.recoverState();
        return success;
    }

    /**
     * The assets belonging to the project.
     * @type {Wick.Asset[]}
     */
    get assets () {
        return this.getChildren(['ImageAsset','SoundAsset','ClipAsset','FontAsset']);
    }

    /**
     * Adds an asset to the project.
     * @param {Wick.Asset} asset - The asset to add to the project.
     */
    addAsset (asset) {
        if(this.assets.indexOf(asset) === -1) {
            this.addChild(asset);
        }
    }

    /**
     * Removes an asset from the project. Also removes all instances of that asset from the project.
     * @param {Wick.Asset} asset - The asset to remove from the project.
     */
    removeAsset (asset) {
        asset.removeAllInstances();
        this.removeChild(asset);
    }

    /**
     * Retrieve an asset from the project by its UUID.
     * @param {string} uuid - The UUID of the asset to get.
     * @return {Wick.Asset} The asset
     */
    getAssetByUUID (uuid) {
        var asset = this.getAssets().find(asset => {
            return asset.uuid === uuid;
        });

        if(asset) {
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
    getAssetByName (name) {
        return this.getAssets().find(asset => {
            return asset.name === name;
        });
    }

    /**
     * The assets belonging to the project.
     * @param {string} type - Optional, filter assets by type ("Sound"/"Image"/"Clip"/"Button")
     * @returns {Wick.Asset[]} The assets in the project
     */
    getAssets (type) {
        if(!type) {
            return this.assets;
        } else {
            return this.assets.filter(asset => {
                return asset instanceof Wick[type+'Asset'];
            });
        }
    }

    /**
     * A list of all "fontFamily" in the asset library.
     * @returns {[string]}
     */
    getFonts () {
        return this.getAssets('Font').map(asset => {
            return asset.fontFamily;
        });
    }

    /**
     * Check if a FontAsset with a given fontFamily exists in the project.
     * @param {string} fontFamily - The font to check for
     * @returns {boolean}
     */
    hasFont (fontFamily) {
        return this.getFonts().find(seekFontFamily => {
            return seekFontFamily === fontFamily;
        }) !== undefined;
    }

    /**
     * The root clip.
     * @type {Wick.Clip}
     */
    get root () {
        return this.getChild('Clip');
    }

    set root (root) {
        if(this.root) {
            this.removeChild(this.root);
        }
        this.addChild(root);
    }

    /**
     * The currently focused clip.
     * @type {Wick.Clip}
     */
    get focus () {
        return this._focus && Wick.ObjectCache.getObjectByUUID(this._focus);
    }

    set focus (focus) {
        var focusChanged = this.focus !== null && this.focus !== focus;

        this._focus = focus.uuid;

        if(focusChanged) {
            this.selection.clear();

            // Reset timelines of subclips of the newly focused clip
            focus.timeline.clips.forEach(subclip => {
                subclip.timeline.playheadPosition = 1;
            });

            // Reset pan and zoom and clear selection on focus change
            this.recenter();
        }
    }

    /**
     * The position of the mouse
     * @type {object}
     */
    get mousePosition () {
        return this._mousePosition;
    }

    set mousePosition (mousePosition) {
        this._lastMousePosition = {x:this.mousePosition.x, y:this.mousePosition.y};
        this._mousePosition = mousePosition;
    }

    /**
     * The amount the mouse has moved in the last tick
     * @type {object}
     */
    get mouseMove () {
        let moveX = this.mousePosition.x - this._lastMousePosition.x;
        let moveY = this.mousePosition.y -  this._lastMousePosition.y;
        return {x: moveX, y: moveY};
    }

    /**
     * Determine if the mouse is down.
     * @type {boolean}
     */
    get isMouseDown () {
        return this._isMouseDown;
    }

    set isMouseDown (isMouseDown) {
        this._isMouseDown = isMouseDown;
    }

    /**
     * The keys that are currenty held down.
     * @type {string[]}
     */
    get keysDown () {
        return this._keysDown;
    }

    set keysDown (keysDown) {
        this._keysDown = keysDown;
    }

    /**
     * The keys were just pressed (i.e., are currently held down, but were not last tick).
     * @type {string[]}
     */
    get keysJustPressed () {
        // keys that are in _keysDown, but not in _keysLastDown
        return this._keysDown.filter(key => {
            return this._keysLastDown.indexOf(key) === -1;
        });
    }

    /**
     * The keys that were just released (i.e. were down last tick back are no longer down.)
     * @return {string[]}
     */
    get keysJustReleased () {
        return this._keysLastDown.filter(key => {
            return this._keysDown.indexOf(key) === -1;
        });
    }

    /**
     * Check if a key is being pressed.
     * @param {string} key - The name of the key to check
     */
    isKeyDown (key) {
        return this.keysDown.indexOf(key) !== -1;
    }

    /**
     * Check if a key was just pressed.
     * @param {string} key - The name of the key to check
     */
    isKeyJustPressed (key) {
        return this.keysJustPressed.indexOf(key) !== -1;
    }

    /**
     * The key to be used in the global 'key' variable in the scripting API. Update currentKey before you run any key script.
     * @type {string[]}
     */
    get currentKey () {
        return this._currentKey;
    }

    set currentKey (currentKey) {
        this._currentKey = currentKey;
    }

    /**
     * Creates an asset from a File object and adds that asset to the project.
     * @param {File} file - File object to be read and converted into an asset.
     * @param {function} callback Function with the created Wick Asset. Can be passed undefined on improper file input.
     */
    importFile (file, callback) {
        let imageTypes = Wick.ImageAsset.getValidMIMETypes();
        let soundTypes = Wick.SoundAsset.getValidMIMETypes();
        let fontTypes = Wick.FontAsset.getValidMIMETypes();

        let asset = undefined;
        if (imageTypes.indexOf(file.type) !== -1) {
            asset = new Wick.ImageAsset();
        } else if (soundTypes.indexOf(file.type) !== -1) {
            asset = new Wick.SoundAsset();
        } else if (fontTypes.indexOf(file.type) !== -1) {
            asset = new Wick.FontAsset();
        }

        if (asset === undefined) {
            console.warn('importFile(): Could not import file ' + file.name + ', filetype: "' + file.type + '" is not supported.');
            console.warn('supported image file types:');
            console.log(imageTypes)
            console.warn('supported sound file types:');
            console.log(soundTypes)
            console.warn('supported font file types:');
            console.log(fontTypes)
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
     * Deletes all objects in the selection.
     */
    deleteSelectedObjects () {
        var objects = this.selection.getSelectedObjects();

        this.selection.clear();

        this.activeTimeline.deferFrameGapResolve();
        objects.forEach(object => {
            object.remove && object.remove();
        });
        this.activeTimeline.resolveFrameGaps();
    }

    /**
     * Perform a boolean operation on all selected paths.
     * @param {string} booleanOpName - The name of the boolean op function to use. See Wick.Path.booleanOp.
     */
    doBooleanOperationOnSelection (booleanOpName) {
        var paths = this.selection.getSelectedObjects('Path');
        this.selection.clear();
        var booleanOpResult = Wick.Path.booleanOp(paths, booleanOpName);
        paths.forEach(path => {
            path.remove();
        });
        this.activeFrame.addPath(booleanOpResult);
        this.selection.select(booleanOpResult);
    }

    /**
     * Copy the contents of the selection to the clipboard.
     * @returns {boolean} True if there was something to copy, false otherwise
     */
    copySelectionToClipboard () {
        var objects = this.selection.getSelectedObjects();
        if(objects.length === 0) {
            return false;
        } else {
            this.clipboard.copyObjectsToClipboard(this, objects);
            return true;
        }
    }

    /**
     * Cut the currently selected frames.
     */
    cutSelectedFrames () {
        this.selection.getSelectedObjects('Frame').forEach(frame => {
            frame.cut();
        });
    }

    /**
     * Copy the currently selected frames forwards.
     */
    copySelectedFramesForward () {
        this.selection.getSelectedObjects('Frame').forEach(frame => {
            frame.copyForward();
        });
    }

    /**
     * Create a new tween on all selected frames.
     */
    createTweenOnSelectedFrames () {
        this.selection.getSelectedObjects('Frame').forEach(frame => {
            frame.createTween();
        });
    }

    /**
     * Move the right edge of all selected frames right one frame.
     */
    extendSelectedFrames () {
        var frames = this.selection.getSelectedObjects('Frame');
        frames.forEach(frame => {
            frame.end ++;
        });
        this.activeTimeline.resolveFrameOverlap(frames);
        this.activeTimeline.resolveFrameGaps();
    }

    /**
     * Move the right edge of all selected frames left one frame.
     */
    shrinkSelectedFrames () {
        var frames = this.selection.getSelectedObjects('Frame');
        frames.forEach(frame => {
            if(frame.length === 1) return;
            frame.end --;
        });
        this.activeTimeline.resolveFrameOverlap(frames);
        this.activeTimeline.resolveFrameGaps();
    }

    /**
     * Shift all selected frames over one frame to the right
     */
    moveSelectedFramesRight () {
        var frames = this.selection.getSelectedObjects('Frame');
        frames.forEach(frame => {
            frame.end ++;
            frame.start ++;
        });
        this.activeTimeline.resolveFrameOverlap(frames);
        this.activeTimeline.resolveFrameGaps();
    }

    /**
     * Shift all selected frames over one frame to the left
     */
    moveSelectedFramesLeft () {
        var frames = this.selection.getSelectedObjects('Frame');
        frames.forEach(frame => {
            frame.start --;
            frame.end --;
        });
        this.activeTimeline.resolveFrameOverlap(frames);
        this.activeTimeline.resolveFrameGaps();
    }

    /**
     * Paste the contents of the clipboard into the project.
     * @returns {boolean} True if there was something to paste in the clipboard, false otherwise.
     */
    pasteClipboardContents () {
        return this.clipboard.pasteObjectsFromClipboard(this);
    }

    /**
     * Selects all objects that are visible on the canvas (excluding locked layers and onion skinned objects)
     */
    selectAll () {
        this.selection.clear();
        this.activeFrames.filter(frame => {
            return !frame.parentLayer.locked
                && !frame.parentLayer.hidden;
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
    createImagePathFromAsset (asset, x, y, callback) {
        asset.createInstance(path => {
            this.activeFrame.addPath(path);
            path.x = x;
            path.y = y;
            callback(path);
        });
    }

    /**
     * Creates a symbol from the objects currently selected.
     * @param {string} identifier - the identifier to give the new symbol
     * @param {string} type - "Clip" or "Button"
     */
    createClipFromSelection (args) {
        if(!args) {
            args = {};
        };

        if(args.type !== 'Clip' && args.type !== 'Button') {
            console.error('createClipFromSelection: invalid type: ' + args.type);
            return;
        }

        var clip = new Wick[args.type]({
            identifier: args.identifier,
            objects: this.selection.getSelectedObjects('Canvas'),
            transformation: new Wick.Transformation({
                x: this.selection.x + this.selection.width/2,
                y: this.selection.y + this.selection.height/2,
            }),
        });
        this.activeFrame.addClip(clip);
        // TODO add to asset library
        this.selection.clear();
        this.selection.select(clip);
    }

    /**
     * Breaks selected clips into their children clips and paths.
     */
    breakApartSelection () {
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
     */
    focusTimelineOfSelectedClip () {
        if(this.selection.getSelectedObject() instanceof Wick.Clip) {
            this.focus = this.selection.getSelectedObject();
        }
    }

    /**
     * Sets the project focus to the parent timeline of the currently focused clip.
     */
    focusTimelineOfParentClip () {
        if(!this.focus.isRoot) {
            this.focus = this.focus.parentClip;
        }
    }

    /**
     * Plays the sound in the asset library with the given name.
     * @param {string} assetName - Name of the sound asset to play
     * @param {Object} options - options for the sound. See Wick.SoundAsset.play
     */
    playSound (assetName, options) {
        var asset = this.getAssetByName(assetName);
        if(!asset) {
            console.warn('playSound(): No asset with name: "' + assetName + '"');
        } else if (!(asset instanceof Wick.SoundAsset)) {
            console.warn('playSound(): Asset is not a sound: "' + assetName + '"');
        } else {
            asset.play(options);
        }
    }

    /**
     * Stops all sounds playing from frames and sounds played using playSound().
     */
    stopAllSounds () {
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
    mute () {
        this._muted = true;
    }

    /**
     * Enable all sounds to play
     */
    unmute () {
        this._muted = false;
    }

    /**
     * Is the project currently muted?
     */
    get muted () {
        return this._muted;
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

        // Tick the focus
        this.focus._attachChildClipReferences();
        var error = this.focus.tick();

        // Save the current keysDown
        this._lastMousePosition = {x: this._mousePosition.x, y: this._mousePosition.y};
        this._keysLastDown = [].concat(this._keysDown);

        this.view.render();

        return error;
    }

    /**
     * Checks if the project is currently playing.
     * @type {boolean}
     */
    get playing () {
        return this._playing;
    }

    /**
     * Start playing the project.
     * Arguments: onError: Called when a script error occurs during a tick.
     *            onBeforeTick: Called before every tick
     *            onAfterTick: Called after every tick
     * @param {object} args - Optional arguments
     */
    play (args) {
        if(!args) args = {};
        if(!args.onError) args.onError = () => {};
        if(!args.onBeforeTick) args.onBeforeTick = () => {};
        if(!args.onAfterTick) args.onAfterTick = () => {};

        this._playing = true;
        this.view.paper.view.autoUpdate = false;

        if(this._tickIntervalID) {
            this.stop();
        }

        this.history.saveSnapshot('state-before-play');

        this.selection.clear();

        // Start tick loop
        this._tickIntervalID = setInterval(() => {
            args.onBeforeTick();

            var error = this.tick();
            this.view.paper.view.update();
            if(error) {
                args.onError(error);
                this.stop();
                return;
            }

            args.onAfterTick();
        }, 1000 / this.framerate);
    }

    /**
     * Stop playing the project.
     */
    stop () {
        this._playing = false;
        this.view.paper.view.autoUpdate = true;

        // Run unload scripts on all objects
        this.getAllFrames().forEach(frame => {
            frame.clips.forEach(clip => {
                clip.runScript('unload');
            });
        });

        this.stopAllSounds();

        clearInterval(this._tickIntervalID);
        this._tickIntervalID = null;

        // Loading the snapshot to restore project state also moves the playhead back to where it was originally.
        // We actually don't want this, preview play should actually move the playhead after it's stopped.
        var currentPlayhead = this.focus.timeline.playheadPosition;
        this.history.loadSnapshot('state-before-play');
        this.focus.timeline.playheadPosition = currentPlayhead;
    }

    /**
     * Resets zoom and pan.
     */
    recenter () {
        this.pan = {x: 0, y: 0};
        this.zoom = 1;
    }

    /**
     * Zooms the canvas in.
     */
    zoomIn () {
        this.zoom *= 1.25;
    }

    /**
     * Zooms the canvas out.
     */
    zoomOut () {
        this.zoom *= 0.8;
    }

    /**
     * All tools belonging to the project.
     * @type {Array<Wick.Tool>}
     */
    get tools () {
        return this._tools;
    }

    /**
     * The tool settings for the project's tools.
     * @type {Wick.ToolSettings}
     */
    get toolSettings () {
        return this._toolSettings;
    }

    /**
     * The currently activated tool.
     * @type {Wick.Tool}
     */
    get activeTool () {
        return this._activeTool;
    }

    set activeTool (activeTool) {
        var newTool;

        if(typeof activeTool === 'string') {
            var tool = this.tools[activeTool];
            if(!tool) {
                console.error('set activeTool: invalid tool: ' + activeTool);
            }
            newTool = tool;
        } else {
            newTool = activeTool;
        }

        // Clear selection if we changed between drawing tools
        if(newTool.name !== 'pan' &&
           newTool.name !== 'eyedropper' &&
           newTool.name !== 'cursor') {
            this.selection.clear();
        }

        this._activeTool = newTool;
    }

    /**
     * Adds an object to the project.
     * @param {Wick.Base} object
     * @return {boolean} returns true if the obejct was added successfully, false otherwise.
     */
    addObject (object) {
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
            this.activeFrame.addTween(object);
        } else {
            return false;
        }
        return true;
    }

    /**
     * Create a sequence of images from every frame in the project.
     * @param {object} args - Options for generating the image sequence
     * @param {string} imageType - MIMEtype to use for rendered images. Defaults to 'image/png'.
     * @param {function} onProgress = Function to call for each image loaded, useful for progress bars
     * @param {function} onFinish - Function to call when the images are all loaded.
     */
    generateImageSequence (args) {
        if(!args) args = {};
        if(!args.imageType) args.imageType = 'image/png';
        if(!args.onProgress) args.onProgress = () => {};
        if(!args.onFinish) args.onFinish = () => {};

        var renderCopy = this;

        var oldCanvasContainer = this.view.canvasContainer;

        this.history.saveSnapshot('before-gif-render');
        this.mute();
        this.tick();

        // Put the project canvas inside a div that's the same size as the project so the frames render at the correct resolution.
        let container = window.document.createElement('div');
        container.style.width = (renderCopy.width/window.devicePixelRatio)+'px';
        container.style.height = (renderCopy.height/window.devicePixelRatio)+'px';
        window.document.body.appendChild(container);
        renderCopy.view.canvasContainer = container;
        renderCopy.view.resize();

        // Set the initial state of the project.
        renderCopy.focus = renderCopy.root;
        renderCopy.focus.timeline.playheadPosition = 1;
        renderCopy.onionSkinEnabled = false;
        renderCopy.zoom = 1 / window.devicePixelRatio;
        renderCopy.pan = {x: 0, y: 0};

        //renderCopy.tick();

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

                if(currentPos >= numMaxFrameImages) {
                    // reset autoUpdate back to normal
                    renderCopy.view.paper.view.autoUpdate = true;

                    this.view.canvasContainer = oldCanvasContainer;
                    this.view.resize();

                    this.history.loadSnapshot('before-gif-render');
                    this.view.render();

                    window.document.body.removeChild(container);

                    args.onFinish(frameImages);
                } else {
                    renderCopy.tick();
                    renderFrame();
                }
            }

            renderCopy.view.render();
            renderCopy.view.paper.view.update();
            frameImage.src = renderCopy.view.canvas.toDataURL(args.imageType);
        }

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
    getAudioInfo () {
        return this.root.timeline.frames.filter(frame => {
            return frame.sound !== null;
        }).map(frame => {
            return {
                start: frame.soundStartMS,
                end: frame.soundEndMS,
                offset: frame.cropSoundOffsetMS,
                src: frame.sound.src,
                filetype: frame.sound.fileExtension,
            }
        });
    }

    /**
     * Generate an audiobuffer containing all the project's sounds merged together.
     * @param {object} args - placeholder for future options, not currently used
     * @param {Function} callback - callback used to recieve the final audiobuffer.
     */
    generateAudioTrack (args, callback) {
        var audioTrack = new Wick.AudioTrack(this);
        audioTrack.toAudioBuffer(audioBuffer => {
            callback(audioBuffer);
        });
    }

    /**
     * Check if an object is a mouse target (if the mouse is currently hovered over the object)
     * @param {Wick.Tickable} object - the object to check if it is a mouse target
     */
    objectIsMouseTarget (object) {
        return this._mouseTargets.indexOf(object) !== -1;
    }

    /**
     * Whether or not to hide the cursor while project is playing.
     * @type {boolean}
     */
    get hideCursor () {
        return this._hideCursor;
    }

    set hideCursor (hideCursor) {
        this._hideCursor = hideCursor;
    }

    /**
     * Returns true if there is currently an active frame to draw onto.
     * @type {boolean}
     */
    get canDraw () {
        return !this.activeLayer.locked && !this.activeLayer.hidden;
    }
}
