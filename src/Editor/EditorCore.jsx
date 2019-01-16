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

class EditorCore extends Component {
  constructor () {
    super();

    this.state = {
      project: null,
      paper: null,
      canvas: null,
      onionSkinEnabled: false,
      onionSkinSeekForwards: 1,
      onionSkinSeekBackwards: 1,
      selection: this.blankSelection(),
      activeTool: 'cursor',
      toolSettings: {
        fillColor: '#ffaabb',
        strokeColor: '#000',
        strokeWidth: 1,
        brushSize: 10,
        brushSmoothing: 0.9,
        brushSmoothness: 10,
        cornerRadius: 0,
        pressureEnabled: false,
      },
    }

    this.setEditorState = this.setEditorState.bind(this);
    this.forceUpdateProject = this.forceUpdateProject.bind(this);
    this.selectObjects = this.selectObjects.bind(this);
    this.isObjectSelected = this.isObjectSelected.bind(this);
    this.getSelectionType = this.getSelectionType.bind(this);
    this.getSelectedTimelineObjects = this.getSelectedTimelineObjects.bind(this);
    this.getActiveTool = this.getActiveTool.bind(this);
    this.setActiveTool = this.setActiveTool.bind(this);
    this.getToolSettings = this.getToolSettings.bind(this);
    this.setToolSettings = this.setToolSettings.bind(this);
    this.getSelectionAttributes = this.getSelectionAttributes.bind(this);
    this.setSelectionAttributes = this.setSelectionAttributes.bind(this);
    this.convertSelectionToSymbol = this.convertSelectionToSymbol.bind(this);
    this.focusSelectedObject = this.focusSelectedObject.bind(this);
    this.focusObjectOneLevelUp = this.focusObjectOneLevelUp.bind(this);
    this.getOnionSkinOptions = this.getOnionSkinOptions.bind(this);
    this.setOnionSkinOptions = this.setOnionSkinOptions.bind(this);
  }

  /**
   * A wrapper for setState that checks if the project or selection changed. If either one did, current state is pushed to the history stack.
   * @param {object} newState - the state object to send to setState.
   */
  setEditorState (newState) {
    console.log(newState)
    if (newState.project || newState.selection) {
      this.state.history.saveState();
    }
    this.setState(newState);
  }

  /**
   * This function must be called after changing properties of the project without calling setState.
   */
  forceUpdateProject () {
    this.setEditorState({
      project: this.state.project,
    });
  }

  /**
   * Initializes the Wick Engine and the paper.js renderer
   */
  initializeEngine () {
    this.setState({
      project: new window.Wick.Project(),
      paper: window.paper,
      canvas: new window.Wick.Canvas(),
    });
  }

  /**
   * Returns the name of the active tool.
   * @returns {string} The string representation active tool name.
   */
  getActiveTool () {
    return this.state.activeTool;
  }

  /**
   * Change the active tool.
   * @param {string} newTool - The string representation of the tool to switch to.
   */
  setActiveTool (newTool) {
    let newState = { activeTool: newTool };
    if(this.state.activeTool === 'cursor' && newTool !== 'cursor') {
      newState.selection = this.blankSelection();
    }
    this.setEditorState(newState);
  }

  /**
   * Returns an object containing the tool settings.
   * @returns {object} The object containing the tool settings.
   */
  getToolSettings () {
    return this.state.toolSettings;
  }

  /**
   * Updates the tool settings state.
   * @param {object} newToolSettings - An object of key-value pairs where the keys represent tool settings and the values represent the values to change those settings to.
   */
  setToolSettings (newToolSettings) {
    this.setEditorState({
      toolSettings: {
        ...this.state.toolSettings,
        ...newToolSettings,
      }
    });
  }

  /**
   * Determines the type of the object/objects that are in the selection state.
   * @returns {string} The string representation of the type of object/objects selected
   */
  getSelectionType () {
    let numTimelineObjects = this.getSelectedTimelineObjects().length;
    let numFrames = this.getSelectedFrames().length;
    let numTweens = this.getSelectedTweens().length;
    let numCanvasObjects = this.getSelectedCanvasObjects().length;
    let numPaths = this.getSelectedPaths().length;
    let numClips = this.getSelectedClips().length;
    let numAssetLibraryObjects = this.getSelectedAssetLibraryObjects().length;
    let numSoundAssets = this.getSelectedSoundAssets().length;
    let numImageAssets = this.getSelectedImageAssets().length;

    if(numTimelineObjects > 0) {
      if(numFrames > 0 && numTweens > 0) {
        return 'multitimeline';
      } else if (numFrames === 1) {
        return 'frame';
      } else if (numTweens === 1) {
        return 'tween';
      } else if (numFrames > 1) {
        return 'multiframe';
      } else if (numTweens > 1) {
        return 'multitween';
      }
    } else if(numCanvasObjects > 0) {
      if(numPaths > 0 && numClips > 0) {
        return 'multicanvasmixed';
      } else if (numPaths === 1) {
        return 'path';
      } else if (numClips === 1) {
        return 'clip';
      } else if (numPaths > 1) {
        return 'multipath';
      } else if (numClips > 1) {
        return 'multiclip';
      }
    } else if(numAssetLibraryObjects > 0) {
      if (numSoundAssets > 0 && numImageAssets > 0) {
        return 'multiassetmixed';
      } else if (numSoundAssets === 1) {
        return 'soundasset';
      } else if (numImageAssets === 1) {
        return 'imageasset';
      } else if (numSoundAssets > 1) {
        return 'multisoundasset';
      } else if (numImageAssets > 1) {
        return 'multiimageasset';
      }
    } else {
      return null;
    }
  }

  /**
   * Returns all selected objects on the timeline.
   * @returns {(<Wick.Frame>|<Wick.Tween>)[]} An array containing the selected tweens and frames
   */
  getSelectedTimelineObjects () {
    return this.getSelectedFrames().concat(this.getSelectedTweens());
  }

  /**
   * Returns all selected frames.
   * @returns {<Wick.Frame>)[]} An array containing the selected frames.
   */
  getSelectedFrames () {
    return this.state.selection.timeline.frames.map(uuid => {
      return this.state.project._childByUUID(uuid);
    });
  }

  /**
   * Returns all selected tweens.
   * @returns {<Wick.Tween>)[]} An array containing the selected tweens.
   */
  getSelectedTweens () {
    return this.state.selection.timeline.tweens.map(uuid => {
      return this.state.project._childByUUID(uuid);
    });
  }

  /**
   * Returns all selected objects on the timeline.
   * @returns {(<paper.Item>|<Wick.Clip>|<Wick.Button>)[]} An array containing the selected clips and paths
   */
  getSelectedCanvasObjects () {
    return this.getSelectedPaths().concat(this.getSelectedClips());
  }

  /**
   * Returns all selected paths.
   * @returns {<paper.Item>)[]} An array containing the selected paths.
   */
  getSelectedPaths () {
    if(!this.state.paper.project) return [];

    let paths = [];
    this.state.paper.project.layers.forEach(layer => {
      layer.children.forEach(child => {
        if(this.state.selection.canvas.paths.indexOf(child.name) > -1) {
          paths.push(child);
        }
      });
    });
    return paths;
  }

  /**
   * Returns all selected clips.
   * @returns {<Wick.Clip>)[]} An array containing the selected clips.
   */
  getSelectedClips () {
    return this.state.selection.canvas.clips.map(uuid => {
      return this.state.project._childByUUID(uuid);
    });
  }

  /**
   * Returns all selected buttons.
   * @returns {<paper.Item>)[]} An array containing the selected buttons.
   */
  getSelectedButtons () {
    return this.getSelectedClips().filter(clip => {
      return clip instanceof window.Wick.Button;
    });
  }

  /**
   * Returns all selected objects in the asset library.
   * @returns {(<Wick.ImageAsset>|<Wick.SoundAsset>)[]} An array containing the selected assets
   */
  getSelectedAssetLibraryObjects () {
    return this.state.selection.assetLibrary.assets.map(uuid => {
      return this.state.project._childByUUID(uuid);
    });
  }

  /**
   * Returns all selected sound assets from the asset library.
   * @returns {(<Wick.SoundAsset>)[]} An array containing the selected sound assets.
   */
  getSelectedSoundAssets () {
    return this.getSelectedAssetLibraryObjects().filter(asset => {
      return asset instanceof window.Wick.SoundAsset;
    });
  }

  /**
   * Returns all selected image assets from the asset library.
   * @returns {(<Wick.ImageAsset>)[]} An array containing the selected image assets.
   */
  getSelectedImageAssets () {
    return this.getSelectedAssetLibraryObjects().filter(asset => {
      return asset instanceof window.Wick.ImageAsset;
    });
  }

  /**
   * Returns an object containing all attributes of the selection.
   * @returns {object} The object containing all the selection attributes.
   */
  getSelectionAttributes () {
    return {
      name: this.getSelectionName(),
      filename: this.getSelectionFilename(),
      src: this.getSelectionSrc(),
      x: this.getSelectionPositionX(),
      width: this.getSelectionWidth(),
    };
  }

  /**
   * Returns the name of the selected object.
   * @returns {string|null} The name of the selected object. Returns null if selection type does not have a name.
   */
  getSelectionName () {
    let selectionType = this.getSelectionType();

    if (selectionType === 'clip') {
      return this.getSelectedClips()[0].name;
    } else if (selectionType === 'imageasset') {
      return this.getSelectedImageAssets()[0].name;
    } else if (selectionType === 'soundasset') {
      return this.getSelectedSoundAssets()[0].name;
    } else if (selectionType === 'frame') {
      return this.getSelectedFrames()[0].name;
    } else {
      return null;
    }
  }

  /**
   * Returns the filename of the selected object.
   * @returns {string|null} The filename of the selected object. Returns null if selection type does not have a filename.
   */
  getSelectionFilename () {
    let selectionType = this.getSelectionType();

    if (selectionType === 'imageasset' || selectionType === 'soundasset') {
      return this.getSelectedAssetLibraryObjects()[0].filename;
    } else {
      return null;
    }
  }

  getSelectionPositionX () {
    if(this.getSelectedCanvasObjects().length > 0) {
      return window.paper.project.selection.bounds.x;
    } else {
      return 0;
    }
  }

  getSelectionWidth () {
    if(this.getSelectedCanvasObjects().length > 0) {
      return window.paper.project.selection.bounds.width;
    } else {
      return 0;
    }
  }

  /**
   * Returns the source of the selected object.
   * @returns {string|null} The src dataURL of the selected object. Returns null if selection type does not have a src property.
   */
  getSelectionSrc () {
    let selectionType = this.getSelectionType();

    if (selectionType === 'imageasset' || selectionType === 'soundasset') {
      return this.getSelectedAssetLibraryObjects()[0].src;
    } else {
      return null;
    }
  }

  /**
   * Updates the state of the selection with new values.
   * @param {object} newSelectionAttributes - A object containing the new values of the selection to use to update the state.
   */
  setSelectionAttributes (newSelectionAttributes) {
    if(newSelectionAttributes.name) {
      this.setSelectionName(newSelectionAttributes.name);
    }
    if(newSelectionAttributes.x !== undefined) {
      this.setSelectionPositionX(newSelectionAttributes.x);
    }
    if(newSelectionAttributes.width) {
      this.setSelectionWidth(newSelectionAttributes.width);
    }
    this.setEditorState({
      project: this.state.project
    });
  }

  /**
   * Updates the name of the selected object.
   * @param {string} newName - The name to use.
   */
  setSelectionName (newName) {
    if(this.getSelectedClips().length === 1) {
      this.getSelectedClips()[0].name = newName;
    } else if (this.getSelectedAssetLibraryObjects().length === 1) {
      this.getSelectedAssetLibraryObjects()[0].name = newName;
    }
  }

  setSelectionPositionX (x) {
    if(this.getSelectedCanvasObjects().length > 0) {
      let y = window.paper.project.selection.bounds.y;
      window.paper.project.selection.setPosition(x, y);
      this.applyCanvasChangesToProject();
    }
  }

  setSelectionWidth (width) {
    if(this.getSelectedCanvasObjects().length > 0) {
      let height = window.paper.project.selection.bounds.height;
      window.paper.project.selection.setWidthHeight(width, height);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Determines the selection type of an object, and returns it as a string.
   * @param {object} object - The object to find the type of.
   */
  selectionTypeOfObject (object) {
    if(object instanceof window.Wick.Asset) {
      return 'asset';
    } else if (object instanceof window.paper.Group) {
      return 'clip';
    } else if (object instanceof window.paper.Path
            || object instanceof window.paper.CompoundPath) {
      return 'path';
    } else if (object instanceof window.Wick.Frame) {
      return 'frame';
    } else if (object instanceof window.Wick.Tween) {
      return 'tween';
    }
  }

  /**
   * Adds an asset to the selection.
   * @param {<Wick.Asset>} asset - The asset to add to the selection.
   * @param {object} selection - The selection to add the asset to.
   * @returns {object} The updated selection.
   */
  addAssetToSelection (asset, selection) {
    selection.assetLibrary.assets.push(asset.uuid);
    return selection;
  }

  /**
   * Adds a clip to the selection.
   * @param {<paper.Group>} clip - The clip to add to the selection.
   * @param {object} selection - The selection to add the clip to.
   * @returns {object} The updated selection.
   */
  addClipToSelection (clip, selection) {
    selection.canvas.clips.push(clip.data.wickUUID);
    return selection;
  }

  /**
   * Adds a path to the selection.
   * @param {<paper.Path>|<paper.CompoundPath>} path - The path to add to the selection.
   * @param {object} selection - The selection to add the path to.
   * @returns {object} The updated selection.
   */
  addPathToSelection (path, selection) {
    selection.canvas.paths.push(path.name);
    return selection;
  }

  addFrameToSelection (frame, selection) {
    selection.timeline.frames.push(frame.uuid);
    return selection;
  }

  addTweenToSelection (tween, selection) {
    selection.timeline.tweens.push(tween.uuid);
    return selection;
  }

  /**
   * Adds an object to the selection.
   * @param {object} object - The object to add to the selection.
   * @param {object} selection - The selection to add the object to.
   * @return {object} The updated selection.
   */
  addObjectToSelection (object, selection) {
    let type = this.selectionTypeOfObject(object);
    if(!type) return false;
    if(type === 'asset') {
      selection = this.addAssetToSelection(object, selection);
    } else if(type === 'path') {
      selection = this.addPathToSelection(object, selection);
    } else if(type === 'clip') {
      selection = this.addClipToSelection(object, selection);
    } else if(type === 'frame') {
      selection = this.addFrameToSelection(object, selection);
    } else if(type === 'tween') {
      selection = this.addTweenToSelection(object, selection);
    }
    return selection;
  }

  /**
   * Adds multiple objects to the selection.
   * @param {object[]} objects - The objects to add to the selection.
   * @param {object} selection - The selection to add the objects to.
   * @return {object} The updated selection.
   */
  addObjectsToSelection (objects, selection) {
    objects.forEach(object => {
      selection = this.addObjectToSelection(object, selection);
    });
    return selection;
  }

  /**
   * Clears the selection, then adds the given object to the selection.
   * @param {object} object - The object to add to the selection.
   */
  selectObject (object) {
    this.selectObjects([object]);
  }

  /**
   * Clears the selection, then adds the given objects to the selection.
   * @param {object[]} objects - The objects to add to the selection.
   */
  selectObjects (objects) {
    this.setEditorState({
      selection: this.addObjectsToSelection(objects, this.blankSelection())
    });
  }

  /**
   * Clears the selection.
   */
  clearSelection () {
    this.setEditorState({
      selection: this.blankSelection()
    });
  }

  blankSelection () {
    return {
      timeline: {
        frames: [],
        tweens: [],
      },
      canvas: {
        paths: [],
        clips: [],
      },
      assetLibrary: {
        assets: [],
      },
    };
  }

  /**
   * Determines if a given asset is selected.
   * @param {<Wick.Asset>} object - Asset to check selection status
   * @returns {boolean} - True if the asset is selected, false otherwise
   */
  isAssetSelected (asset) {
    return this.state.selection.assetLibrary.assets.indexOf(asset.uuid) > -1;
  }

  /**
   * Determines if a given path is selected.
   * @param {<paper.Path>} path - Path to check selection status
   * @returns {boolean} - True if the path is selected, false otherwise
   */
  isPathSelected (path) {
    return this.state.selection.canvas.paths.indexOf(path.name) > -1;
  }

  /**
   * Determines if a given clip is selected.
   * @param {<Wick.Clip>} path - Clip to check selection status
   * @returns {boolean} - True if the clip is selected, false otherwise
   */
  isClipSelected (clip) {
    return this.state.selection.canvas.clips.indexOf(clip.uuid) > -1;
  }

  /**
   * Determines if a given tween is selected.
   * @param {<Wick.Tween>} tween - Tween to check selection status
   * @returns {boolean} - True if the tween is selected, false otherwise
   */
  isTweenSelected (tween) {
    return this.state.selection.timeline.tweens.indexOf(tween.uuid) > -1;
  }

  /**
   * Determines if a given frame is selected.
   * @param {<Wick.Frame>} path - Frame to check selection status
   * @returns {boolean} - True if the frame is selected, false otherwise
   */
  isFrameSelected (frame) {
    return this.state.selection.timeline.frames.indexOf(frame.uuid) > -1;
  }

  /**
   * Determines if a given object is selected.
   * @param {object} object - Selection object to check if it is selected
   * @returns {boolean} - True if the object is selected, false otherwise
   */
  isObjectSelected (object) {
    let type = this.selectionTypeOfObject(object);
    if(type === 'asset') {
      return this.isAssetSelected(object);
    } else if(type === 'path') {
      return this.isPathSelected(object);
    } else if(type === 'clip') {
      return this.isClipSelected(object);
    } else if(type === 'tween') {
      return this.isTweenSelected(object);
    } else if(type === 'frame') {
      return this.isFrameSelected(object);
    } else {
      return false;
    }
  }

  /**
   * Creates a new symbol from the selected paths and clips and adds it to the project.
   */
  convertSelectionToSymbol () {
    let svg = window.paper.project.selection.exportSVG();
    let clips = [] // TODO get groups

    let clip = new window.Wick.Clip();
    clip.timeline.addLayer(new window.Wick.Layer());
    clip.timeline.layers[0].addFrame(new window.Wick.Frame());
    clip.timeline.layers[0].frames[0].svg = svg;
    clips.forEach(clip => {
      clip.timeline.layers[0].frames[0].addClip(clip);
    });
    clip.x = this.state.paper.project.selection.bounds.center.x;
    clip.y = this.state.paper.project.selection.bounds.center.y;

    this.deleteSelectedCanvasObjects();

    this.state.project.focus.timeline.activeLayer.activeFrame.addClip(clip);
    this.forceUpdateProject();
  }

  /**
   * Deletes all selected objects on the canvas.
   * @returns {<paper.Path>|<paper.CompoundPath>|<paper.Group>[]} The objects that were deleted from the timeline.
   */
  deleteSelectedCanvasObjects () {
    return this.state.paper.drawingTools.cursor.deleteSelectedItems();
  }

  /**
   * Deletes all selected objects on the timeline.
   * @returns {<Wick.Frame>|<Wick.Tween>[]} The objects that were deleted from the timeline.
   */
  deleteSelectedTimelineObjects () {
    this.getSelectedFrames().forEach(frame => {
      frame.parent.removeFrame(frame);
    });
    this.getSelectedTweens().forEach(tween => {
      tween.parent.removeTween(tween);
    });
  }

  /**
   * Deletes all selected assets.
   * @returns {<Wick.Asset>[]} The assets that were deleted.
   */
  deleteSelectedAssetLibraryObjects () {
    this.getSelectedAssetLibraryObjects().forEach(asset => {
      asset.project.removeAsset(asset);
    });
  }

  /**
   * Deletes all selected objects.
   * @returns {object[]} The objects that were deleted.
   */
  deleteSelectedObjects () {
    let result = [];
    console.log(this.getSelectedTimelineObjects())
    if(this.getSelectedCanvasObjects().length > 0) {
      result = this.deleteSelectedCanvasObjects();
    } else if(this.getSelectedTimelineObjects().length > 0) {
      result = this.deleteSelectedTimelineObjects();
    } else if(this.getSelectedAssetLibraryObjects().length > 0) {
      result = this.deleteSelectedAssetLibraryObjects();
    }
    this.clearSelection();
    return result;
  }

  focusSelectedObject () {

  }

  focusObjectOneLevelUp () {

  }

  /**
   * Creates and imports Wick Assets from the acceptedFiles list, and displays an alert message for rejected files.
   * @param {File[]} acceptedFiles - Files uploaded by user with supported MIME types to import into the project
   * @param {File[]} rejectedFiles - Files uploaded by user with unsupported MIME types.
   */
  createAssets (acceptedFiles, rejectedFiles) {
    let self = this;
    if (rejectedFiles.length > 0) {
      alert("The Wick Editor could not accept these files." + JSON.stringify(rejectedFiles.map(f => f.name)));
    }

    if (acceptedFiles.length <= 0) return;

    acceptedFiles.forEach(file => {
      this.state.project.import(file, function (asset) {
        // After import success, update editor state.
        self.setEditorState({
          project: self.state.project,
        });
      });
    });
  }

  getOnionSkinOptions () {
    return {
      enabled: this.state.onionSkinEnabled,
      seekForwards: this.state.onionSkinSeekForwards,
      seekBackwards: this.state.onionSkinSeekBackwards
    }
  }

  setOnionSkinOptions (onionSkinOptions) {

  }
}

export default EditorCore;
