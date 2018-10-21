import React, { Component } from 'react';
import './_editor.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import 'react-reflex/styles.css'
import {
  ReflexContainer,
  ReflexSplitter,
  ReflexElement
} from 'react-reflex'

/*
import Canvas from './Panels/Canvas/Canvas';
import Inspector from './Panels/Inspector/Inspector';
import MenuBar from './Panels/MenuBar/MenuBar';
import Timeline from './Panels/Timeline/Timeline';
import Toolbox from './Panels/Toolbox/Toolbox';
import AssetLibrary from './Panels/AssetLibrary/AssetLibrary';
import CodeEditor from './Panels/CodeEditor/CodeEditor';
*/

class Editor extends Component {

    constructor () {
      super()

      this.resizeProps = {
        onStopResize: this.onStopResize.bind(this),
        onResize: this.onResize.bind(this)
      }
    }

    onResize (e) {
      console.log('onResize')
    }

    onStopResize (e) {
      console.log('onStopResize')
    }

    renderHeader() {
      return (
        <div className="pane-content">Menubar</div>
      )
    }

    renderLeftSidebar () {
      return (
        <div className="pane-content">Toolbox</div>
      )
    }

    renderMiddlePanel () {
      return (
        <ReflexContainer orientation="horizontal">
          <ReflexElement flex={0.2} {...this.resizeProps}>
            <div className="pane-content">Timeline</div>
          </ReflexElement>

          <ReflexSplitter {...this.resizeProps}/>

          <ReflexElement {...this.resizeProps}>
            <div className="pane-content">Canvas</div>
          </ReflexElement>

          <ReflexSplitter {...this.resizeProps}/>

          <ReflexElement flex={0.2} {...this.resizeProps}>
            <div className="pane-content">Code Editor</div>
          </ReflexElement>
        </ReflexContainer>
      )
    }

    renderRightSidebar () {
      return (
        <ReflexContainer orientation="horizontal">
          <ReflexElement {...this.resizeProps}>
            <div className="pane-content">Inspector</div>
          </ReflexElement>

          <ReflexSplitter {...this.resizeProps}/>

          <ReflexElement {...this.resizeProps}>
            <div className="pane-content">Asset Library</div>
          </ReflexElement>
        </ReflexContainer>
      )
    }

    render () {
      return (
        <ReflexContainer orientation="horizontal">
          <ReflexElement className="header" flex={0.05}>
            {this.renderHeader()}
          </ReflexElement>
          <ReflexElement {...this.resizeProps}>
            <ReflexContainer orientation="vertical">

              <ReflexElement flex={0.05} {...this.resizeProps}>
                {this.renderLeftSidebar()}
              </ReflexElement>

              <ReflexElement {...this.resizeProps}>
                {this.renderMiddlePanel()}
              </ReflexElement>

              <ReflexSplitter {...this.resizeProps}/>

              <ReflexElement flex={0.2} {...this.resizeProps}>
                {this.renderRightSidebar()}
              </ReflexElement>

            </ReflexContainer>
          </ReflexElement>
        </ReflexContainer>
      )
  }

}

export default Editor
