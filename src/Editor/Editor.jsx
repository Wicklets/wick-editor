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
        strokeColor: '#ffff00',
        strokeWidth: 1,
        brushSize: 10,
        brushSmoothing: 0.5,
        borderRadius: 0,
      },
    }

    this.resizeProps = {
      onStopResize: this.onStopResize.bind(this),
      onResize: this.onResize.bind(this)
    }

    this.updateProject = this.updateProject.bind(this);
    this.updateSelection = this.updateSelection.bind(this);
    this.changeFrameLength = this.changeFrameLength.bind(this);
    this.openModal = this.openModal.bind(this);
    this.activateTool = this.activateTool.bind(this);
    this.getSelection = this.getSelection.bind(this);
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
    window.dispatchEvent(new Event('resize'));
  }

  onStopResize (e) {

  }

  openModal (name) {
    this.setState({
      openModalName: name,
    });
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
        <ReflexContainer orientation="horizontal">
          <ReflexElement className="header" size={37} style={{minHeight:"37px",maxHeight:"37px"}}>
            <ModalHandler openModal={this.openModal}
                          openModalName={this.state.openModalName}
                          project={this.state.project}
                          updateProject={this.updateProject} />
            {/* Header */}
            <DockedPanel><MenuBar openModal={this.openModal} /></DockedPanel>
          </ReflexElement>
          <ReflexElement {...this.resizeProps}>
              <ReflexContainer orientation="vertical">

                <ReflexElement size={50} {...this.resizeProps} style={{minWidth:"50px",maxWidth:"50px"}}>
                  {/* Left Sidebar */}
                  <DockedPanel>
                    <Toolbox
                      activeTool={this.state.activeTool}
                      fillColor={this.state.fillColor}
                      strokeColor={this.state.strokeColor}
                      activateTool={this.activateTool}
                    />
                  </DockedPanel>
                </ReflexElement>

                <ReflexElement {...this.resizeProps}>
                  {/* Middle Panel */}
                  <ReflexContainer orientation="horizontal">
                    {/* Timeline */}
                    <ReflexElement size={150} {...this.resizeProps}>
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
                          updateProject={this.updateProject}
                          updateSelection={this.updateSelection}
                          activeTool={this.state.activeTool}
                        />
                      </DockedPanel>
                    </ReflexElement>
                    <ReflexSplitter {...this.resizeProps}/>
                    {/* Code Editor */}
                    <ReflexElement size={150} {...this.resizeProps}>
                      <DockedPanel><CodeEditor /></DockedPanel>
                    </ReflexElement>
                  </ReflexContainer>
                </ReflexElement>

                <ReflexSplitter {...this.resizeProps}/>

                <ReflexElement size={250} {...this.resizeProps}>
                  {/* Right Sidebar */}
                  <ReflexContainer orientation="horizontal">
                    <ReflexElement {...this.resizeProps}>
                      <DockedPanel><Inspector /></DockedPanel>
                    </ReflexElement>

                    <ReflexSplitter {...this.resizeProps}/>

                    <ReflexElement {...this.resizeProps}>
                      <DockedPanel><AssetLibrary /></DockedPanel>
                    </ReflexElement>
                  </ReflexContainer>
                </ReflexElement>

              </ReflexContainer>
          </ReflexElement>
        </ReflexContainer>
      )
  }
}

export default Editor
