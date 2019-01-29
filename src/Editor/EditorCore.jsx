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
    let newState = { activeTool: newTool };
    if(this.state.activeTool === 'cursor' && newTool !== 'cursor') {
      newState.selection = this.emptySelection();
    }
    this.setStateWrapper(newState);
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
    this.setStateWrapper({
      toolSettings: {
        ...this.state.toolSettings,
        ...newToolSettings,
      }
    });
  }

  /**
   * Returns all objects currently selected.
   * @return {object} Selection object containing Wick Objects and paths.
   */
  getAllSelectedObjects = () => {
    let selection = this.emptySelection();
    selection.timeline.frames = this.getSelectedFrames();
    selection.timeline.tweens = this.getSelectedTweens();
    selection.canvas.paths = this.getSelectedPaths();
    selection.canvas.clips = this.getSelectedClips();
    selection.assetLibrary.assets = this.getSelectedAssetLibraryObjects();
    return selection;
  }


  /**
   * Returns a serialized version of the selection.
   * @return {object} Serialized representation of the selection.
   */
  serializeSelection = () => {
    let selectedObjects = this.getAllSelectedObjects();
    let newSelection = this.emptySelection();

    newSelection.timeline.frames = selectedObjects.timeline.frames.map(item => item.serialize());
    newSelection.timeline.tweens = selectedObjects.timeline.tweens.map(item => item.serialize());
    newSelection.timeline.layers = selectedObjects.timeline.layers.map(item => item.serialize());
    newSelection.canvas.paths = selectedObjects.canvas.paths.map(item => item.serialize());
    newSelection.canvas.clips = selectedObjects.canvas.clips.map(item => item.serialize());
    newSelection.assetLibrary.assets = selectedObjects.assetLibrary.assets.map(item => item.serialize());

    return newSelection;
  }

  /**
   * Parses a serialized selection.
   * @param {serialized} selection selection object.
   * @return {object} Parsed selection.
   */
  deserializeSelection = (selection) => {
    if (selection === undefined) { console.error("Selection is undefined"); return;}
    /**
     * Deserialize a selection array.
     * @param  {string[]} arr  array to deserialize
     * @return {object[]}     The parsed objects in an array.
     */
    let deserializeArray = function (arr) {
      return arr.map(item => {
        return window.Wick[item.classname].deserialize(item);
      })
    }

    let newSelection = this.emptySelection();
    newSelection.timeline.frames = deserializeArray(selection.timeline.frames);
    newSelection.timeline.tweens = deserializeArray(selection.timeline.tweens);
    newSelection.timeline.layers = deserializeArray(selection.timeline.layers);
    newSelection.canvas.paths = deserializeArray(selection.canvas.paths, true);
    newSelection.canvas.clips = deserializeArray(selection.canvas.clips);
    newSelection.assetLibrary.assets = deserializeArray(selection.assetLibrary.assets);

    return newSelection;
  }

  /**
   * Determines the type of the object/objects that are in the selection state.
   * @returns {string} The string representation of the type of object/objects selected
   */
  getSelectionType = () => {
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
  getSelectedTimelineObjects = () => {
    return this.getSelectedFrames().concat(this.getSelectedTweens());
  }

  /**
   * Returns all selected frames.
   * @returns {<Wick.Frame>)[]} An array containing the selected frames.
   */
  getSelectedFrames = () => {
    return this.state.selection.timeline.frames.map(uuid => {
      return this.project.getChildByUUID(uuid);
    });
  }

  /**
   * Returns all selected tweens.
   * @returns {<Wick.Tween>)[]} An array containing the selected tweens.
   */
  getSelectedTweens = () => {
    return this.state.selection.timeline.tweens.map(uuid => {
      return this.project.getChildByUUID(uuid);
    });
  }

  /**
   * Returns all selected objects on the timeline.
   * @returns {(<Wick.Path>|<Wick.Clip>|<Wick.Button>)[]} An array containing the selected clips and paths
   */
  getSelectedCanvasObjects = () => {
    return this.getSelectedPaths().concat(this.getSelectedClips());
  }

  /**
   * Returns all selected paths.
   * @returns {<Wick.Path>)[]} An array containing the selected paths.
   */
  getSelectedPaths = () => {
    return this.state.selection.canvas.paths.map(uuid => {
      return this.project.getChildByUUID(uuid);
    });
  }

  /**
   * Returns all selected clips.
   * @returns {<Wick.Clip>)[]} An array containing the selected clips.
   */
  getSelectedClips = () => {
    return this.state.selection.canvas.clips.map(uuid => {
      return this.project.getChildByUUID(uuid);
    });
  }

  /**
   * Returns all selected buttons.
   * @returns {<Wick.Button>)[]} An array containing the selected buttons.
   */
  getSelectedButtons = () => {
    return this.getSelectedClips().filter(clip => {
      return clip instanceof window.Wick.Button;
    });
  }

  /**
   * Returns all selected objects in the asset library.
   * @returns {(<Wick.ImageAsset>|<Wick.SoundAsset>)[]} An array containing the selected assets
   */
  getSelectedAssetLibraryObjects = () => {
    return this.state.selection.assetLibrary.assets.map(uuid => {
      return this.project.getChildByUUID(uuid);
    });
  }

  /**
   * Returns all selected sound assets from the asset library.
   * @returns {(<Wick.SoundAsset>)[]} An array containing the selected sound assets.
   */
  getSelectedSoundAssets = () => {
    return this.getSelectedAssetLibraryObjects().filter(asset => {
      return asset instanceof window.Wick.SoundAsset;
    });
  }

  /**
   * Returns all selected image assets from the asset library.
   * @returns {(<Wick.ImageAsset>)[]} An array containing the selected image assets.
   */
  getSelectedImageAssets = () => {
    return this.getSelectedAssetLibraryObjects().filter(asset => {
      return asset instanceof window.Wick.ImageAsset;
    });
  }

  /**
   * Returns an object containing all attributes of the selection.
   * @returns {object} The object containing all the selection attributes.
   */
  getSelectionAttributes = () => {
    return {
      name: this.getSelectionName(),
      filename: this.getSelectionFilename(),
      src: this.getSelectionSrc(),
      x: this.getSelectionPositionX(),
      y: this.getSelectionPositionY(),
      width: this.getSelectionWidth(),
      height: this.getSelectionHeight(),
      scaleX: this.getSelectionScaleX(),
      scaleY: this.getSelectionScaleY(),
      rotation: this.getSelectionRotation(),
      opacity: this.getSelectionOpacity(),
      strokeWidth: this.getSelectionStrokeWidth(),
      fillColor: this.getSelectionFillColor(),
      strokeColor: this.getSelectionStrokeColor(),
    };
  }

  /**
   * Returns the name of the selected object.
   * @returns {string|null} The name of the selected object. Returns null if selection type does not have a name.
   */
  getSelectionName = () => {
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
  getSelectionFilename = () => {
    let selectionType = this.getSelectionType();

    if (selectionType === 'imageasset' || selectionType === 'soundasset') {
      return this.getSelectedAssetLibraryObjects()[0].filename;
    } else {
      return null;
    }
  }

  /**
   * Return the x position of the current canvas selection.
   * @return {number|null} The x position of the current canvas selection. Returns null if no canvas object is selected.
   */
  getSelectionPositionX = () => {
    if(this.getSelectedCanvasObjects().length > 0) {
      return window.paper.project.selection.position.x;
    } else {
      return null;
    }
  }

  /**
   * Return the y position of the current canvas selection.
   * @return {number|null} The y position of the current canvas selection. Returns null if no canvas object is selected.
   */
  getSelectionPositionY = () => {
    if(this.getSelectedCanvasObjects().length > 0) {
      return window.paper.project.selection.position.y;
    } else {
      return null;
    }
  }

  /**
   * Return the width of the current canvas selection.
   * @return {number|null} The width of the current canvas selection. Returns null if no canvas object is selected.
   */
  getSelectionWidth = () => {
    if(this.getSelectedCanvasObjects().length > 0) {
      return window.paper.project.selection.bounds.width;
    } else {
      return null;
    }
  }

  /**
   * Return the height of the current canvas selection.
   * @return {number|null} The height of the current canvas selection. Returns null if no canvas object is selected.
   */
  getSelectionHeight = () => {
    if(this.getSelectedCanvasObjects().length > 0) {
      return window.paper.project.selection.bounds.height;
    } else {
      return null;
    }
  }

  /**
   * Return the scale width of the current selection.
   * @return {number|null} The scale width of the current canvas selection. Returns null if no canvas object is selected.
   */
  getSelectionScaleX = () => {
    if(this.getSelectedCanvasObjects().length > 0) {
      return window.paper.project.selection.scaling.x;
    } else {
      return null;
    }
  }

  /**
   * Return the scale height of the current selection.
   * @return {number|null} The scale height of the current canvas selection. Returns null if no canvas object is selected.
   */
  getSelectionScaleY = () => {
    if(this.getSelectedCanvasObjects().length > 0) {
      return window.paper.project.selection.scaling.y;
    } else {
      return null;
    }
  }

  /**
   * Return the rotation of the current selection.
   * @return {number|null} The rotation of the current canvas selection. Returns null if no canvas object is selected.
   */
  getSelectionRotation = () => {
    if(this.getSelectedCanvasObjects().length > 0) {
      return window.paper.project.selection.rotation;
    } else {
      return null;
    }
  }

  /**
   * Return the opacity of the current selection.
   * @return {number|null} The opacity of the current canvas selection. Returns null if no canvas object is selected.
   */
  getSelectionOpacity = () => {
    if(this.getSelectedCanvasObjects().length > 0) {
      return window.paper.project.selection.opacity;
    } else {
      return null;
    }
  }

  /**
   * Return the stroke width of the current selection.
   * @return {number|null} The stroke width of the current canvas selection. Returns null if no canvas object is selected.
   */
  getSelectionStrokeWidth = () => {
    if(this.getSelectedCanvasObjects().length > 0) {
      return window.paper.project.selection.strokeWidth;
    } else {
      return null;
    }
  }

  /**
   * Return the stroke color of the current selection.
   * @return {string|null} The stroke color of the current canvas selection. Returns null if no canvas object is selected.
   */
  getSelectionStrokeColor = () => {
    if(this.getSelectedCanvasObjects().length > 0) {
      let strokeColor = window.paper.project.selection.strokeColor;
      if (strokeColor === null || strokeColor === undefined) {
        return null;
      } else {
        return strokeColor.toCSS();
      }
    } else {
      return null;
    }
  }

  /**
   * Return the fill color of the current selection.
   * @return {string|null} The fill color of the current canvas selection. Returns null if no canvas object is selected.
   */
  getSelectionFillColor = () => {
    if(this.getSelectedCanvasObjects().length > 0) {
      let fillColor = window.paper.project.selection.fillColor;
      if (fillColor === null || fillColor === undefined) {
        return null;
      } else {
        return fillColor.toCSS();
      }
    } else {
      return null;
    }
  }

  /**
   * Returns the source of the selected object.
   * @returns {string|null} The src dataURL of the selected object. Returns null if selection type does not have a src property.
   */
  getSelectionSrc = () => {
    let selectionType = this.getSelectionType();

    if (selectionType === 'imageasset' || selectionType === 'soundasset') {
      return this.getSelectedAssetLibraryObjects()[0].src;
    } else {
      return null;
    }
  }

  /**
   * Returns all actions to be displayed using the current selection. Utilizes the ActionMapInterface.
   * @return {EditorAction[][]} An array of arrays of editor actions as defined by the editor action map.
   */
  getSelectionActions = () => {
    let actionGroups = this.actionMapInterface.actionGroups;
    let actions = [];

    Object.keys(actionGroups).forEach(key => {
      let actionGroup = actionGroups[key];
      if (!actionGroup.on()) return;

      let subActions = actionGroup.actions;

      if ('color' in actionGroup) {
        subActions.forEach(subAction => {
          if (subAction === undefined) { console.error("Subaction '" + key + "' is undefined.")}
          subAction.color = actionGroup.color;
        });
      }

      actions.push(subActions);
    })
    return actions;
  }

  /**
   * Returns the number of objects selected on the canvas.
   * @return {number} Number of canvas objects selected.
   */
  getNumCanvasObjectsSelected = () => {
    return this.state.selection.canvas.paths.length + this.state.selection.canvas.clips.length;
  }

  /**
   * Updates the state of the selection with new values.
   * @param {object} newSelectionAttributes - A object containing the new values of the selection to use to update the state.
   */
  setSelectionAttributes = (newSelectionAttributes) => {
    // Valid selection setting functions
    let setSelectionFunctions = {
      name: this.setSelectionName,
      x: this.setSelectionPositionX,
      y: this.setSelectionPositionY,
      width: this.setSelectionWidth,
      height: this.setSelectionHeight,
      scaleX: this.setSelectionScaleX,
      scaleY: this.setSelectionScaleY,
      rotation: this.setSelectionRotation,
      opacity: this.setSelectionOpacity,
      strokeWidth: this.setSelectionStrokeWidth,
      strokeColor: this.setSelectionStrokeColor,
      fillColor: this.setSelectionFillColor,
    }

    // Only apply setting changes for valid functions.
    Object.keys(newSelectionAttributes).forEach(key => {
      if (key in setSelectionFunctions) {
        setSelectionFunctions[key](newSelectionAttributes[key]);
      }
    });
  }

  /**
   * Updates the name of the selected object. Does nothing if multiple objects are selected.
   * @param {string} newName - The name to use.
   */
  setSelectionName = (newName) => {
    // Only change name of selected objects if one is in selection.
    if(this.getSelectedClips().length === 1) {
      this.getSelectedClips()[0].name = newName;
      this.updateProjectInState();
    } else if (this.getSelectedAssetLibraryObjects().length === 1) {
      this.getSelectedAssetLibraryObjects()[0].name = newName;
      this.updateProjectInState();
    } else if (this.getSelectedFrames().length === 1) {
      this.getSelectedFrames()[0].name = newName;
      this.updateProjectInState();;
    }
  }

  /**
   * Sets the x position of the current canvas selection.
   * @param {number} x The new value for the x position for the current canvas selection.
   */
  setSelectionPositionX = (x) => {
    if(this.getSelectedCanvasObjects().length > 0) {
      let y = window.paper.project.selection.bounds.y;
      window.paper.project.selection.setPosition(x, y);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Sets the y position of the current canvas selection.
   * @param {number} y The new value for the y position for the current canvas selection.
   */
  setSelectionPositionY = (y) => {
    if(this.getSelectedCanvasObjects().length > 0) {
      let x = window.paper.project.selection.bounds.x;
      window.paper.project.selection.setPosition(x, y);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Sets the width of the current canvas selection.
   * @param {number} width The new value for the width for the current canvas selection.
   */
  setSelectionWidth = (width) => {
    if(this.getSelectedCanvasObjects().length > 0) {
      let height = window.paper.project.selection.bounds.height;
      window.paper.project.selection.setSize(width, height);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Sets the height of the current canvas selection.
   * @param {number} height The new value for the height for the current canvas selection.
   */
  setSelectionHeight = (height) => {
    if(this.getSelectedCanvasObjects().length > 0) {
      let width = window.paper.project.selection.bounds.width;
      window.paper.project.selection.setSize(width, height);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Sets the horizontal scale of the current canvas selection.
   * @param {number} scaleX The new value for the horizontal scale for the current canvas selection.
   */
  setSelectionScaleX = (scaleX) => {
    if(this.getSelectedCanvasObjects().length > 0) {
      let scaleY = window.paper.project.selection.scaling.y;
      window.paper.project.selection.setScale(scaleX, scaleY);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Sets the vertical scale of the current canvas selection.
   * @param {number} scaleY The new value for the vertical scale for the current canvas selection.
   */
  setSelectionScaleY = (scaleY) => {
    if(this.getSelectedCanvasObjects().length > 0) {
      let scaleX = window.paper.project.selection.scaling.x;
      window.paper.project.selection.setScale(scaleX, scaleY);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Sets the rotation of the current canvas selection.
   * @param {number} rotation The new value for the rotation of the current canvas selection.
   */
  setSelectionRotation = (rotation) => {
    if(this.getSelectedCanvasObjects().length > 0) {
      window.paper.project.selection.setRotation(rotation);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Sets the opacity of the current canvas selection.
   * @param {number} opacity The new value for the opacity of the current canvas selection.
   */
  setSelectionOpacity = (opacity) => {
    if(this.getSelectedCanvasObjects().length > 0) {
      window.paper.project.selection.setOpacity(opacity);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Sets the stroke width of the current canvas selection.
   * @param {number} strokeWidth The new value for the stroke width of the current canvas selection.
   */
  setSelectionStrokeWidth = (strokeWidth) => {
    if(this.getSelectedCanvasObjects().length > 0) {
      window.paper.project.selection.setStrokeWidth(strokeWidth);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Sets the stroke color of the current canvas selection.
   * @param {string} strokeColor The new value for the stroke color of the current canvas selection.
   */
  setSelectionStrokeColor = (strokeColor) => {
    if(this.getSelectedCanvasObjects().length > 0) {
      window.paper.project.selection.setStrokeColor(strokeColor);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Sets the fill color of the current canvas selection.
   * @param {string} fillColor The new value for the fill color of the current canvas selection.
   */
  setSelectionFillColor = (fillColor) => {
    if(this.getSelectedCanvasObjects().length > 0) {
      window.paper.project.selection.setFillColor(fillColor);
      this.applyCanvasChangesToProject();
    }
  }

  /**
   * Determines the selection type of an object, and returns it as a string.
   * @param {object} object - The object to find the type of.
   */
  selectionTypeOfObject = (object) => {
    if(object instanceof window.Wick.Asset) {
      return 'asset';
    } else if (object instanceof window.Wick.Clip) {
      return 'clip';
    } else if (object instanceof window.Wick.Path) {
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
  addAssetToSelection = (asset, selection) => {
    selection.assetLibrary.assets.push(asset.uuid);
    return selection;
  }

  /**
   * Adds a clip to the selection.
   * @param {<Wick.Clip>} clip - The clip to add to the selection.
   * @param {object} selection - The selection to add the clip to.
   * @returns {object} The updated selection.
   */
  addClipToSelection = (clip, selection) => {
    selection.canvas.clips.push(clip.uuid);
    return selection;
  }

  /**
   * Adds a path to the selection.
   * @param {<Wick.Path>} path - The path to add to the selection.
   * @param {object} selection - The selection to add the path to.
   * @returns {object} The updated selection.
   */
  addPathToSelection = (path, selection) => {
    selection.canvas.paths.push(path.uuid);
    return selection;
  }

  /**
   * Adds a frame to the selection.
   * @param {Wick.Frame} frame - The frame to add to the selection.
   * @param {object} selection - The selection to add the frame to.
   * @returns {object} The updated selection.
   */
  addFrameToSelection = (frame, selection) => {
    selection.timeline.frames.push(frame.uuid);
    return selection;
  }

  /**
   * Adds a tween to the selection.
   * @param {Wick.Tween} tween - The tween to add to the selection.
   * @param {object} selection - The selection to add the tween to.
   * @returns {object} The updated selection.
   */
  addTweenToSelection = (tween, selection) => {
    selection.timeline.tweens.push(tween.uuid);
    return selection;
  }

  /**
   * Adds an object to the selection.
   * @param {object} object - The object to add to the selection.
   * @param {object} selection - The selection to add the object to.
   * @return {object} The updated selection.
   */
  addObjectToSelection = (object, selection) => {
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
  addObjectsToSelection = (objects, selection) => {
    objects.forEach(object => {
      selection = this.addObjectToSelection(object, selection);
    });
    return selection;
  }

  /**
   * Clears the selection, then adds the given object to the selection.
   * @param {object} object - The object to add to the selection.
   */
  selectObject = (object, callback) => {
    return this.selectObjects([object]);
  }

  /**
   * Clears the selection, then adds the given objects to the selection. No changes will be made if the selection does not change.
   * @param {object[]} objects - The objects to add to the selection.
   */
  selectObjects = (objects) => {
    let newSelection = this.addObjectsToSelection(objects, this.emptySelection());
    this.setStateWrapper({selection: newSelection});
    return newSelection;
  }

  /**
   * Clears the selection.
   */
  clearSelection = () => {
    let newSelection = this.emptySelection();
    this.setStateWrapper({selection: this.emptySelection()});
    return newSelection;
  }

  /**
   * Use this to clear the selection.
   * @returns A state object representing a selection where nothing is selected.
   */
  emptySelection = () => {
    return {
      timeline: {
        frames: [],
        tweens: [],
        layers: [],
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
  isAssetSelected = (asset) => {
    return this.state.selection.assetLibrary.assets.indexOf(asset.uuid) > -1;
  }

  /**
   * Determines if a given path is selected.
   * @param {<Wick.Path>} path - Path to check selection status
   * @returns {boolean} - True if the path is selected, false otherwise
   */
  isPathSelected = (path) => {
    return this.state.selection.canvas.paths.indexOf(path.uuid) > -1;
  }

  /**
   * Determines if a given clip is selected.
   * @param {<Wick.Clip>} path - Clip to check selection status
   * @returns {boolean} - True if the clip is selected, false otherwise
   */
  isClipSelected = (clip) => {
    return this.state.selection.canvas.clips.indexOf(clip.uuid) > -1;
  }

  /**
   * Determines if a given tween is selected.
   * @param {<Wick.Tween>} tween - Tween to check selection status
   * @returns {boolean} - True if the tween is selected, false otherwise
   */
  isTweenSelected = (tween) => {
    return this.state.selection.timeline.tweens.indexOf(tween.uuid) > -1;
  }

  /**
   * Determines if a given frame is selected.
   * @param {<Wick.Frame>} path - Frame to check selection status
   * @returns {boolean} - True if the frame is selected, false otherwise
   */
  isFrameSelected = (frame) => {
    return this.state.selection.timeline.frames.indexOf(frame.uuid) > -1;
  }

  /**
   * Determines if a given object is selected.
   * @param {object} object - Selection object to check if it is selected
   * @returns {boolean} - True if the object is selected, false otherwise
   */
  isObjectSelected = (object) => {
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
  createSymbolFromSelection = (name, type) => {
    this.lockState = true;

    // Create blank clip
    let newClip = new window.Wick[type]();
    newClip.name = name;
    newClip.timeline.addLayer(new window.Wick.Layer());
    newClip.timeline.activeLayer.addFrame(new window.Wick.Frame());

    // Calculate position of new clip
    newClip.transform.x = this.paper.project.selection.bounds.center.x;
    newClip.transform.y = this.paper.project.selection.bounds.center.y;

    // Reposition selected clips and paths
    this.getSelectedClips().forEach(clip => {
      clip.transform.x -= newClip.transform.x;
      clip.transform.y -= newClip.transform.y;
    });
    this.getSelectedPaths().forEach(path => {
      path.paperPath.position.x -= newClip.transform.x;
      path.paperPath.position.y -= newClip.transform.y;
    });

    // Add selected clips and paths to new clip
    this.getSelectedClips().forEach(clip => {
      newClip.activeFrame.addClip(clip.clone(true));
    });
    this.getSelectedPaths().forEach(path => {
      newClip.activeFrame.addPath(path.clone(true));
    });

    // Delete selected objects
    this.deleteSelectedObjects();

    // Add new clip
    this.project.activeFrame.addClip(newClip);

    // Select new clip
    let newSelection = this.selectObject(newClip);

    this.lockState = false;

    this.updateProjectAndSelectionInState(newSelection);
  }

  /**
   * Break apart the selected clip(s) and select the objects that were contained within those clip(s).
   */
  breakApartSelection = () => {
    this.lockState = true;

    let results = [];
    this.getSelectedClips().forEach(clip => {
      results = results.concat(this.breakApartClip(clip));
    });
    let newSelection = this.selectObjects(results);

    this.lockState = false;

    this.updateProjectAndSelectionInState(newSelection);
  }

  /**
   * Break apart a clip.
   * @param {Wick.Clip} clip - Clip to break apart
   * @returns {object[]} - The objects that were contained within the clip.
   */
  breakApartClip = (clip) => {
    let itemsInsideClip = [];

    clip.timeline.activeLayer.activeFrames.forEach(frame => {
      // Add paths from inside clip
      frame.paths.forEach(path => {
        path.remove();
        this.project.activeFrame.addPath(path.clone());
        itemsInsideClip.push(path);
      });
      // Add clips from inside clip
      frame.clips.forEach(subclip => {
        subclip.remove();
        this.project.activeFrame.addClip(subclip.clone());
        itemsInsideClip.push(subclip);
      });
    });

    // Delete original clip
    clip.remove();

    return itemsInsideClip;
  }

  /**
   * Deletes all selected objects on the canvas.
   */
  deleteSelectedCanvasObjects = () => {
    this.getSelectedPaths().forEach(path => {
      path.remove();
    });
    this.getSelectedClips().forEach(clip => {
      clip.remove();
    });
  }

  /**
   * Deletes all selected objects on the timeline.
   */
  deleteSelectedTimelineObjects = () => {
    this.getSelectedFrames().forEach(frame => {
      frame.remove();
    });
    this.getSelectedTweens().forEach(tween => {
      tween.remove();
    });
  }

  /**
   * Deletes all selected assets.
   * @returns {<Wick.Asset>[]} The assets that were deleted.
   */
  deleteSelectedAssetLibraryObjects = () => {
    this.getSelectedAssetLibraryObjects().forEach(asset => {
      asset.project.removeAsset(asset);
    });
  }

  /**
   * Deletes all selected objects.
   * @returns {object[]} The objects that were deleted.
   */
  deleteSelectedObjects = () => {
    let result = [];
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

  /**
   * Moves the selected objects on the canvas to the back.
   */
  sendSelectionToBack = () => {
    this.paper.project.selection.sendToBack();
    this.applyCanvasChangesToProject();
  }

  /**
   * Moves the selected objects on the canvas to the front.
   */
  sendSelectionToFront = () => {
    this.paper.project.selection.bringToFront();
    this.applyCanvasChangesToProject();
  }

  /**
   * Moves the selected objects on the canvas backwards.
   */
  moveSelectionBackwards = () => {
    this.paper.project.selection.sendBackwards();
    this.applyCanvasChangesToProject();
  }

  /**
   * Moves the selected objects on the canvas forwards.
   */
  moveSelectionForwards = () => {
    this.paper.project.selection.bringForwards();
    this.applyCanvasChangesToProject();
  }

  /**
   * Creates an image from an asset's uuid and places it on the canvas.
   * @param {string} uuid The UUID of the desired asset.
   * @param {number} x    The x location of the image after creation in relation to the window.
   * @param {number} y    The y location of the image after creation in relation to the window.
   */
  createImageFromAsset = (uuid, x, y) => {
    let asset = this.project.getChildByUUID(uuid);
    let path = new window.Wick.Path(["Raster",{"applyMatrix":false,"crossOrigin":"","source":"asset","asset":uuid}], [asset]);
    this.project.activeFrame.addPath(path);

    this.updateProjectInState();
  }

  /**
   * Updates the React state with a new project.
   * @param  {Wick.Project} newProject The Wick Project to update the React state with.
   */
  updateProjectInState = () => {
    this.setStateWrapper( {
      project: this.project.serialize(),
    } );

  }

  /**
   * Updates the React state with the new project and a new selection.
   * @param  {object} selection Object representing new selection. If no selection is provided, selection is set to empty.
   */
  updateProjectAndSelectionInState = (newSelection) => {
    if (newSelection === undefined) {
      newSelection = this.emptySelection();
    }

    this.setStateWrapper( {
      project: this.project.serialize(),
      selection: newSelection,
    })
  }

  /**
   * Updates the Wick Project settings with new values passed in as an object. Will make no changes if input is invalid or the same as the previous settings.
   * @param {object} newSettings an object containing all of the settings to update within the project. Accepts valid project settings such as 'name', 'width', 'height', 'framerate', and 'backgroundColor'.
   */
  updateProjectSettings = (newSettings) => {
    let updatedProject = this.project.clone();
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
      this.updateProjectInState();
    }
  }

  /**
   * Sets the project focus to the timeline of the currently selected clip.
   */
  focusTimelineOfSelectedObject = () => {
    this.focusClip(this.getSelectedClips()[0]);

    this.updateProjectAndSelectionInState();
  }

  /**
   * Sets the project focus to the parent timeline of the currently selected clip.
   */
  focusTimelineOfParentObject = () => {
    if(this.project.focus === this.project.root) return;
    this.focusClip(this.project.focus.parent._getParentByInstanceOf(window.Wick.Clip));

    this.updateProjectAndSelectionInState();
  }

  /**
   * Sets the focus to a specific Clip.
   * @param {Wick.Clip} clip - the clip to focus.
   */
  focusClip = (clip) => {
    if(clip === this.project.root) {
      let cx = this.project.width / 2;
      let cy = this.project.height / 2;
      window.paper.view.center = new window.paper.Point(cx,cy);
    } else {
      window.paper.view.center = new window.paper.Point(0,0);
    }
    this.project.focus = clip;
  }

  /**
   * Horizontally flips the canvas selection.
   */
  flipSelectedHorizontal = () => {
    this.paper.project.selection.flipHorizontally();
    this.applyCanvasChangesToProject();
  }

  /**
   * Vertically flips the canvas selection.
   */
  flipSelectedVertical = () => {
    this.paper.project.selection.flipVertically();
    this.applyCanvasChangesToProject();
  }

  /**
   * Creates and imports Wick Assets from the acceptedFiles list, and displays an alert message for rejected files.
   * @param {File[]} acceptedFiles - Files uploaded by user with supported MIME types to import into the project
   * @param {File[]} rejectedFiles - Files uploaded by user with unsupported MIME types.
   */
  createAssets = (acceptedFiles, rejectedFiles) => {
    let self = this;
    if (rejectedFiles.length > 0) {
      alert("The Wick Editor could not accept these files." + JSON.stringify(rejectedFiles.map(f => f.name)));
    }

    if (acceptedFiles.length <= 0) return;

    acceptedFiles.forEach(file => {
      this.project.importFile(file, function (asset) {
        // After import success, update editor state.
        self.updateProject();
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
   * Returns an object containing the onion skin options.
   * @returns the object containing the onion skin options.
   */
  getOnionSkinOptions = () => {
    return {
      onionSkinEnabled: this.state.onionSkinEnabled,
      onionSkinSeekForwards: this.state.onionSkinSeekForwards,
      onionSkinSeekBackwards: this.state.onionSkinSeekBackwards
    };
  }

  /**
   * Copies the selection state and selected objects to the clipboard.
   */
  copySelectionToClipboard = () => {
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
    localForage.getItem('wickClipboard').then((serializedSelection) => {
      let deserialized = this.deserializeSelection(serializedSelection);
      this.addSelectionToProject(deserialized);
    }).catch((err) => {
      console.error("Error when pasting from clipboard.")
      console.error(err);
    });
  }

  /**
   * Adds a deserialized selection to the project.
   * @param {object} selection deserialized selection object to add to project.
   */
  addSelectionToProject = (selection) => {
    if (selection.canvas) {
      if (selection.canvas.paths) {
        selection.canvas.paths.forEach(path => {
          this.project.activeFrame.addPath(path);
        });
      }

      if (selection.canvas.clips) {
        selection.canvas.clips.forEach(clip => {
          let clone = clip.clone(false);
          this.project.activeFrame.addClip(clone);
        });
      }
    }

    if (selection.assetLibrary) {
      if (selection.assetLibrary.assets) {
        selection.assetLibrary.assets.forEach(asset => {
          let clone = asset.clone();
          this.project.addAsset(clone); //TODO: Check for asset collisions.
        });
      }
    }

    //TODO: Complete timeline pasting selection.
    if (selection.timeline) {
      if (selection.timeline.frames) {
        if (selection.timeline.frames.length > 0) {alert("NYI: Wick Editor Alpha cannot paste frames!")}
        if (selection.timeline.layers.length > 0) {alert("NYI: Wick Editor Alpha cannot layers frames!")}
      }
    }

    this.updateProjectInState();
  }

  /**
   * Duplicates the currently selected object.
   */
  duplicateSelection = () => {
    let disallowed = ['frame', 'layer'];
    if (disallowed.indexOf(this.getSelectionType()) > -1) {
      alert("Wick Editor can't duplicate '" + this.getSelectionType() + "' objects yet!");
      return;
    }

    let serialized = this.serializeSelection();
    let deserialized = this.deserializeSelection(serialized);
    this.addSelectionToProject(deserialized);
  }

  /**
   * Updates the onion skin settings in the state.
   * @param onionSkinOptions an object containing the new settings to use.
   */
  setOnionSkinOptions = (onionSkinOptions) => {
    let validOnionSkinOptions = ['onionSkinEnabled', 'onionSkinSeekForwards', 'onionSkinSeekBackwards'];
    let newOnionSkinOptions = {};
    Object.keys(onionSkinOptions).forEach(optionName => {
      if(validOnionSkinOptions.indexOf(optionName) === -1) return;
      if(onionSkinOptions[optionName] === undefined) return;
      newOnionSkinOptions[optionName] = onionSkinOptions[optionName];
    });
    this.setStateWrapper(newOnionSkinOptions);
  }

  /**
   * Export the current project as a Wick File using the save as dialog.
   */
  exportProjectAsWickFile = () => {
    /**
     * Attempts to safely open a saveAs dialog to save a file.
     * @param  {File} file the file to save. if undefined, an alert is thrown.
     */
    let safeExport = (file) => {
      if (file === undefined) {
        alert("Cannot download project. Project is undefined.");
        return;
      }
      saveAs(file, this.project.name + '.wick');
    }
    this.project.exportAsWickFile(safeExport);
  }

  /**
   * Imports a wick file into the editor.
   * @param {File} file Zipped wick file to import.
   */
  importProjectAsWickFile = (file) => {
    window.Wick.Project.fromWickFile(file, this.setupNewProject);
  }

  /**
   * Sets up a new project in the editor. This operation will remove the history, and all other ability to retrieve your project.
   * @param  {Wick.Project} project project to load.
   */
  setupNewProject = (project) => {
    this.resetEditorForLoad();
    this.project = project;

    this.updateProjectAndSelectionInState();
  }
}

export default EditorCore;
