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
    };

    // Init hotkeys
    this.hotKeyInterface = new HotKeyInterface(this);

    // Tools
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
    this.initializeEngine();
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
                                getActiveTool={this.getActiveTool}
                                setActiveTool={this.setActiveTool}
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
