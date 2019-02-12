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
import ReactGA from 'react-ga';

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
import DockedPanel from './Panels/DockedPanel/DockedPanel';
import Canvas from './Panels/Canvas/Canvas';
import Inspector from './Panels/Inspector/Inspector';
import MenuBar from './Panels/MenuBar/MenuBar';
import Timeline from './Panels/Timeline/Timeline';
import Toolbox from './Panels/Toolbox/Toolbox';
import AssetLibrary from './Panels/AssetLibrary/AssetLibrary';
import ModalHandler from './Modals/ModalHandler/ModalHandler';
import HotKeyInterface from './hotKeyMap';
import ActionMapInterface from './actionMap';
import PopOutCodeEditor from './PopOuts/PopOutCodeEditor/PopOutCodeEditor';

class Editor extends EditorCore {
  constructor () {
    super();

    // History (undo/redo stacks)
    this.history = new UndoRedo(this);

    // "Live" editor states
    this.project = null;
    this.paper = null;

    // GUI state
    this.state = {
      project: null,
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
      previewPlaying: false,
      activeModalName: null,
      activeModalQueue: [],
      codeEditorOpen: false,
      codeEditorWindowProperties: {
        width: 500,
        height: 250,
        x: window.innerWidth/2 - 250,
        y: window.innerHeight/2 - 125,
        minWidth: 300,
        minHeight: 250,
      },
      codeErrors: [],
      inspectorSize: 250,
      timelineSize: 100,
      assetLibrarySize: 150,
    };

    // Set up error.
    this.error = null;

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

    // Save the project state before preview playing so we can retrieve it later
    this.beforePreviewPlayProjectState = null;

    // Lock state flag
    this.lockState = false;

    // Auto Save
    this.autoSaveDelay = 1000; // millisecond delay
    this.throttledAutoSaveProject = throttle(this.autoSaveProject, this.autoSaveDelay);
  }

  componentWillMount = () => {
    // Initialize Google Analytics
    ReactGA.initialize('UA-1334611534-1', { standardImplementation: true });

    // Initialize "live" engine state
    this.project = new window.Wick.Project();
    this.paper = window.paper;

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
    this.showAutosavedProjects();
  }

  componentDidUpdate = (prevProps, prevState) => {
    //Render wick canvas stuff
    this.project.view.render();

    window.paper.project.selection.clear();
    this.project.selection.getSelectedObjects('Path').forEach(path => {
      window.paper.project.selection.addItemByName(path.uuid);
    });
    this.project.selection.getSelectedObjects('Clip').forEach(clip => {
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

    if(this.state.previewPlaying && !prevState.previewPlaying) {
      this.beforePreviewPlayProjectState = this.project.serialize();
      this.project.play({
        onError: (error) => {
          this.stopPreviewPlaying(error)
        },
        onAfterTick: () => {
          // Force re-render timeline...
        },
        onBeforeTick: () => {

        },
      });
    }

    if(!this.state.previewPlaying && prevState.previewPlaying) {
      this.project.stop();
      this.project = window.Wick.Project.deserialize(this.beforePreviewPlayProjectState);
    }
  }

//

  showAutosavedProjects = () => {
    this.doesAutoSavedProjectExist(bool => { if (bool) {
      this.queueModal('AutosaveWarning');
      }
    });
  }

  /**
   * Resets the editor in preparation for a project load.
   */
  resetEditorForLoad = () => {
    this.history.clearHistory();
  }

  /**
   * Autosave the project in the state, if it exists.
   */
  autoSaveProject = () => {
    if (this.project === undefined) return
    localForage.setItem(this.autoSaveKey, this.project.serialize());
  }

  projectOrSelectionChanged = (state, nextState) => {
    return JSON.stringify(state.project) !== JSON.stringify(nextState.project);
  }

  onWindowResize = () => {
    // Ensure that all elements resize on window resize.
    this.resizeProps.onResize();
  }

  onResize = (e) => {
    this.project.view.resize();
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

  /**
   * Updates the code editor properties in the state.
   * @param  {object} newProperties object with new code editor properties. Can include width, height, x, y.
   */
  updateCodeEditorWindowProperties = (newProperties) => {
    let finalProperties = this.state.codeEditorWindowProperties;
    Object.keys(newProperties).forEach(key => {
      finalProperties[key] = newProperties[key];
    });

    this.setState({
      codeEditorWindowProperties: finalProperties,
    });
  }

  /**
   * Removes all code errors.
   */
  removeCodeErrors = () => {
    this.setState({
      codeErrors: [],
    });
  }

  /**
   * An event called when a minor code update happens as defined by the code editor.
   */
  onMinorScriptUpdate = () => {
    if (this.state.codeErrors.length > 0) {
      this.removeCodeErrors();
    }
  }

  /**
   * An event called when a major code update happens as defined by the code editor.
   * @return {[type]} [description]
   */
  onMajorScriptUpdate = () => {

  }

  /**
   * Called when the inspector is resized.
   * @param  {DomElement} domElement DOM element containing the inspector
   * @param  {React.Component} component  React component of the inspector.
   */
  onStopInspectorResize = ({domElement, component}) => {
    this.setState({
      inspectorSize: this.getSizeHorizontal(domElement)
    });
  }

  /**
   * Called when the asset library is resized.
   * @param  {DomElement} domElement DOM element containing the asset library
   * @param  {React.Component} component  React component of the asset library
   */
  onStopAssetLibraryResize = ({domElement, component}) => {
    this.setState({
      assetLibrarySize: this.getSizeVertical(domElement)
    });
  }

  /**
   * Called when the timeline is resized.
   * @param  {DomElement} domElement DOM element containing the timeline
   * @param  {React.Component} component  React component of the timeline.
   */
  onStopTimelineResize = ({domElement, component}) => {
    var size = this.getSizeHorizontal(domElement);

    this.setState({
      timelineSize: size
    });
  }

  /**
   * Opens the requested modal.
   * @param  {string} name name of the modal to open.
   */
  openModal = (name) => {
    this.setState({
      activeModalName: name,
    });
    this.refocusEditor();
  }

  /**
   * Queues a modal to be opened at the next opportunity.
   * @param  {string} name [description]
   */
  queueModal = (name) => {
    if (this.state.activeModalName !== name) {
      // If there is another modal up, queue the modal.
      if (this.state.activeModalName !== null && this.state.activeModalQueue.indexOf(name) === -1) {
        this.setState(prevState => {
          return {
            activeModalQueue: [name].concat(prevState.activeModalQueue),
          }
        });
      // Otherwise, just open it.
      } else {
        this.openModal(name)
      }
    }
  }

  /**
   * Closes the active modal, if there is one. Opens the next modal in the
   * if necessary.
   */
  closeActiveModal = () => {
    let oldQueue = [].concat(this.state.activeModalQueue);
    if (oldQueue.length === 0) {
      this.openModal(null);
      return;
    }
    var newModalName = oldQueue.shift();
    this.setState({
      activeModalQueue: oldQueue,
    }, () => this.openModal(newModalName));
  }

  /**
   * Opens and closes the code editor depending on the state of the codeEditor.
   */
  toggleCodeEditor = () => {
    this.setState( {
      codeEditorOpen: !this.state.codeEditorOpen,
    })
  }

  /**
   * Focus the editor DOM element.
   */
  refocusEditor = () => {
    window.document.getElementById('hotkeys-container').focus();
  }

  /**
   * Toggles the preview play between on and off states.
   */
  togglePreviewPlaying = () => {
    let nextState = !this.state.previewPlaying;
    this.setState(prevState => ({
      previewPlaying: nextState,
      codeErrors: [],
    }));

    if(nextState) {
      this.focusCanvasElement();
    }
  }

  /**
   * Stops the project if it is currently preview playing and displays provided
   * errors in the code editor.
   * @param  {object[]} errors Array of error objects.
   */
  stopPreviewPlaying = (errors) => {
    this.stopTickLoop();
    this.setState({
      previewPlaying: false,
      codeErrors: errors === undefined ? [] : errors,
    });

    if (errors) {
      this.showCodeErrors(errors);
    }
  }

  /**
   * Show code errors in the code editor by pooping it up.
   * @param  {object[]} errors Array of error objects.
   */
  showCodeErrors = (errors) => {
    this.setState({
      codeEditorOpen: errors === undefined ? this.state.codeEditorOpen : true,
    });

    if (errors.length > 0) {
      let uuid = errors[0].uuid;
      this.selectObject(this.project.getChildByUUID(uuid))
    }
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
              keyMap={this.state.previewPlaying ? this.hotKeyInterface.getEssentialKeyMap() : this.hotKeyInterface.getKeyMap()}
              handlers={this.state.previewPlaying ? this.hotKeyInterface.getEssentialKeyHandlers() : this.hotKeyInterface.getHandlers()}
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
                    loadAutosavedProject={this.attemptAutoLoad}
                  />
                  {/* Header */}
                  <DockedPanel showOverlay={this.state.previewPlaying}>
                    <MenuBar
                      openModal={this.openModal}
                      projectName={this.project.name}
                      exportProjectAsWickFile={this.exportProjectAsWickFile}
                      importProjectAsWickFile={this.importProjectAsWickFile}
                    />
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
                                undoAction={() => this.history.undo()}
                                redoAction={() => this.history.redo()}
                              />
                            </DockedPanel>
                          </ReflexElement>
                          <ReflexElement {...this.resizeProps}>
                            <ReflexContainer orientation="vertical">
                              <ReflexElement>
                                <DockedPanel>
                                  <Canvas
                                    project={this.project}
                                    paper={this.paper}
                                    selectObjects={this.selectObjects}
                                    createImageFromAsset={this.createImageFromAsset}
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
                            <DockedPanel  showOverlay={this.state.previewPlaying}>
                              <Timeline
                                project={this.project}
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

                      {/*<ReflexSplitter {...this.resizeProps}/>*/}

                    {/* Right Sidebar */}
                      <ReflexElement
                        size={300}
                        maxSize={300} minSize={300}
                        onResize={this.resizeProps.onResize}
                        onStopResize={this.resizeProps.onStopInspectorResize}>
                        <ReflexContainer orientation="horizontal">
                          {/* Inspector */}
                          <ReflexElement minSize={200}{...this.resizeProps}>
                            <DockedPanel showOverlay={this.state.previewPlaying}>
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
                            <DockedPanel showOverlay={this.state.previewPlaying}>
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
          {this.state.codeEditorOpen &&
            <PopOutCodeEditor
              codeEditorWindowProperties={this.state.codeEditorWindowProperties}
              updateCodeEditorWindowProperties={this.updateCodeEditorWindowProperties}
              selectionIsScriptable={this.selectionIsScriptable}
              getSelectionType={this.getSelectionType}
              script={this.getScriptOfSelection()}
              toggleCodeEditor={this.toggleCodeEditor}
              errors={this.state.codeErrors}
              onMinorScriptUpdate={this.onMinorScriptUpdate}
              onMajorScriptUpdate={this.onMajorScriptUpdate}/>}
        </div>
      )}
      </Dropzone>
      )
  }
}

export default DragDropContext(HTML5Backend)(Editor)
