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

import 'react-reflex/styles.css'
import {
  ReflexContainer,
  ReflexSplitter,
  ReflexElement
} from 'react-reflex'

import DockedPanel from './Panels/DockedPanel/DockedPanel';
import Canvas from './Panels/Canvas/Canvas';
import Inspector from './Panels/Inspector/Inspector';
import MenuBar from './Panels/MenuBar/MenuBar';
import Timeline from './Panels/Timeline/Timeline';
import Toolbox from './Panels/Toolbox/Toolbox';
import AssetLibrary from './Panels/AssetLibrary/AssetLibrary';
import CodeEditor from './Panels/CodeEditor/CodeEditor';
import ModalHandler from './Modals/ModalHandler/ModalHandler';
import { HotKeys } from 'react-hotkeys';
import HotKeyInterface from './hotKeyMap';

class Editor extends Component {

  constructor () {
    super();

    this.state = {
      project: null,
      selection: [],
      openModalName: null,
      activeTool: 'croquisBrush',
      toolSettings: {
        fillColor: '#ffaabb',
        strokeColor: '#000',
        strokeWidth: 1,
        brushSize: 10,
        brushSmoothing: 0.5,
        borderRadius: 0,
        pressureOn: false,
      },
      windowWidth: 0,
      windowHeight: 0,
      rightPanelSize: 250,
    }

    this.resizeProps = {
      onStopResize: this.onStopResize.bind(this),
      onResize: this.onResize.bind(this)
    }

    // define hotkeys
    this.hotKeyInterface = new HotKeyInterface(this);

    this.updateProject = this.updateProject.bind(this);
    this.updateSelection = this.updateSelection.bind(this);
    this.changeFrameLength = this.changeFrameLength.bind(this);
    this.openModal = this.openModal.bind(this);
    this.activateTool = this.activateTool.bind(this);
    this.getSelection = this.getSelection.bind(this);
    this.updateToolSettings = this.updateToolSettings.bind(this);
    this.deleteSelectedObjects = this.deleteSelectedObjects.bind(this);

  }

  componentWillMount () {
    let project = new window.Wick.Project();
    project.root.timeline.layers[0].frames[0].pathsSVG = ('["Layer",{"applyMatrix":true,"children":[["Path",{"applyMatrix":true,"segments":[[[75,100],[0,13.80712],[0,-13.80712]],[[100,75],[-13.80712,0],[13.80712,0]],[[125,100],[0,-13.80712],[0,13.80712]],[[100,125],[13.80712,0],[-13.80712,0]]],"closed":true,"fillColor":[1,0,0]}]]}]');
    this.setState({project: project});
  }

  componentDidMount () {
    let frame = this.state.project.focus.timeline.layers[0].frames[0];
    this.changeFrameLength(frame, 10);
  }

  onResize (e) {
  }

  onStopResize = ({domElement, component}) => {
  }


  openModal (name) {
    if (this.state.openModalName !== name) {
      this.setState({
        openModalName: name,
      });
    }
  }

  activateTool (toolName) {
    window.paper.drawingTools[toolName].activate();
    this.setState({
      activeTool: toolName
    });
  }

  updateProject (nextProject) {
    this.setState(prevState => ({
      project: nextProject,
    }));
  }

  updateSelection (nextSelection) {
    this.setState(prevState => ({
      selection: nextSelection,
    }));
  }

  updateToolSettings (newToolSettings) {
    let updatedToolSettings = this.state.toolSettings;

    // Update only provided settings.
    Object.keys(newToolSettings).forEach((key) =>
      updatedToolSettings[key] = newToolSettings[key]
    )

    this.setState({
      toolSettings: updatedToolSettings,
    });
  }

  deleteSelectedObjects () {
    var selection = this.getSelection();

    selection.paths.forEach(path => {
      path.remove();
    });

    selection.frames.forEach(frame => {
      frame.parent.removeFrame(frame);
    });

    this.setState(prevState => ({
      project: prevState.project,
      selection: []
    }));
  }

  changeFrameLength (frame, newLength) {
    /*this.setState(prevState => {
      frame.end = 100;
      return prevState;
    });*/
  }

  getSelection () {
    let visibleLayers = this.state.project.focus.timeline.layers;
    let selectablePaths = [].concat.apply([], visibleLayers.map(layer => {
      return layer.activeFrame.svg.children;
    }));
    let selectableGroups = [].concat.apply([], visibleLayers.map(layer => {
      return layer.activeFrame.groups;
    }));
    let selectableFrames = [].concat.apply([], visibleLayers.map(layer => {
      return layer.frames;
    }));
    let selectableTweens = [].concat.apply([], selectableFrames.map(layer => {
      return layer.tweens;
    }));

    var ids = this.state.selection;
    let selectedPaths = selectablePaths.filter(path => {
      return ids.indexOf(path.id) !== -1;
    });
    let selectedGroups = selectableGroups.filter(group => {
      return ids.indexOf(group.uuid) !== -1;
    });
    let selectedFrames = selectableFrames.filter(frame => {
      return ids.indexOf(frame.uuid) !== -1;
    });
    let selectedTweens = selectableTweens.filter(tween => {
      return ids.indexOf(tween.uuid) !== -1;
    });

    return {
      paths: selectedPaths,
      groups: selectedGroups,
      frames: selectedFrames,
      tweens: selectedTweens,
    }
  }

  render () {
      return (
        <HotKeys
          keyMap={this.hotKeyInterface.getKeyMap()}
          handlers={this.hotKeyInterface.getHandlers()}
          style={{width:"100%", height:"100%"}}>
          <div id="editor">
            <div id="menu-bar-container">
              <ModalHandler openModal={this.openModal}
                            openModalName={this.state.openModalName}
                            project={this.state.project}
                            updateProject={this.updateProject} />
              {/* Header */}
              <DockedPanel><MenuBar openModal={this.openModal} projectName={this.state.project.name}/></DockedPanel>
            </div>
            <div id="editor-body">
              <div id="tool-box-container">
                <DockedPanel>
                  <Toolbox
                    activeTool={this.state.activeTool}
                    toolSettings={this.state.toolSettings}
                    updateToolSettings={this.updateToolSettings}
                    fillColor={this.state.fillColor}
                    strokeColor={this.state.strokeColor}
                    activateTool={this.activateTool}
                  />
                </DockedPanel>
              </div>
              <div id="flexible-container">
                {/* TODO:The 'key' update below is a hack to force ReflexContainers to re render on window resize and should be replaced ASAP */}
                <ReflexContainer orientation="vertical">
                  {/* Middle Panel */}
                  <ReflexElement {...this.resizeProps}>
                    <ReflexContainer orientation="horizontal">
                      {/* Timeline */}
                      <ReflexElement size={100} {...this.resizeProps}>
                        <DockedPanel>
                          <Timeline
                            project={this.state.project}
                            selection={this.state.selection}
                            updateProject={this.updateProject}
                            updateSelection={this.updateSelection}
                          />
                        </DockedPanel>
                      </ReflexElement>
                      <ReflexSplitter {...this.resizeProps}/>
                      {/* Canvas */}
                      <ReflexElement {...this.resizeProps}>
                        <DockedPanel>
                          <Canvas
                            project={this.state.project}
                            toolSettings={this.state.toolSettings}
                            updateProject={this.updateProject}
                            updateSelection={this.updateSelection}
                            activeTool={this.state.activeTool}
                          />
                        </DockedPanel>
                      </ReflexElement>
                      <ReflexSplitter {...this.resizeProps}/>
                      {/* Code Editor */}
                      <ReflexElement size={1} {...this.resizeProps}>
                        <DockedPanel><CodeEditor /></DockedPanel>
                      </ReflexElement>
                    </ReflexContainer>
                  </ReflexElement>

                  <ReflexSplitter {...this.resizeProps}/>

                {/* Right Sidebar */}
                  <ReflexElement
                    size={150}
                    maxSize={250} minSize={150}
                    {...this.resizeProps}>
                    <ReflexContainer orientation="horizontal">
                      {/* Inspector */}
                      <ReflexElement propagateDimensions={true} minSize={200} {...this.resizeProps}>
                        <DockedPanel>
                          <Inspector
                            activeTool={this.state.activeTool}
                            toolSettings={this.state.toolSettings}
                            updateToolSettings={this.updateToolSettings}/>
                        </DockedPanel>
                      </ReflexElement>

                      <ReflexSplitter {...this.resizeProps}/>

                      {/* Asset Library */}
                      <ReflexElement { ...this.resizeProps}>
                        <DockedPanel><AssetLibrary /></DockedPanel>
                      </ReflexElement>
                    </ReflexContainer>
                  </ReflexElement>
                </ReflexContainer>
              </div>
            </div>
          </div>
        </HotKeys>
      )
  }
}

export default Editor
