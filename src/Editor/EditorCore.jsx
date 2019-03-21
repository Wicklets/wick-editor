/*
 * Copyright 2018 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Component } from 'react';
import localForage from 'localforage';
import { saveAs } from 'file-saver';
import GIFExport from './export/GIFExport';
import ZIPExport from './export/ZIPExport';

class EditorCore extends Component {
  /**
   * Returns the name of the active tool.
   * @returns {string} The string representation active tool name.
   */
  getActiveTool = () => {
    return this.state.activeTool;
  }

  /**
   * Change the active tool.
   * @param {string} newTool - The string representation of the tool to switch to.
   */
  setActiveTool = (newTool) => {
    if(newTool !== this.state.activeTool) {
      if(newTool !== 'pan') {
        this.project.selection.clear();
        this.projectDidChange();
      }

      this.lastUsedTool = this.state.activeTool;
      this.setState({
        activeTool: newTool
      });
    }
  }

  /**
   * Activates the tool that was used before the current tool was activated.
   */
  activateLastTool = () => {
    if(!this.lastUsedTool) return;
    this.setState({
      activeTool: this.lastUsedTool,
    });
  }

  /**
   * Undo the last action that was done.
   */
  undoAction = () => {
    if(!this.history.undo()) {
      this.toast('Nothing to undo.', 'warning')
    }
  }

  /**
   * Recover the state of the project from before the last action was done.
   */
  redoAction = () => {
    if(!this.history.redo()) {
      this.toast('Nothing to redo.', 'warning')
    }
  }

  /**
   * Recenters the canvas.
   */
  recenterCanvas = () => {
    this.project.recenter();
    this.projectDidChange(true);
  }

  /**
   * Updates the zoom level of the project. Helper for zoom in and zoom out.
   * @param  {number} zoomPercentage The value to set the zoom percentage to.
   */
  updateZoom = (zoomPercentage) => {
    let adjustedMinZoom = Math.max(zoomPercentage, this.toolRestrictions.zoomPercentage.min);
    let adjustedZoom = Math.min(adjustedMinZoom, this.toolRestrictions.zoomPercentage.max);
    this.project.zoom = adjustedZoom/100;
    this.projectDidChange();
  }

  /**
   * Zooms in the canvas.
   * @param  {number} zoomPercentage Amount to zoom canvas in by. If no
   * value is provided, the default zoomPercentage step is used.
   */
  zoomIn = (zoomPercentage) => {
    zoomPercentage = zoomPercentage ? zoomPercentage : this.toolRestrictions.zoomPercentage.step;
    let currentZoom = this.project.zoom*100;
    this.updateZoom(currentZoom+zoomPercentage);
  }

  /**
   * Zooms out the canvas.
   * @param  {number} zoomPercentage Amount to zoom out the canvas by. If no
   * value is provided, the default zoomPercentage step is used.
   */
  zoomOut = (zoomPercentage) => {
    zoomPercentage = zoomPercentage ? zoomPercentage : this.toolRestrictions.zoomPercentage.step;
    let currentZoom = this.project.zoom*100;
    this.updateZoom(currentZoom-zoomPercentage);
  }

  /**
   * Returns an object containing the tool settings.
   * @returns {object} The object containing the tool settings.
   */
  getToolSettings = () => {
    return this.state.toolSettings;
  }

  /**
   * Updates the tool settings state.
   * @param {object} newToolSettings - An object of key-value pairs where the keys represent tool settings and the values represent the values to change those settings to.
   */
  setToolSettings = (newToolSettings) => {
    this.setState({
      toolSettings: {
        ...this.state.toolSettings,
        ...newToolSettings,
      }
    });
  }

  /**
   * Shrinks the brush size by toolSettings.sizeJump if a brush tool is selected.
   */
  shrinkBrushSize = () => {
    if (this.getActiveTool() !== 'brush' && this.getActiveTool() !== 'eraser') { return }

    let toolSettings = this.getToolSettings();
    let minimum = 1;

    let brushSize = toolSettings.brushSize;
    let newBrushSize = Math.max(brushSize-toolSettings.sizeJump, minimum);

    this.setToolSettings({
      brushSize: newBrushSize,
    });
  }

  /**
   * Grows the brush size by toolSettings.sizeJump if a brush tool is selected.
   */
  growBrushSize = () => {
    if (this.getActiveTool() !== 'brush' && this.getActiveTool() !== 'eraser') { return }

    let toolSettings = this.getToolSettings();
    let maximum = 100;

    let brushSize = toolSettings.brushSize;
    let newBrushSize = Math.min(brushSize+toolSettings.sizeJump, maximum);

    this.setToolSettings({
      brushSize: newBrushSize,
    });
  }

  /**
   * Moves the active timeline's playhead forward one frame.
   */
  movePlayheadForwards = () => {
    let timeline = this.project.focus.timeline;
    timeline.playheadPosition ++;
    this.projectDidChange();
  }

  /**
   * Moves the active timeline's playhead backwards one frame.
   */
  movePlayheadBackwards = () => {
    let timeline = this.project.focus.timeline;
    timeline.playheadPosition = Math.max(1, timeline.playheadPosition - 1);
    this.projectDidChange();
  }

  /**
   * Determines the type of the object/objects that are in the selection state.
   * @returns {string} The string representation of the type of object/objects
   * selected
   */
  getSelectionType = () => {
    let selection = this.project.selection;

    if(selection.location === 'Canvas') {
      if(selection.numObjects === 1) {
        if(selection.getSelectedObject() instanceof window.Wick.Path) {
          return 'path';
        } else if(selection.getSelectedObject() instanceof window.Wick.Button) {
          return 'button';
        } else if(selection.getSelectedObject() instanceof window.Wick.Clip) {
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
      if(selection.numObjects === 1) {
        if(selection.getSelectedObject() instanceof window.Wick.Frame) {
          return 'frame';
        } else if(selection.getSelectedObject() instanceof window.Wick.Layer) {
          return 'layer';
        } else if(selection.getSelectedObject() instanceof window.Wick.Tween) {
          return 'tween';
        }
      } else if (selection.types.length === 1) {
        if(selection.getSelectedObject() instanceof window.Wick.Frame) {
          return 'multiframe';
        } else if(selection.getSelectedObject() instanceof window.Wick.Layer) {
          return 'multilayer';
        } else if(selection.getSelectedObject() instanceof window.Wick.Tween) {
          return 'multitween';
        }
      } else {
        return 'multitimeline';
      }
    } else if (selection.location === 'AssetLibrary') {
      if(selection.getSelectedObjects()[0] instanceof window.Wick.ImageAsset) {
        return 'imageasset';
      } else if(selection.getSelectedObjects()[0] instanceof window.Wick.SoundAsset) {
        return 'soundasset';
      } else {
        return 'multiassetmixed'
      }
    } else {
      return 'unknown';
    }
  }

  /**
   * Returns true if the selection is scriptable.
   * @return {boolean} True if the selection is scriptable.
   */
  selectionIsScriptable = () => {
    return this.project.selection.numObjects === 1
        && (this.project.selection.types[0] === 'Clip' ||
            this.project.selection.types[0] === 'Frame' ||
            this.project.selection.types[0] === 'Button');
  }

  /**
   * The selected scriptable object.
   * @return {Wick.Frame|Wick.Clip} object - the scriptable object that is selected
   */
  getSelectedObjectScript = () => {
    if(this.selectionIsScriptable()) {
      return this.project.selection.getSelectedObject();
    } else {
      return null;
    }
  }

  /**
   * Returns all selected objects on the timeline.
   * @returns {(<Wick.Frame>|<Wick.Tween>)[]} An array containing the selected
   * tweens and frames
   */
  getSelectedTimelineObjects = () => {
    return this.project.selection.getSelectedObjects('Timeline');
  }

  /**
   * Returns all selected frames.
   * @returns {<Wick.Frame>)[]} An array containing the selected frames.
   */
  getSelectedFrames = () => {
    return this.project.selection.getSelectedObjects('Frame');
  }

  /**
   * Returns all selected tweens.
   * @returns {<Wick.Tween>)[]} An array containing the selected tweens.
   */
  getSelectedTweens = () => {
    return this.project.selection.getSelectedObjects('Tween');
  }

  /**
   * Returns all selected objects on the timeline.
   * @returns {(<Wick.Path>|<Wick.Clip>|<Wick.Button>)[]} An array containing
   * the selected clips and paths
   */
  getSelectedCanvasObjects = () => {
    return this.project.selection.getSelectedObjects('Canvas');
  }

  /**
   * Returns all selected paths.
   * @returns {<Wick.Path>)[]} An array containing the selected paths.
   */
  getSelectedPaths = () => {
    return this.project.selection.getSelectedObjects('Path');
  }

  /**
   * Returns all selected clips.
   * @returns {<Wick.Clip>)[]} An array containing the selected clips.
   */
  getSelectedClips = () => {
    return this.project.selection.getSelectedObjects('Clip');
  }

  /**
   * Returns all selected buttons.
   * @returns {<Wick.Button>)[]} An array containing the selected buttons.
   */
  getSelectedButtons = () => {
    return this.project.selection.getSelectedObjects('Button');
  }

  /**
   * Returns all selected objects in the asset library.
   * @returns {(<Wick.ImageAsset>|<Wick.SoundAsset>)[]} An array containing the
   * selected assets
   */
  getSelectedAssetLibraryObjects = () => {
    return this.project.selection.getSelectedObjects('AssetLibrary');
  }

  /**
   * Returns all selected sound assets from the asset library.
   * @returns {(<Wick.SoundAsset>)[]} An array containing the selected sound
   * assets.
   */
  getSelectedSoundAssets = () => {
    return this.project.selection.getSelectedObjects('SoundAsset');
  }

  /**
   * Returns all selected image assets from the asset library.
   * @returns {(<Wick.ImageAsset>)[]} An array containing the selected image
   * assets.
   */
  getSelectedImageAssets = () => {
    return this.project.selection.getSelectedObjects('ImageAsset');
  }

  /**
   * Returns the selected scriptable object if selection is a single scriptable
   * object.
   * @return {object|null} selected scriptable object.
   */
  getSelectedScriptableObject = () => {
    return this.project.selection.getSelectedObject().isScriptable
        && this.project.selection.getSelectedObject();
  }

  /**
   * Returns the number of objects selected on the canvas.
   * @return {number} Number of canvas objects selected.
   */
  getNumCanvasObjectsSelected = () => {
    return this.project.selection.numObjects;
  }

  /**
   * Clears the selection, then adds the given object to the selection.
   * @param {object} object - The object to add to the selection.
   */
  selectObject = (object) => {
    this.project.selection.select(object);
  }

  /**
   * Clears the selection, then adds the given objects to the selection. No
   * changes will be made if the selection does not change.
   * @param {object[]} objects - The objects to add to the selection.
   */
  selectObjects = (objects) => {
    objects.forEach(object => {
      this.selectObject(object);
    });
    this.projectDidChange();
  }

  /**
   * Clears the selection.
   */
  clearSelection = () => {
    this.project.selection.clear();
    this.projectDidChange();
  }

  /**
   * Selects everything on the canvas.
   */
  selectAll = () => {
    this.setState({
      activeTool: 'cursor'
    });
    this.project.selectAll();
    this.projectDidChange();
  }

  /**
   * Returns the value of a requested selection attribute.
   * @param  {string} attributeName Selection attribute to retrieve.
   * @return {string|number|undefined} Value of the selection attribute to
   * retrieve. Returns undefined is attribute does not exist.
   */
  getSelectionAttribute = (attributeName) => {
    let attribute = this.project.selection[attributeName];

    if(attribute instanceof Array) {
      if(attribute.length === 0) {
        return undefined;
      } else if (attribute.length === 1) {
        return attribute[0];
      } else {
        // Should return info about "mixed" attributes, but just
        // return the attribute of the first object for now.
        return attribute[0];
      }
    } else {
      return attribute;
    }
  }

  /**
   * Returns the names of all possible selection attribute names.
   * @return {string[]} Array of selection attribute names.
   */
  getAllSelectionAttributeNames = () => {
    var attributes = [
      "strokeWidth",
      "fillColor",
      "strokeColor",
      "name",
      "filename",
      "fontSize",
      "fontFamily",
      "src",
      "frameLength",
      "x",
      "y",
      "width",
      "height",
      "scaleX",
      "scaleY",
      "rotation",
      "opacity",
      "sound",
      "soundVolume",
      "soundStart",
    ];
    return attributes;
  }

  /**
   * Returns the new selection Attributes.
   * @return {object} object with new attributes.
   */
  getAllSelectionAttributes = () => {
    let newAttributes = {};

    let selectionAttributeNames = this.getAllSelectionAttributeNames();

    selectionAttributeNames.forEach(name => {
      newAttributes[name] = this.getSelectionAttribute(name);
    });

    return newAttributes;
  }

  /**
   * Updates the value of a selection attribute for the selected item in the editor.
   * @param {string} attribute Name of the attribute to update.
   * @param {string|number} newValue  New value of the attribute to update.
   */
  setSelectionAttribute = (attribute, newValue) => {
    this.project.selection[attribute] = newValue;
    this.projectDidChange();
  }

  /**
   * Determines if a given object is selected.
   * @param {object} object - Selection object to check if it is selected
   * @returns {boolean} - True if the object is selected, false otherwise
   */
  isObjectSelected = (object) => {
    return this.project.selection.isObjectSelected(object);
  }

  /**
   * Creates a new symbol from the selected paths and clips and adds it to the project.
   */
  createSymbolFromSelection = (name, type) => {
    this.project.createSymbolFromSelection(name, type);
    this.projectDidChange();
  }

  /**
   * Updates the focus object of the project.
   * @param {Wick.Clip} object Object to set as focus.
   */
  setFocusObject = (object) => {
    this.project.focus = object;
    this.projectDidChange();
  }

  /**
   * Break apart the selected clip(s) and select the objects that were contained within those clip(s).
   */
  breakApartSelection = () => {
    this.project.breakApartSelection();
    this.projectDidChange();
  }

  /**
   * Deletes all selected objects.
   * @returns {object[]} The objects that were deleted.
   */
  deleteSelectedObjects = () => {
    this.project.deleteSelectedObjects();
    this.projectDidChange();
  }

  /**
   * Moves the selected objects on the canvas to the back.
   */
  sendSelectionToBack = () => {
    this.project.selection.sendToBack();
    this.projectDidChange();
  }

  /**
   * Moves the selected objects on the canvas to the front.
   */
  bringSelectionToFront = () => {
    this.project.selection.bringToFront();
    this.projectDidChange();
  }

  /**
   * Moves the selected objects on the canvas backwards.
   */
  moveSelectionBackwards = () => {
    this.project.selection.moveBackwards();
    this.projectDidChange();
  }

  /**
   * Moves the selected objects on the canvas forwards.
   */
  moveSelectionForwards = () => {
    this.project.selection.moveForwards();
    this.projectDidChange();
  }

  /**
   * Moves the selected objects up 1 pixel.
   */
  nudgeSelectionUp = () => {
    this.project.selection.y -= 1;
    this.projectDidChange();
  }

  /**
   * Moves the selected objects down 1 pixel.
   */
  nudgeSelectionDown = () => {
    this.project.selection.y += 1;
    this.projectDidChange();
  }

  /**
   * Moves the selected objects right 1 pixel.
   */
  nudgeSelectionRight = () => {
    this.project.selection.x += 1;
    this.projectDidChange();
  }

  /**
   * Moves the selected objects left 1 pixel.
   */
  nudgeSelectionLeft = () => {
    this.project.selection.x -= 1;
    this.projectDidChange();
  }

  /**
   * Moves the selected objects up 10 pixels.
   */
  nudgeSelectionUpMore = () => {
    this.project.selection.y -= 10;
    this.projectDidChange();
  }

  /**
   * Moves the selected objects down 10 pixels.
   */
  nudgeSelectionDownMore = () => {
    this.project.selection.y += 10;
    this.projectDidChange();
  }

  /**
   * Moves the selected objects right 10 pixels.
   */
  nudgeSelectionRightMore = () => {
    this.project.selection.x += 10;
    this.projectDidChange();
  }

  /**
   * Moves the selected objects left 10 pixels.
   */
  nudgeSelectionLeftMore = () => {
    this.project.selection.x -= 10;
    this.projectDidChange();
  }

  /**
   * Updates the Wick Project settings with new values passed in as an object. Will make no changes if input is invalid or the same as the previous settings.
   * @param {object} newSettings an object containing all of the settings to update within the project. Accepts valid project settings such as 'name', 'width', 'height', 'framerate', and 'backgroundColor'.
   */
  updateProjectSettings = (newSettings) => {
    let validKeys = ["name", "width", "height", "backgroundColor", "framerate"];
    let updated = false;

    Object.keys(newSettings).forEach(key => {
      if (validKeys.indexOf(key) === -1) return;

      let oldVal = this.project[key];
      if (oldVal !== newSettings[key]) {
        this.project[key] = newSettings[key];
        updated = true;
      }
    });

    if (updated) {
      this.projectDidChange();
    }
  }

  /**
   * Sets the project focus to the timeline of the currently selected clip.
   */
  focusTimelineOfSelectedObject = () => {
    this.project.focusTimelineOfSelectedClip();
    this.projectDidChange();
  }

  /**
   * Sets the project focus to the parent timeline of the currently selected clip.
   */
  focusTimelineOfParentClip = () => {
    this.project.focusTimelineOfParentClip();
    this.projectDidChange();
  }

  /**
   * Horizontally flips the canvas selection.
   */
  flipSelectedHorizontal = () => {
    this.project.flipSelectionHorizontally();
  }

  /**
   * Vertically flips the canvas selection.
   */
  flipSelectedVertical = () => {
    this.project.flipSelectionVertically();
  }

  /**
   * Creates an image from an asset's uuid and places it on the canvas.
   * @param {string} uuid The UUID of the desired asset.
   * @param {number} x    The x location of the image after creation in relation to the window.
   * @param {number} y    The y location of the image after creation in relation to the window.
   */
  createImageFromAsset = (uuid, x, y) => {
    this.project.createImagePathFromAsset(this.project.getChildByUUID(uuid), x, y, path => {
      this.projectDidChange();
    });
  }

  /**
   * Creates and imports Wick Assets from the acceptedFiles list, and displays an alert message for rejected files.
   * @param {File[]} acceptedFiles - Files uploaded by user with supported MIME types to import into the project
   * @param {File[]} rejectedFiles - Files uploaded by user with unsupported MIME types.
   */
  createAssets = (acceptedFiles, rejectedFiles) => {
    this.toast('Importing files...', 'info');

    // Error message for failed uploads
    if (rejectedFiles.length > 0) {
      let fileNamesRejected = rejectedFiles.map(file => file.name).join(', ');
      this.toast('Could not import files: ' + fileNamesRejected, 'error');
    }

    // Add all successfully uploaded assets
    acceptedFiles.forEach(file => {
      this.project.importFile(file, asset => {
        if(asset === null) {
          this.toast('Could not add files to project: ' + file.name, 'error');
        } else {
          this.toast('Imported "' + file.name + '" successfully.', 'success');
          localForage.setItem(this.autoSaveAssetsKey, window.Wick.FileCache.getAllFiles());
          this.projectDidChange();
        }
      });
    });
  }

  /**
   * Begin the symbol creation process.
   */
  beginSymbolCreation = () => {
    this.openModal("CreateSymbol");
  }

  /**
   * Returns a serialized version of the selection.
   * @return {object[]} array of serialized objects
   */
  serializeSelection = () => {
    return this.project.selection.getSelectedObjects().map(object => {
      return object.clone(false).serialize();
    });
  }

  /**
   * Parses a serialized selection.
   * @param {object[]} selection array of serialized object.
   * @return {object[]} array of deserialzed objects
   */
  deserializeSelection = (selection) => {
    return selection.map(data => {
      // Deserialize and do not retain the uuids.
      return window.Wick.Base.deserialize(data).clone(false);
    });
  }

  /**
   * Copies the selection state and selected objects to the clipboard.
   */
  copySelectionToClipboard = () => {
    if(this.project.selection.numObjects === 0) {
      this.toast('There is nothing to copy.', 'warning');
      return;
    }

    let serializedSelection = this.serializeSelection();
    localForage.setItem('wickClipboard', serializedSelection).then(() => {
    }).catch( (err) => {
      console.error("Error when copying to clipboard.");
      console.error(err);
    });
  }

  /**
   * Copies the selected objects to the clipboard and then deletes them from the project.
   */
  cutSelectionToClipboard = () => {
    this.copySelectionToClipboard();
    this.deleteSelectedObjects();
  }

  /**
   * Attempts to paste in objects on the clipboard if they are available. Expects clipboard contains a serialized selection.
   * @return {[type]} [description]
   */
  pasteFromClipboard = () => {
    localForage.getItem('wickClipboard')
    .then((serializedSelection) => {
      let deserialized = this.deserializeSelection(serializedSelection);
      this.addSelectionToProject(deserialized, {offset: {x: 25, y: 25}});
    })
    .catch((err) => {
      this.toast('There was an error while trying to paste.', 'error');
      console.error(err);
    });
  }

  /**
   * Adds a deserialized selection to the project.
   * @param {object} selection deserialized selection object to add to project.
   */
  addSelectionToProject = (selection, options) => {
    // Apply the change of the current selection before clearing it.
    this.project.view.applyChanges();

    // Only copies clips and paths. TODO: Add Frames
    selection.filter(object => {
      return ((object instanceof window.Wick.Path) || (object instanceof window.Wick.Clip));
    }).forEach(object => {
      this.project.addObject(object);
    });

    // Select newly added objects.
    this.project.selection.clear();
    selection.forEach(object => {
      this.project.selection.select(object);
    });

    // Apply any changes to our objects.
    if (options.offset) {
      this.project.selection.x += options.offset.x;
      this.project.selection.y += options.offset.y;
    }

    this.projectDidChange();
  }

  /**
   * Export the current project as a Wick File using the save as dialog.
   */
  exportProjectAsWickFile = () => {
    this.toast('Exporting project as a .wick file...', 'info');

    this.project.exportAsWickFile((file) => {
      if (file === undefined) {
        this.toast('Could not export project.', 'error');
        return;
      }
      saveAs(file, this.project.name + '.wick');
    });
  }

  /**
   * Export the current project as an animated GIF.
   */
  exportProjectAsAnimatedGIF = () => {
    this.toast('Exporting animated GIF...', 'info');
    GIFExport.createAnimatedGIFFromProject(this.project, blob => {
      this.project = window.Wick.Project.deserialize(this.project.serialize());
      saveAs(blob, this.project.name + '.gif');
    });
  }

  /**
   * Export the current project as a bundled standalone ZIP that can be uploaded to itch/newgrounds/etc.
   */
  exportProjectAsStandaloneZIP = () => {
    this.toast('Exporting project as ZIP...', 'info');
    ZIPExport.bundleStandaloneProject(this.project, blob => {
      saveAs(blob, this.project.name + '.zip');
    });
  }

  /**
   * Imports a wick file into the editor.
   * @param {File} file Zipped wick file to import.
   */
  importProjectAsWickFile = (file) => {
    window.Wick.Project.fromWickFile(file, project => {
      if(project) {
        this.setupNewProject(project);
        this.toast('Opened "' + file.name + '" successfully.', 'success');
      } else {
        this.toast('Could not open project.', 'error');
      }
    });
  }

  /**
   * Sets up a new project in the editor. This operation will remove the
   * history, selection, and all other ability to retrieve your project.
   * @param  {Wick.Project} project project to load.
   */
  setupNewProject = (project) => {
    this.resetEditorForLoad();
    project.selection.clear();
    this.project = project;
    localForage.setItem(this.autoSaveAssetsKey, window.Wick.FileCache.getAllFiles());
    this.projectDidChange();
  }

  /**
   * Attempts to automatically load an autosaved project if it exists.
   * Does nothing if not autosaved project is stored.
   */
  attemptAutoLoad = () => {
    localForage.getItem(this.autoSaveAssetsKey).then(serializedAssets => {
      serializedAssets.forEach(asset => {
        window.Wick.FileCache.addFile(asset.src, asset.uuid);
      });
      localForage.getItem(this.autoSaveKey).then(serializedProject => {
        let deserialized = window.Wick.Project.deserialize(serializedProject);
        this.setupNewProject(deserialized);
      });
    });
  }

  /**
   * Check if auto saved project exists.
   * @param  {Function} callback a callback which receives a boolean.
   * True if an autosave exists.
   */
  doesAutoSavedProjectExist = (callback) => {
    localForage.getItem(this.autoSaveKey).then(serializedProject => {
      if (serializedProject) {
        callback(true);
      } else {
        callback(false);
      }
    });
  }

  /**
   * Clears any autosaved project from local storage.
   */
  clearAutoSavedProject = () => {
    localForage.removeItem(this.autoSaveKey).then(() => {
      // Autosaved cleared
    });
  }

  /**
   * Autosaves a serialized project.
   * @param  {string} serializedProject
   */
  autosaveProject = (serializedProject) => {
    localForage.setItem(this.autoSaveKey, serializedProject);
  }

  /**
   * Toggle onion skinning on/off.
   */
  toggleOnionSkin = () => {
    this.project.onionSkinEnabled = !this.project.onionSkinEnabled;
    this.projectDidChange();
  }

  /**
   * Return all possible sound assets.
   */
  getAllSoundAssets = () => {
    return this.project.getAssets('Sound');
  }

  /**
   * Toggles the preview play between on and off states.
   */
  togglePreviewPlaying = () => {
    // Apply the change of the current selection before clearing it.
    this.project.view.applyChanges();
    this.project.selection.clear();

    let nextState = !this.state.previewPlaying;
    this.setState({
      previewPlaying: nextState,
      codeErrors: [],
    });

    if(nextState) {
      // Focus canvas element here
    }
  }

  /**
   * Stops the project if it is currently preview playing and displays provided
   * errors in the code editor.
   * @param  {object[]} errors Array of error objects.
   */
  stopPreviewPlaying = (errors) => {
    this.setState({
      previewPlaying: false,
      codeErrors: errors === undefined ? [] : errors,
    });

    if (errors) {
      this.showCodeErrors(errors);
    }
  }
}

export default EditorCore;
