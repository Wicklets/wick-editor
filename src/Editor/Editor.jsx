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

import EditorCore from './EditorCore';
import UndoRedo from '../core/UndoRedo';
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

    // GUI state
    this.state = {
      ...this.state,
      inspectorSize: 250,
      codeEditorSize: 0.1,
      timelineSize: 100,
      assetLibrarySize: 150,
      previewPlaying: false,
      history: new UndoRedo(this),
    };

    // Init hotkeys
    this.hotKeyInterface = new HotKeyInterface(this);

    // Init actions
    this.actionMapInterface = new ActionMapInterface(this);

    // Tools
    this.createAssets = this.createAssets.bind(this);

    // Modals
    this.openModal = this.openModal.bind(this);
    this.closeActiveModal = this.closeActiveModal.bind(this);

    // Canvas
    this.updateCanvas = this.updateCanvas.bind(this);
    this.rerenderCanvas = this.rerenderCanvas.bind(this);
    this.rerenderTimeline = this.rerenderTimeline.bind(this);

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

    // Preview play tick loop
    this.tickLoopIntervalID = null;
    this.togglePreviewPlaying = this.togglePreviewPlaying.bind(this);
    this.startTickLoop = this.startTickLoop.bind(this);
    this.stopTickLoop = this.stopTickLoop.bind(this);

    // References to canvas and timeline (for fast preview play rendering)
    this.canvasRef = React.createRef();
    this.timelineRef = React.createRef();
  }

  componentWillMount () {
    this.initializeEngine();
  }

  componentDidMount () {
    this.refocusEditor();
    this.state.history.saveState();
  }

  componentDidUpdate (prevProps, prevState) {
    this.updateCanvas();

    if(this.state.previewPlaying && !prevState.previewPlaying) {
      this.startTickLoop();
    }

    if(!this.state.previewPlaying && prevState.previewPlaying) {
      this.stopTickLoop();
    }
  }

  updateCanvas () {
    // re-render the canvas
    //console.log(this.state.project.focus.timeline.activeLayer.activeFrame.svg)
    this.rerenderCanvas();

    // update the paper.js selection using the editor selection state
    window.paper.project.selection.clear();
    this.getSelectedPaths().forEach(path => {
      window.paper.project.selection.addItemByName(path.name);
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
    if(!this.state.project.focus.timeline.activeLayer.activeFrame ||
       this.state.project.focus.timeline.activeLayer.locked ||
       this.state.project.focus.timeline.activeLayer.hidden) {
      window.paper.drawingTools.none.activate();
    }
  }

  rerenderCanvas () {
    this.state.canvas.render(this.state.project, {
      onionSkinEnabled: this.state.onionSkinEnabled,
      onionSkinSeekBackwards: this.state.onionSkinSeekBackwards,
      onionSkinSeekForwards: this.state.onionSkinSeekForwards,
    });
  }

  rerenderTimeline () {

  }

  applyCanvasChangesToProject () {
    this.state.canvas.applyChanges(this.state.project, window.paper.project.layers);
    this.forceUpdate();
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

  togglePreviewPlaying () {
    this.setState(prevState => ({
      previewPlaying: !prevState.previewPlaying,
    }));
  }

  startTickLoop () {
    this.tickLoopIntervalID = setInterval(() => {
      this.state.project.tick();
      this.rerenderCanvas();
      this.rerenderTimeline();
    }, 1000 / this.state.project.framerate);
  }

  stopTickLoop () {
    clearInterval(this.tickLoopIntervalID);
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
                    createClipFromSelection={this.createClipFromSelection}
                    updateProjectSettings={this.updateProjectSettings}
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
                                    project={this.state.project}
                                    getSelectionType={this.getSelectionType}
                                    getSelectedFrames={this.getSelectedFrames}
                                    getSelectedClips={this.getSelectedClips}
                                    forceUpdateProject={this.forceUpdateProject}
                                  />
                                </DockedPanel>
                              </ReflexElement>
                              <ReflexSplitter {...this.resizeProps}/>
                              <ReflexElement>
                                <DockedPanel>
                                  <Canvas
                                    project={this.state.project}
                                    forceUpdateProject={this.forceUpdateProject}
                                    canvas={this.state.canvas}
                                    paper={this.state.paper}
                                    selectObjects={this.selectObjects}
                                    updateCanvas={this.updateCanvas}
                                    onRef={ref => this.canvasRef = ref}
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
                            <DockedPanel>
                              <Timeline
                                project={this.state.project}
                                getSelectedTimelineObjects={this.getSelectedTimelineObjects}
                                selectObjects={this.selectObjects}
                                forceUpdateProject={this.forceUpdateProject}
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
                          <ReflexElement propagateDimensions={true} minSize={200}{...this.resizeProps}>
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
