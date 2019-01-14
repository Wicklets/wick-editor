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
import Selection from '../core/Selection';
import UndoRedo from '../core/UndoRedo';

class Editor extends Component {
  constructor () {
    super();

    this.state = {
      project: null,
      selection: new Selection(this),
      undoRedo: new UndoRedo(this),
      onionSkinEnabled: false,
      onionSkinSeekForwards: 1,
      onionSkinSeekBackwards: 1,
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

    // Init hotkeys
    this.hotKeyInterface = new HotKeyInterface(this);

    // Tools
    this.activateTool = this.activateTool.bind(this);
    this.addAsset = this.addAsset.bind(this);

    // Modals
    this.openModal = this.openModal.bind(this);
    this.closeActiveModal = this.closeActiveModal.bind(this);

    // Preview play
    this.tickLoopIntervalID = null;
    this.togglePreviewPlaying = this.togglePreviewPlaying.bind(this);
    this.startTickLoop = this.startTickLoop.bind(this);
    this.stopTickLoop = this.stopTickLoop.bind(this);
    this.canvasRef = React.createRef();
    this.timelineRef = React.createRef(); // These refs are created so we don't have to update the state (slow) during preview play.

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
    this.setState({project: new window.Wick.Project()});
  }

  componentDidMount () {
    this.state.undoRedo.saveState();
    this.refocusEditor();
  }

  componentDidUpdate (prevProps, prevState) {
    if(this.state.previewPlaying && !prevState.previewPlaying) {
      this.startTickLoop();
    }

    if(!this.state.previewPlaying && prevState.previewPlaying) {
      this.stopTickLoop();
    }
  }

  onWindowResize () {
    // Ensure that all elements resize on window resize.
    this.resizeProps.onResize();
  }

  onResize (e) {
    window.WickCanvas.resize();
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
    if ((state.project || state.selection) && !state.dontPushToUndoRedoStack) {
      this.state.undoRedo.saveState();
    }
    if(state.activeTool && state.activeTool !== 'cursor') {
      this.state.selection.selectObjects([]);
      state.selection = this.state.selection;
    }
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

  togglePreviewPlaying () {
    this.setState(prevState => ({
      previewPlaying: !prevState.previewPlaying,
    }));
  }

  startTickLoop () {
    this.tickLoopIntervalID = setInterval(() => {
      this.state.project.tick();
      this.canvasRef.updateCanvas();
      this.timelineRef.updateAnimationTimelineData();
    }, 1000 / this.state.project.framerate);
  }

  stopTickLoop () {
    clearInterval(this.tickLoopIntervalID);
  }

  refocusEditor () {
    window.document.getElementById('hotkeys-container').focus();
  }

  addAsset (asset) {
    if (asset === undefined) { return }

    let newProject = this.state.project;
    newProject.addAsset(asset);

    this.updateEditorState({
      project: newProject,
    });

    // this.state.project.addAsset(asset);
  }

  createAssets (accepted, rejected) {
    if (rejected.length > 0) {
      alert("The Wick Editor could not accept these files." + JSON.stringify(rejected.map(f => f.name)));
    }

    if (accepted.length <= 0) return;

    accepted.forEach(file =>
      window.Wick.Asset.createAsset(file, this.addAsset),
    )
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
                    updateEditorState={this.updateEditorState}
                    project={this.state.project}
                    selection={this.state.selection}
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
                                    selection={this.state.selection}
                                    updateEditorState={this.updateEditorState}
                                  />
                                </DockedPanel>
                              </ReflexElement>
                              <ReflexSplitter {...this.resizeProps}/>
                              <ReflexElement>
                                <DockedPanel>
                                  <Canvas
                                    project={this.state.project}
                                    selection={this.state.selection}
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
                                selection={this.state.selection}
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
                                activeTool={this.state.activeTool}
                                updateEditorState={this.updateEditorState}
                                toolSettings={this.state.toolSettings}
                                selection={this.state.selection}
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
                                updateEditorState={this.updateEditorState}
                                openFileDialog={() => open()}
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
