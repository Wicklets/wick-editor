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

import React, { Component } from 'react';

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
      previewPlaying: false,
    }

    this.selectObjects = this.selectObjects.bind(this);
    this.isObjectSelected = this.isObjectSelected.bind(this);
    this.getSelectionType = this.getSelectionType.bind(this);
    this.getActiveTool = this.getActiveTool.bind(this);
    this.setActiveTool = this.setActiveTool.bind(this);
    this.getToolSettings = this.getToolSettings.bind(this);
    this.setToolSettings = this.setToolSettings.bind(this);
    this.getSelectionAttributes = this.getSelectionAttributes.bind(this);
    this.setSelectionAttributes = this.setSelectionAttributes.bind(this);
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
    this.setState({
      activeTool: newTool,
    });
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
    this.setState({
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
    let selection = this.state.selection;

    let numTimelineObjects = this.getSelectedTimelineObjects().length;
    let numFrames = this.getSelectedFrames().length;
    let numTweens = this.getSelectedTweens().length;
    let numCanvasObjects = this.getSelectedCanvasObjects().length;
    let numPaths = this.getSelectedPaths().length;
    let numClips = this.getSelectedClips().length;
    let numButtons = this.getSelectedButtons().length;
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
    return [];
  }

  /**
   * Returns all selected clips.
   * @returns {<Wick.Clip>)[]} An array containing the selected clips.
   */
  getSelectedClips () {
    return this.state.selection.canvas.clips.map(uuid => {
      return this.state.project._childByUUID[uuid];
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

  getSelectedSoundAssets () {
    return this.getSelectedAssetLibraryObjects().filter(asset => {
      return asset instanceof window.Wick.SoundAsset;
    });
  }

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
    };
  }

  /**
   * Returns the name of the selected object.
   * @returns {string} The name of the selected object.
   */
  getSelectionName () {
    if(this.getSelectedClips().length === 1) {
      return this.getSelectedClips()[0].name;
    } else if (this.getSelectedAssetLibraryObjects().length === 1) {
      return this.getSelectedAssetLibraryObjects()[0].name;
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
    this.setState({
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

  /**
   * Determines the selection type of an object, and returns it as a string.
   * @param {object} object - The object to find the type of.
   */
  selectionTypeOfObject (object) {
    if(object instanceof window.Wick.Asset) {
      return 'asset';
    } else {
      return null;
    }
  }

  /**
   * Adds an asset to the selection.
   * @param {<Wick.Asset>} asset - The asset to add to the selection.
   */
  addAssetToSelection (asset) {
    let assets = this.state.selection.assetLibrary.assets;
    this.setState({
      selection: {
        ...this.state.selection,
        assetLibrary: {
          assets: assets.concat([asset.uuid]),
        },
      }
    });
  }

  /**
   * Adds an object to the selection.
   * @param {object} object - The object to add to the selection.
   * @return {boolean} True if object was successfully added to the selection, false otherwise.
   */
  addObjectToSelection (object) {
    let type = this.selectionTypeOfObject(object);
    if(!type) return false;
    if(type === 'asset') {
      this.addAssetToSelection(object);
    }
    return true;
  }

  /**
   * Adds multiple objects to the selection.
   * @param {object[]} objects - The objects to add to the selection.
   */
  addObjectsToSelection (objects) {
    objects.forEach(object => {
      this.addObjectToSelection(object);
    });
  }

  /**
   * Clears the editors selection state.
   */
  clearSelection () {
    this.setState({
      selection: this.blankSelection(),
    });
  }

  /**
   * Clears the selection, then adds the given object to the selection.
   * @param {object} object - The object to add to the selection.
   * @return {boolean} True if object was successfully added to the selection, false otherwise.
   */
  selectObject (object) {
    return this.selectObjects([object]);
  }

  /**
   * Clears the selection, then adds the given objects to the selection.
   * @param {object[]} objects - The objects to add to the selection.
   */
  selectObjects (objects) {
    this.clearSelection();
    this.addObjectsToSelection(objects);
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
   * Determines if a given object is selected.
   * @param {object} object - Selection object to check if it is selected
   * @returns {boolean} - True if the object is selected, false otherwise
   */
  isObjectSelected (object) {
    let type = this.selectionTypeOfObject(object);
    if(type === 'asset') {
      return this.isAssetSelected(object);
    } else {
      return false;
    }
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
        self.setState({
          project: self.state.project,
        });
      });
    });
  }
}

export default EditorCore;
