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
import VideoExport from './export/VideoExport/VideoExport';

class EditorCore extends Component {
  /**
   * Returns the name of the active tool.
   * @returns {string} The string representation active tool name.
   */
  getActiveTool = () => {
    return this.project.activeTool;
  }

  /**
   * Change the active tool.
   * @param {string} newTool - The string representation of the tool to switch to.
   */
  setActiveTool = (newTool) => {
    if(newTool !== this.getActiveTool().name) {
      if(newTool !== 'pan') {
        this.project.selection.clear();
      }

      this.lastUsedTool = this.getActiveTool();
      this.project.activeTool = newTool;

      this.projectDidChange();
    }
  }

  /**
   * Activates the tool that was used before the current tool was activated.
   */
  activateLastTool = () => {
    this.project.activeTool = this.lastUsedTool;
    this.projectDidChange();
  }

  /**
   * Undo the last action that was done.
   */
  undoAction = () => {
    if(!this.project.undo()) {
      this.toast('Nothing to undo.', 'warning');
    } else {
      this.projectDidChange({skipHistory:true});
    }
  }

  /**
   * Recover the state of the project from before the last action was done.
   */
  redoAction = () => {
    if(!this.project.redo()) {
      this.toast('Nothing to redo.', 'warning');
    } else {
      this.projectDidChange({skipHistory:true});
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
   * Zooms in the canvas.
   */
  zoomIn = () => {
    this.project.zoomIn();
    this.projectDidChange();
  }

  /**
   * Zooms out the canvas.
   */
  zoomOut = () => {
    this.project.zoomOut();
    this.projectDidChange();
  }

  /**
   * Returns an object containing the tool settings.
   * @returns {object} The object containing the tool settings.
   */
  getToolSetting = (name) => {
    return this.project.toolSettings.getSetting(name);
  }

  /**
   * Updates the tool settings state.
   * @param {object} newToolSettings - An object of key-value pairs where the keys represent tool settings and the values represent the values to change those settings to.
   */
  setToolSetting = (name, value) => {
    this.project.toolSettings.setSetting(name, value);
    this.projectDidChange();
  }

  /**
   *
   */
  getToolSettingRestrictions = (name) => {
      return this.project.toolSettings.getSettingRestrictions(name);
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
        var selectedObject = selection.getSelectedObject();
        if(selectedObject instanceof window.Wick.Path) {
          return selectedObject.pathType;
        } else if(selectedObject instanceof window.Wick.Button) {
          return 'button';
        } else if(selectedObject instanceof window.Wick.Clip) {
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
        // TODO: Should return info about "mixed" attributes, but just
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
      "fontWeight",
      "fontStyle",
      "src",
      "frameLength",
      "x",
      "y",
      "width",
      "height",
      "rotation",
      "opacity",
      "sound",
      "soundVolume",
      "soundStart",
      "identifier",
      "easingType",
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
    this.project.createClipFromSelection({
      identifier: name,
      type: type
    });
    this.projectDidChange();
  }

  /**
   * Creates a new clip from the selected paths and clips and adds it to the project.
   * @param {string} name The name of the clip after creation.
   */
  createClipFromSelection = (name) => {
    this.project.createClipFromSelection({
      identifier: name,
      type: 'Clip'
    });
    this.projectDidChange();
  }

  /**
   * Creates a new button from the selected paths and clips and adds it to the project.
   * @param {string} name The name of the button after creation.
   */
  createButtonFromSelection = (name) => {
    this.project.createClipFromSelection({
      identifier: name,
      type: 'Button'
    });
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
   * Deletes a sub script from a script object.
   * @param {Object} scriptOwner Script owner to remove sub script from
   * @param {string} scriptName Name of the script to remove
   */
  deleteScript = (scriptOwner, scriptName) => {
    let oldEditorState = this.state.codeEditorOpen;

    // Turn off code editor if necessary, then open warning modal.
    this.toggleCodeEditor(false);

    this.openWarningModal({
      description: 'Delete Script: "' + scriptName + '" from the selected object?',
      title: "Delete Script",
      acceptText: "Delete",
      cancelText: "Cancel",
      acceptAction: (() => scriptOwner.removeScript(scriptName)),
      finalAction: (() => this.toggleCodeEditor(oldEditorState)), // Reopen code editor if necessary.
    });

  }

  /**
   * Opens the code editor to the script name tab if that tab exists.
   * @param {string} scriptName Name of the script to open the tab of. Must be all lowercase.
   */
  editScript = (scriptName) => {
    this.setState({
      scriptToEdit: scriptName,
      codeEditorOpen: true,
    });
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
  sendSelectionToFront = () => {
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
   * Horizontally flips the canvas selection.
   */
  flipSelectedHorizontal = () => {
    this.project.flipSelectionHorizontally();
    this.projectDidChange();
  }

  /**
   * Vertically flips the canvas selection.
   */
  flipSelectedVertical = () => {
    this.project.flipSelectionVertically();
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
   * Creates an image from an asset's uuid and places it on the canvas.
   * @param {string} uuid The UUID of the desired asset.
   * @param {number} x    The x location of the image after creation in relation to the window.
   * @param {number} y    The y location of the image after creation in relation to the window.
   */
  createImageFromAsset = (uuid, x, y) => {
    // convert screen position to wick project position
    let paper = this.project.view.paper;
    let canvasPosition = paper.project.view.element.getBoundingClientRect();
    x -= canvasPosition.x;
    y -= canvasPosition.y;
    let dropPoint = paper.view.viewToProject(new window.paper.Point(x,y));

    let obj = window.Wick.ObjectCache.getObjectByUUID(uuid);

    if (!(obj instanceof window.Wick.ImageAsset)) {
      console.error("Object not an instance of Wick Image Asset");
      return;
    }

    this.project.createImagePathFromAsset(window.Wick.ObjectCache.getObjectByUUID(uuid), dropPoint.x, dropPoint.y, path => {
      this.projectDidChange();
    });
  }

 /**
   * Is called when a sound asset is dropped on the timeline element.
   * @param {string} uuid The UUID of the desired asset.
   * @param {number} x    The x location of the image after creation in relation to the window.
   * @param {number} y    The y location of the image after creation in relation to the window.
   */
  dropSoundOntoTimeline = (uuid, x, y) => {
    // TODO
    console.log("Dropping " + uuid + " at: " + x + "," + y); 
  }


  /**
   * Attempts to import an arbitrary asset to the project. Displays an error or success message
   * depending on if the action was successful.
   * @param {File} file - File object to create an asset of.
   * @param {Function} callback - (optional) Callback to return asset to. If the import was unsuccessful, null is sent to the callback.
   */
  importFileAsAsset = (file, callback) => {
    this.project.importFile(file, (asset) => {
      if (callback) callback(asset);

      if(asset === null) {
        this.toast('Could not add files to project: ' + file.name, 'error');
      } else {
        this.toast('Imported "' + file.name + '" successfully.', 'success');
        this.projectDidChange();
      }
    });
  }

  /**
   * Creates and imports Wick Assets from the acceptedFiles list, and displays an alert message for rejected files.
   * @param {File[]} acceptedFiles - Files uploaded by user with supported MIME types to import into the project
   * @param {File[]} rejectedFiles - Files uploaded by user with unsupported MIME types.
   */
  createAssets = (acceptedFiles, rejectedFiles) => {
    let toastID = this.toast('Importing files...', 'info');

    // Error message for failed uploads
    if (rejectedFiles.length > 0) {
      let fileNamesRejected = rejectedFiles.map(file => file.name).join(', ');
      this.updateToast(toastID, {
        type: 'error',
        text: 'Could not import files: ' + fileNamesRejected});
    }

    // Add all successfully uploaded assets
    acceptedFiles.forEach(file => {
      this.importFileAsAsset(file);
    });
  }

  /**
   * Begin interactive object creation process.
   */
  beginMakeInteractiveProcess = () => {
    this.openModal("MakeInteractive");
  }

  /**
   * Begin animated object creation process.
   */
  beginMakeAnimatedProcess = () => {
    this.openModal("MakeAnimated");
  }

  /**
   * Export the current project as a Wick File using the save as dialog.
   */
  exportProjectAsWickFile = () => {
    this.showWaitOverlay();

    let toastID = this.toast('Exporting project as a .wick file...', 'info', {autoClose: false});
    window.Wick.WickFile.toWickFile(this.project, file => {
      if (file === undefined) {
        this.updateToast(toastID, {
          type: 'error',
          text: "Could not export .wick file." });
        this.hideWaitOverlay();
        return;
      }

      this.updateToast(toastID, {
        type: 'success',
        text: "Successfully saved .wick file." });
      saveAs(file, this.project.name + '.wick');
      this.hideWaitOverlay();
    });
  }

  /**
   * Export the current project as an animated GIF.
   */
  exportProjectAsAnimatedGIF = (name) => {
    let outputName = name || this.project.name;
    let toastID = this.toast('Exporting animated GIF...', 'info');
    this.showWaitOverlay();
    GIFExport.createAnimatedGIFFromProject(this.project, blob => {
      this.updateToast(toastID, {
        type: 'success',
        text: "Successfully saved .gif file." });
      saveAs(blob, outputName + '.gif');
      this.hideWaitOverlay();
    });
  }

  /**
   * Export the current project as a video.
   */
  exportProjectAsVideo = (name) => {
    let outputName = name || this.project.name;

    let args = {
      project: this.project,
      onDone: (buffer) => {saveAs(new Blob([new Uint8Array(buffer)]), outputName + ".webm")},
    }

    VideoExport.renderProjectAsVideo(args);
  }

  /**
   * Export the current project as a bundled standalone ZIP that can be uploaded to itch/newgrounds/etc.
   */
  exportProjectAsStandaloneZip = (name) => {
    let toastID = this.toast('Exporting project as ZIP...', 'info');
    let outputName = name || this.project.name;
    ZIPExport.bundleStandaloneProject(this.project, blob => {
      this.updateToast(toastID, {
        type: 'success',
        text: "Successfully saved .zip file." });
      saveAs(blob, outputName + '.zip');
    });
  }

  /**
   * Imports a wick file into the editor.
   * @param {File} file Zipped wick file to import.
   */
  importProjectAsWickFile = (file) => {
    this.showWaitOverlay();
    window.Wick.WickFile.fromWickFile(file, project => {
      if(project) {
        this.setupNewProject(project);
        this.toast('Opened "' + file.name + '" successfully.', 'success');
      } else {
        this.toast('Could not open project.', 'error');
        this.hideWaitOverlay();
      }
    });
  }

  /**
   * Sets up a new project in the editor. This operation will remove the
   * history, selection, and all other ability to retrieve your project.
   * @param {Wick.Project} project project to load.
   */
  setupNewProject = (project) => {
    this.resetEditorForLoad();
    this.project = project;
    this.project.selection.clear();
    this.project.view.prerasterize(() => {
      this.projectDidChange();
      this.hideWaitOverlay();
      this.project.view.render();
    });
  }

  showAutosavedProjects = () => {
    this.doesAutoSavedProjectExist(exists => {
      if (exists) {
        this.queueModal('AutosaveWarning');
      }
    });
  }

  /**
   * Start a timer to run an autosave sometime in the future.
   */
  requestAutosave = () => {
      window.clearTimeout(this._autosaveTimeoutID);
      this._autosaveTimeoutID = window.setTimeout(() => {
          this.autoSaveProject();
      }, 1000 * 60);
  }

  /**
   * Save the current project in localstorage
   */
  autoSaveProject = () => {
    if (!this.project) return;

    this.showWaitOverlay();

    window.Wick.WickFile.toWickFile(this.project, wickFile => {
      localForage.setItem(this.autoSaveKey, wickFile).then(() => {
        this.hideWaitOverlay();
      });
    });
  }

  /**
   * Attempts to automatically load an autosaved project if it exists.
   * Does nothing if not autosaved project is stored.
   */
  loadAutosavedProject = (callback) => {
    this.showWaitOverlay();
    localForage.getItem(this.autoSaveKey).then(wickFile => {
      window.Wick.WickFile.fromWickFile(wickFile, project => {
        this.setupNewProject(project);
        this.hideWaitOverlay();
        callback();
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
  clearAutoSavedProject = (callback) => {
    localForage.removeItem(this.autoSaveKey).then(() => {
      callback();
    });
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
    if(this.processingAction) return;
    this.showWaitOverlay();
    this.processingAction = true;

    // Apply the change of the current selection before clearing it.
    if(this.project.selection.numObjects > 0) {
      this.project.view.applyChanges();
      this.project.selection.clear();
    }

    let proceed = () => {
      this.setState({
        previewPlaying: !this.state.previewPlaying,
        codeErrors: [],
      });
      this.hideWaitOverlay();
      this.processingAction = false;
    }

    // Skip prerasterize step if we are stopping preview play.
    if(this.state.previewPlaying) {
      proceed();
    } else {
      this.project.view.prerasterize(() => {
        proceed();
      });
    }
  }

  /**
   * Start playing the project from the beginning of the timeline.
   */
  startPreviewPlayFromBeginning = () => {
      if(this.state.previewPlaying) return;

      this.project.focus.timeline.playheadPosition = 1;
      this.togglePreviewPlaying();
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

    this.projectDidChange();

    if (errors) {
      this.showCodeErrors(errors);
    }
  }

  /**
   * Copies the selection state and selected objects to the clipboard.
   */
  copySelectionToClipboard = () => {
    if(this.project.copySelectionToClipboard()) {
      this.projectDidChange();
    } else {
      this.toast('There is nothing to copy.', 'warning');
    }
  }

  /**
   * Copies the selected objects to the clipboard and then deletes them from the project.
   */
  cutSelectionToClipboard = () => {
    if(this.project.copySelectionToClipboard()) {
      this.deleteSelectedObjects();
      this.projectDidChange();
    } else {
      this.toast('There is nothing to cut.', 'warning');
    }
  }

  /**
   * Attempts to paste in objects on the clipboard if they are available.
   * @return {[type]} [description]
   */
  pasteFromClipboard = () => {
    if(this.project.pasteClipboardContents()) {
      this.projectDidChange();
    } else {
      this.toast('There is nothing in the clipboard to paste.', 'warning');
    }
  }

  /**
   * Creates a new keyframe at the current playhead position.
   */
  addTweenKeyframe = () => {
    if(!this.project.activeFrame) return;
    this.project.activeFrame.createTween();
    this.projectDidChange();
  }

  /**
   * Returns all existing fonts in the project.
   */
  getExistingFonts = () => {
    return this.project.getFonts();
  }

  /**
   * returns true if the project has the passed in font.
   * @param {string} font Font to check
   * @return {boolean} true if the project has this font.
   */
  hasFont = (font) => {
    return this.project.hasFont(font);
  }

}

export default EditorCore;
