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

import './_editor.scss';

import 'bootstrap/dist/css/bootstrap.min.css';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from "react-dnd";
import 'react-reflex/styles.css'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import { throttle } from 'underscore';
import { HotKeys } from 'react-hotkeys';
import Dropzone from 'react-dropzone';

import DockedPanel from './Panels/DockedPanel/DockedPanel';
import Canvas from './Panels/Canvas/Canvas';
import Inspector from './Panels/Inspector/Inspector';
import MenuBar from './Panels/MenuBar/MenuBar';
import Timeline from './Panels/Timeline/Timeline';
import Toolbox from './Panels/Toolbox/Toolbox';
import AssetLibrary from './Panels/AssetLibrary/AssetLibrary';
import CodeEditor from './Panels/CodeEditor/CodeEditor';
import ModalHandler from './Modals/ModalHandler/ModalHandler';
import HotKeyInterface from './hotKeyMap';

function blankSelection () {
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

class Editor extends Component {
  constructor () {
    super();

    this.state = {
      project: null,
      paper: null,
      canvas: null,
      onionSkinEnabled: false,
      onionSkinSeekForwards: 1,
      onionSkinSeekBackwards: 1,
      selection: blankSelection(),
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
      inspectorSize: 250,
      codeEditorSize: 0.1,
      timelineSize: 100,
      assetLibrarySize: 150,
    };
    this.updateEditorState = this.updateEditorState.bind(this);

    // Selection methods
    this.selectObjects = this.selectObjects.bind(this);
    this.isObjectSelected = this.isObjectSelected.bind(this);
    this.getSelectionType = this.getSelectionType.bind(this);
    this.getActiveTool = this.getActiveTool.bind(this);
    this.getToolSettings = this.getToolSettings.bind(this);
    this.setToolSettings = this.setToolSettings.bind(this);
    this.getSelectionAttributes = this.getSelectionAttributes.bind(this);
    this.setSelectionAttributes = this.setSelectionAttributes.bind(this);

    // Init hotkeys
    this.hotKeyInterface = new HotKeyInterface(this);

    // Tools
    this.activateTool = this.activateTool.bind(this);
    this.createAssets = this.createAssets.bind(this);

    // Modals
    this.openModal = this.openModal.bind(this);
    this.closeActiveModal = this.closeActiveModal.bind(this);

    // Resiable panels
    this.RESIZE_THROTTLE_AMOUNT_MS = 10;
    this.WINDOW_RESIZE_THROTTLE_AMOUNT_MS = 300;
    this.resizeProps = {
      onStopResize: throttle(this.onStopResize.bind(this), this.resizeThrottleAmount),
      onStopInspectorResize: throttle(this.onStopInspectorResize.bind(this), this.resizeThrottleAmount),
      onStopAssetLibraryResize: throttle(this.onStopAssetLibraryResize.bind(this), this.resizeThrottleAmount),
      onStopTimelineResize: throttle(this.onStopTimelineResize.bind(this), this.resizeThrottleAmount),
      onStopCodeEditorResize: throttle(this.onStopCodeEditorResize.bind(this), this.resizeThrottleAmount),
      onResize: throttle(this.onResize.bind(this), this.resizeThrottleAmount),
      onWindowResize: throttle(this.onWindowResize.bind(this), this.windowResizeThrottleAmount),
    };
    window.addEventListener("resize", this.resizeProps.onWindowResize);

    this.refocusEditor = this.refocusEditor.bind(this);
  }

  componentWillMount () {
    this.setState({
      project: new window.Wick.Project(),
      paper: window.paper,
      canvas: new window.Wick.Canvas(),
    });
  }

  componentDidMount () {
    this.refocusEditor();
  }

  componentDidUpdate (prevProps, prevState) {

  }

  onWindowResize () {
    // Ensure that all elements resize on window resize.
    this.resizeProps.onResize();
  }

  onResize (e) {
    window.Wick.Canvas.resize();
    window.AnimationTimeline.resize();
  }

  onStopResize = ({domElement, component}) => {

  }

  getSizeHorizontal (domElement) {
    return domElement.offsetWidth;
  }

  getSizeVertical (domElement) {
    return domElement.offsetHeight;
  }

  onStopInspectorResize = ({domElement, component}) => {
    this.setState({
      inspectorSize: this.getSizeHorizontal(domElement)
    });
  }

  onStopAssetLibraryResize = ({domElement, component}) => {
    this.setState({
      assetLibrarySize: this.getSizeVertical(domElement)
    });
  }

  onStopCodeEditorResize = ({domElement, component}) => {
    this.setState({
      codeEditorSize: this.getSizeHorizontal(domElement)
    });
  }

  onStopTimelineResize = ({domElement, component}) => {
    var size = this.getSizeHorizontal(domElement);

    this.setState({
      timelineSize: size
    });
  }

  updateEditorState (state) {
    this.setState(state);
  }

  activateTool (tool) {
    this.updateEditorState({
      activeTool: tool
    });
  }

  closeActiveModal () {
    this.openModal(null);
  }

  openModal (name) {
    if (this.state.activeModalName !== name) {
      this.setState({
        activeModalName: name,
      });
    }
    this.refocusEditor();
  }

  refocusEditor () {
    window.document.getElementById('hotkeys-container').focus();
  }

  /**
   * Returns the name of the active tool.
   * @returns {string} The string representation active tool name.
   */
  getActiveTool () {
    return this.state.activeTool;
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
      selection: blankSelection(),
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

  createAssets (accepted, rejected) {
    let self = this;
    if (rejected.length > 0) {
      alert("The Wick Editor could not accept these files." + JSON.stringify(rejected.map(f => f.name)));
    }

    if (accepted.length <= 0) return;

    accepted.forEach(file => {
      this.state.project.import(file, function (asset) {
        // After import success, update editor state.
        self.updateEditorState({
          project: self.state.project,
        });
      });

    });

  }

  render () {
      return (
    <Dropzone
      accept={window.Wick.Asset.getMIMETypes()}
      onDrop={(accepted, rejected) => this.createAssets(accepted, rejected)}
      disableClick
    >
      {({getRootProps, getInputProps, open}) => (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
            <HotKeys
              keyMap={this.hotKeyInterface.getKeyMap()}
              handlers={this.hotKeyInterface.getHandlers()}
              style={{width:"100%", height:"100%"}}
              id='hotkeys-container'>
              <div id="editor">
                <div id="menu-bar-container">
                  <ModalHandler
                    activeModalName={this.state.activeModalName}
                    openModal={this.openModal}
                    closeActiveModal={this.closeActiveModal}
                    project={this.state.project}
                    updateEditorState={this.updateEditorState}
                  />
                  {/* Header */}
                  <DockedPanel>
                    <MenuBar openModal={this.openModal} projectName={this.state.project.name}/>
                  </DockedPanel>
                </div>
                <div id="editor-body">
                  <div id="flexible-container">
                    <ReflexContainer windowResizeAware={true} orientation="vertical">
                      {/* Middle Panel */}
                      <ReflexElement {...this.resizeProps}>
                        <ReflexContainer windowResizeAware={true} orientation="horizontal">
                          <ReflexElement
                            minSize={50}
                            maxSize={50}
                            size={50}
                            onResize={this.resizeProps.onResize}
                            onStopResize={this.resizeProps.onStopResize}>
                            <DockedPanel>
                              <Toolbox
                                updateEditorState={this.updateEditorState}
                                activeTool={this.state.activeTool}
                                activateTool={this.activateTool}
                                toolSettings={this.state.toolSettings}
                                previewPlaying={this.state.previewPlaying}
                                togglePreviewPlaying={this.togglePreviewPlaying}
                              />
                            </DockedPanel>
                          </ReflexElement>
                          <ReflexElement {...this.resizeProps}>
                            <ReflexContainer orientation="vertical">
                              <ReflexElement
                                minSize={0}
                                size={this.state.codeEditorSize}
                                onResize={this.resizeProps.onResize}
                                onStopResize={this.resizeProps.onStopCodeEditorResize}>
                                <DockedPanel>
                                  <CodeEditor
                                    project={this.state.project}
                                    updateEditorState={this.updateEditorState}
                                  />
                                </DockedPanel>
                              </ReflexElement>
                              <ReflexSplitter {...this.resizeProps}/>
                              <ReflexElement>
                                <DockedPanel>
                                  <Canvas
                                    project={this.state.project}
                                    updateEditorState={this.updateEditorState}
                                    toolSettings={this.state.toolSettings}
                                    activeTool={this.state.activeTool}
                                    onionSkinEnabled={this.state.onionSkinEnabled}
                                    onionSkinSeekBackwards={this.state.onionSkinSeekBackwards}
                                    onionSkinSeekForwards={this.state.onionSkinSeekForwards}
                                    onRef={ref => this.canvasRef = ref}
                                  />
                                </DockedPanel>
                              </ReflexElement>

                            </ReflexContainer>
                          </ReflexElement>
                          <ReflexSplitter {...this.resizeProps}/>
                          <ReflexElement
                            minSize={50}
                            size={this.state.timelineSize}
                            onResize={this.resizeProps.onResize}
                            onStopResize={this.resizeProps.onStopTimelineResize}>
                            <DockedPanel>
                              <Timeline
                                project={this.state.project}
                                updateEditorState={this.updateEditorState}
                                onionSkinEnabled={this.state.onionSkinEnabled}
                                onionSkinSeekBackwards={this.state.onionSkinSeekBackwards}
                                onionSkinSeekForwards={this.state.onionSkinSeekForwards}
                                onRef={ref => this.timelineRef = ref}
                              />
                            </DockedPanel>
                          </ReflexElement>
                        </ReflexContainer>
                      </ReflexElement>

                      <ReflexSplitter {...this.resizeProps}/>

                    {/* Right Sidebar */}
                      <ReflexElement
                        size={this.state.inspectorSize}
                        maxSize={250} minSize={150}
                        onResize={this.resizeProps.onResize}
                        onStopResize={this.resizeProps.onStopInspectorResize}>
                        <ReflexContainer orientation="horizontal">
                          {/* Inspector */}
                          <ReflexElement propagateDimensions={true} minSize={200}{...this.resizeProps}>
                            <DockedPanel>
                              <Inspector
                                getActiveTool={this.getActiveTool}
                                getToolSettings={this.getToolSettings}
                                setToolSettings={this.setToolSettings}
                                getSelectionType={this.getSelectionType}
                                getSelectionAttributes={this.getSelectionAttributes}
                                setSelectionAttributes={this.setSelectionAttributes}
                              />
                            </DockedPanel>
                          </ReflexElement>

                          <ReflexSplitter {...this.resizeProps}/>

                          {/* Asset Library */}
                          <ReflexElement
                            size={this.state.assetLibrarySize}
                            onResize={this.resizeProps.onResize}
                            onStopResize={this.resizeProps.onStopAssetLibraryResize}>
                            <DockedPanel>
                              <AssetLibrary
                                assets={this.state.project.assets}
                                openFileDialog={() => open()}
                                selectObjects={this.selectObjects}
                                isObjectSelected={this.isObjectSelected}
                              />
                            </DockedPanel>
                          </ReflexElement>
                        </ReflexContainer>
                      </ReflexElement>
                    </ReflexContainer>
                  </div>
                </div>
              </div>
            </HotKeys>
        </div>
      )}
      </Dropzone>
      )
  }
}

export default DragDropContext(HTML5Backend)(Editor)
