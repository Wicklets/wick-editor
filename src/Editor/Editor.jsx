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

import React from 'react';

import './_editor.scss';

import 'bootstrap/dist/css/bootstrap.min.css';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from "react-dnd";
import 'react-reflex/styles.css'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import { throttle } from 'underscore';
import { HotKeys } from 'react-hotkeys';
import Dropzone from 'react-dropzone';
import localForage from 'localforage';

import EditorCore from './EditorCore';
import UndoRedo from '../core/UndoRedo';
import AssetCache from '../core/AssetCache';
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
import ActionMapInterface from './actionMap';

class Editor extends EditorCore {
  constructor () {
    super();

    // History (undo/redo stacks)
    this.history = new UndoRedo(this);

    // Asset cache
    this.assetCache = new AssetCache(this);

    // "Live" editor states
    this.project = null;
    this.paper = null;
    this.canvas = null;

    // GUI state
    this.state = {
      project: null,
      selection: this.emptySelection(),
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
        sizeJump: 5,
      },
      onionSkinEnabled: false,
      onionSkinSeekForwards: 1,
      onionSkinSeekBackwards: 1,
      previewPlaying: false,
      activeModalName: "AlphaWarning",
      inspectorSize: 250,
      codeEditorSize: 0.1,
      timelineSize: 100,
      assetLibrarySize: 150,
    };

    // Init hotkeys
    this.hotKeyInterface = new HotKeyInterface(this);

    // Init actions
    this.actionMapInterface = new ActionMapInterface(this);

    // Resiable panels
    this.RESIZE_THROTTLE_AMOUNT_MS = 10;
    this.WINDOW_RESIZE_THROTTLE_AMOUNT_MS = 300;
    this.resizeProps = {
      onStopResize: throttle(this.onStopResize, this.resizeThrottleAmount),
      onStopInspectorResize: throttle(this.onStopInspectorResize, this.resizeThrottleAmount),
      onStopAssetLibraryResize: throttle(this.onStopAssetLibraryResize, this.resizeThrottleAmount),
      onStopTimelineResize: throttle(this.onStopTimelineResize, this.resizeThrottleAmount),
      onStopCodeEditorResize: throttle(this.onStopCodeEditorResize, this.resizeThrottleAmount),
      onResize: throttle(this.onResize, this.resizeThrottleAmount),
      onWindowResize: throttle(this.onWindowResize, this.windowResizeThrottleAmount),
    };
    window.addEventListener("resize", this.resizeProps.onWindowResize);

    // Preview play tick loop
    this.tickLoopIntervalID = null;

    // Save the project state before preview playing so we can retrieve it later
    this.beforePreviewPlayProjectState = null;

    // Lock state flag
    this.lockState = false;

    // Auto Save
    this.autoSaveDelay = 5000; // millisecond delay
    this.throttledAutoSaveProject = throttle(this.autoSaveProject, this.autoSaveDelay);
  }

  componentWillMount = () => {
    // Initialize "live" engine state
    this.project = new window.Wick.Project();
    this.paper = window.paper;
    this.canvas = null;

    // Initialize local storage
    localForage.config({
      name        : 'WickEditor',
      description : 'Live Data storage of the Wick Editor app.'
    });
    this.autoSaveKey = "wickEditorAutosave";

    // Setup the initial project state
    this.setState({
      ...this.state,
      project: this.project.serialize(),
    }, () => {
      this.history.saveState();
    });


    // Leave Page warning.
    window.onbeforeunload = function(event) {
      var confirmationMessage = 'Warning: All unsaved changes will be lost!';
      (event || window.event).returnValue = confirmationMessage; //Gecko + IE
      return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    };
  }

  componentDidMount = () => {
    this.refocusEditor();
  }

  /**
   * Resets the editor in preparation for a project load.
   */
  resetEditorForLoad = () => {
    this.history.clearHistory();
    this.history.saveState();
  }

  /**
   * Calls this.setState with a new state, and checks if the project or selection state changed, and if it did, saves the current state to the history. This function does nothing if this.lockState is set to true.
   * @param {object} nextState - The state to pass along to this.setState.
   */
  setStateWrapper = (nextState) => {
    if(this.lockState) return;

    nextState = {
      ...this.state,
      ...nextState,
    }

    let projectOrSelectionWillChange = this.projectOrSelectionChanged(this.state, nextState);
    this.setState(nextState, () => {
      if(projectOrSelectionWillChange) {
        this.history.saveState();
        this.throttledAutoSaveProject();
      }
    });
  }

  /**
   * Autosave the project in the state, if it exists.
   */
  autoSaveProject = () => {
    if (this.project === undefined) {return}
    localForage.setItem(this.autoSaveKey, this.project.serialize());
  }

  componentDidUpdate = (prevProps, prevState) => {
    this.updateCanvas();

    if(this.state.previewPlaying && !prevState.previewPlaying) {
      this.startTickLoop();
    }

    if(!this.state.previewPlaying && prevState.previewPlaying) {
      this.stopTickLoop();
    }
  }

  updateCanvas = (skipUpdateSelection) => {
    // re-render the canvas
    this.canvas.render(this.project, {
      onionSkinEnabled: this.state.onionSkinEnabled,
      onionSkinSeekBackwards: this.state.onionSkinSeekBackwards,
      onionSkinSeekForwards: this.state.onionSkinSeekForwards,
    });

    if(skipUpdateSelection) return;

    // update the paper.js selection using the editor selection state
    window.paper.project.selection.clear();
    this.getSelectedPaths().forEach(path => {
      window.paper.project.selection.addItemByName(path.uuid);
    });
    this.getSelectedClips().forEach(clip => {
      window.paper.project.selection.addItemByName('wick_clip_'+clip.uuid);
    });
    window.paper.project.selection.updateGUI();

    window.paper.project.addLayer(window.paper.project.selection.guiLayer);

    // update the paper.js active tool based on the editor active tool state.
    let tool = window.paper.drawingTools[this.state.activeTool];
    tool.activate();
    Object.keys(this.state.toolSettings).forEach(key => {
      tool[key] = this.state.toolSettings[key];
    });

    // if there is no layer/frame to draw on, activate the 'none' tool.
    if(!this.project.focus.timeline.activeLayer.activeFrame ||
       this.project.focus.timeline.activeLayer.locked ||
       this.project.focus.timeline.activeLayer.hidden) {
      window.paper.drawingTools.none.activate();
    }

    // if preview playing, use the Interact tool
    if(this.state.previewPlaying) {
      this.canvas.interactTool.activate();
    }
  }

  updateTimeline = () => {
    let AnimationTimeline = window.AnimationTimeline;
    let timeline = this.project.focus.timeline;
    let selectedUUIDs = this.getSelectedTimelineObjects().map(obj => {
      return obj.uuid;
    });
    let onionSkinOptions = this.getOnionSkinOptions();

    AnimationTimeline.setData({
      playheadPosition: timeline.playheadPosition,
      activeLayerIndex: timeline.activeLayerIndex,
      onionSkinEnabled: onionSkinOptions.onionSkinEnabled,
      onionSkinSeekForwards: onionSkinOptions.onionSkinSeekForwards,
      onionSkinSeekBackwards:onionSkinOptions.onionSkinSeekBackwards,
      layers: timeline.layers.map(layer => {
        return {
          id: layer.uuid,
          label: layer.name,
          locked: layer.locked,
          hidden: layer.hidden,
          frames: layer.frames.map(frame => {
            return {
              id: frame.uuid,
              label: frame.identifier,
              start: frame.start,
              end: frame.end,
              selected: selectedUUIDs.indexOf(frame.uuid) !== -1,
              contentful: frame.contentful,
              tweens: frame.tweens.map(tween => {
                return {
                  uuid: tween.uuid,
                  selected: selectedUUIDs.indexOf(tween.uuid) !== -1,
                  playheadPosition: tween.playheadPosition,
                }
              }),
            }
          }),
        }
      })
    });
    AnimationTimeline.repaint();
  }

  applyCanvasChangesToProject = () => {
    this.canvas.applyChanges(this.project, window.paper.project.layers);
  }

  projectOrSelectionChanged = (state, nextState) => {
    return JSON.stringify(state.project) !== JSON.stringify(nextState.project)
        || JSON.stringify(state.selection) !== JSON.stringify(nextState.selection);
  }

  onWindowResize = () => {
    // Ensure that all elements resize on window resize.
    this.resizeProps.onResize();
  }

  onResize = (e) => {
    this.canvas.resize();
    window.AnimationTimeline.resize();
  }

  onStopResize = ({domElement, component}) => {

  }

  getSizeHorizontal = (domElement) => {
    return domElement.offsetWidth;
  }

  getSizeVertical = (domElement) => {
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

  openModal = (name) => {
    if (this.state.activeModalName !== name) {
      this.setState({
        activeModalName: name,
      });
    }
    this.refocusEditor();
  }

  closeActiveModal = () => {
    this.openModal(null);
  }

  /**
   * Opens and closes the code editor depending on the state of the codeEditor.
   */
  toggleCodeEditor = () => {
    const minSize = .1;
    const openSize = 500;

    let newSize = minSize;
    if (this.state.codeEditorSize < 10) {
      newSize = openSize;
    }

    this.setState( {
      codeEditorSize: newSize,
    })
  }

  refocusEditor = () => {
    window.document.getElementById('hotkeys-container').focus();
  }

  togglePreviewPlaying = () => {
    this.setState(prevState => ({
      previewPlaying: !prevState.previewPlaying,
    }));
  }

  startTickLoop = () => {
    this.beforePreviewPlayProjectState = this.project.serialize();
    this.tickLoopIntervalID = setInterval(() => {
      this.project.tick();
      this.canvas.interactTool.processMouseInputPreTick();
      this.updateCanvas(true);
      this.updateTimeline();
    }, 1000 / this.project.framerate);
  }

  stopTickLoop = () => {
    clearInterval(this.tickLoopIntervalID);

    this.loadLiveProjectFromState(this.beforePreviewPlayProjectState, () => {
      this.setState({project: this.beforePreviewPlayProjectState});
    });
  }

  loadLiveProjectFromState = (projectState, callback) => {
    this.project = window.Wick.Project.deserialize(projectState);

    if(this.project.assets.length === 0) {
      callback();
      return;
    }

    let assetCache = this.assetCache;

    this.project.assets.forEach(asset => {
      let cacheEntry = assetCache.getCachedDataForAsset(asset);
      if(cacheEntry) {
        asset.html5Image = cacheEntry.html5Image;
        asset.paperjsRaster = cacheEntry.paperjsRaster;
      }
    });

    let assetLoadedCount = 0;
    let totalAssetsCount = this.project.assets.length;
    this.project.assets.forEach(asset => {
      asset.onload = () => {
        assetCache.setCachedDataForAsset(asset);
        assetLoadedCount++;
        if(assetLoadedCount === totalAssetsCount) {
          callback();
        }
      }
    })
  }

  setWickCanvas = (wickCanvas) => {
    this.canvas = wickCanvas;
  }

  render = () => {
      return (
    <Dropzone
      accept={window.Wick.Asset.getValidMIMETypes()}
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
                    project={this.project}
                    createSymbolFromSelection={this.createSymbolFromSelection}
                    updateProjectSettings={this.updateProjectSettings}
                  />
                  {/* Header */}
                  <DockedPanel>
                    <MenuBar
                      openModal={this.openModal}
                      projectName={this.project.name}
                      exportProjectAsWickFile={this.exportProjectAsWickFile}
                      importProjectAsWickFile={this.importProjectAsWickFile}/>
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
                                getActiveTool={this.getActiveTool}
                                setActiveTool={this.setActiveTool}
                                getToolSettings={this.getToolSettings}
                                setToolSettings={this.setToolSettings}
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
                                    project={this.project}
                                    updateProjectInState={this.updateProjectInState}
                                    getSelectionType={this.getSelectionType}
                                    getSelectedFrames={this.getSelectedFrames}
                                    getSelectedClips={this.getSelectedClips}
                                  />
                                </DockedPanel>
                              </ReflexElement>
                              <ReflexSplitter {...this.resizeProps}/>
                              <ReflexElement>
                                <DockedPanel>
                                  <Canvas
                                    project={this.project}
                                    updateProjectInState={this.updateProjectInState}
                                    canvas={this.canvas}
                                    paper={this.paper}
                                    selectObjects={this.selectObjects}
                                    updateCanvas={this.updateCanvas}
                                    createImageFromAsset={this.createImageFromAsset}
                                    setWickCanvas={this.setWickCanvas}
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
                                project={this.project}
                                updateProjectInState={this.updateProjectInState}
                                updateTimeline={this.updateTimeline}
                                getSelectedTimelineObjects={this.getSelectedTimelineObjects}
                                selectObjects={this.selectObjects}
                                setOnionSkinOptions={this.setOnionSkinOptions}
                                getOnionSkinOptions={this.getOnionSkinOptions}
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
                          <ReflexElement minSize={200}{...this.resizeProps}>
                            <DockedPanel>
                              <Inspector
                                getActiveTool={this.getActiveTool}
                                getToolSettings={this.getToolSettings}
                                setToolSettings={this.setToolSettings}
                                getSelectionType={this.getSelectionType}
                                getSelectionAttributes={this.getSelectionAttributes}
                                setSelectionAttributes={this.setSelectionAttributes}
                                getSelectionActions={this.getSelectionActions}
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
                                assets={this.project.assets}
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
