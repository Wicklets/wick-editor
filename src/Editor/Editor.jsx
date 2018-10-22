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
      openModalName: null,
    }
    this.resizeProps = {
      onStopResize: this.onStopResize.bind(this),
      onResize: this.onResize.bind(this)
    }
  }

  componentWillMount () {
    var project = new window.Wick.Project();
    this.setState({project: project});
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

  updateProjectSettings (settings) {
    console.log(settings);
    this.setState(prevState => ({
      project: {
          ...prevState.project,
          name: settings.name,
      }
    }));
  }

  render () {
      return (
        <ReflexContainer orientation="horizontal">
          <ReflexElement className="header" flex={0.05}>
            <ModalHandler openModal={this.openModal.bind(this)}
                          openModalName={this.state.openModalName}
                          project={this.state.project}
                          updateProjectSettings={this.updateProjectSettings.bind(this)} />
            {/* Header */}
            <DockedPanel><MenuBar openModal={this.openModal.bind(this)} /></DockedPanel>
          </ReflexElement>
          <ReflexElement {...this.resizeProps}>
            <ReflexContainer orientation="vertical">

              <ReflexElement flex={0.05} {...this.resizeProps}>
                {/* Left Sidebar */}
                <DockedPanel><Toolbox /></DockedPanel>
              </ReflexElement>

              <ReflexElement {...this.resizeProps}>
                {/* Middle Panel */}
                <ReflexContainer orientation="horizontal">
                  <ReflexElement flex={0.2} {...this.resizeProps}>
                    <DockedPanel><Timeline /></DockedPanel>
                  </ReflexElement>
                  <ReflexSplitter {...this.resizeProps}/>
                  <ReflexElement {...this.resizeProps}>
                    <DockedPanel><Canvas /></DockedPanel>
                  </ReflexElement>
                  <ReflexSplitter {...this.resizeProps}/>
                  <ReflexElement flex={0.2} {...this.resizeProps}>
                    <DockedPanel><CodeEditor /></DockedPanel>
                  </ReflexElement>
                </ReflexContainer>
              </ReflexElement>

              <ReflexSplitter {...this.resizeProps}/>

              <ReflexElement flex={0.2} {...this.resizeProps}>
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
