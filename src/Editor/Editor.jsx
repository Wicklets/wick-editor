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
      if (e.domElement) {
        e.domElement.classList.add('resizing')
      }
    }

    onStopResize (e) {
      if (e.domElement) {
        e.domElement.classList.remove('resizing')
      }
    }

    renderHeader() {
      return (
        <DockedPanel>Menubar</DockedPanel>
      )
    }

    renderLeftSidebar () {
      return (
        <DockedPanel>Toolbox</DockedPanel>
      )
    }

    renderMiddlePanel () {
      return (
        <ReflexContainer orientation="horizontal">
          <ReflexElement flex={0.2} {...this.resizeProps}>
            <DockedPanel>Timeline</DockedPanel>
          </ReflexElement>

          <ReflexSplitter {...this.resizeProps}/>

          <ReflexElement {...this.resizeProps}>
            <DockedPanel>Canvas</DockedPanel>
          </ReflexElement>

          <ReflexSplitter {...this.resizeProps}/>

          <ReflexElement flex={0.2} {...this.resizeProps}>
            <DockedPanel>Code Editor</DockedPanel>
          </ReflexElement>
        </ReflexContainer>
      )
    }

    renderRightSidebar () {
      return (
        <ReflexContainer orientation="horizontal">
          <ReflexElement {...this.resizeProps}>
            <DockedPanel>Inspector</DockedPanel>
          </ReflexElement>

          <ReflexSplitter {...this.resizeProps}/>

          <ReflexElement {...this.resizeProps}>
            <DockedPanel>Asset Library</DockedPanel>
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
          <ReflexElement>
            <ReflexContainer orientation="vertical">

              <ReflexElement flex={0.05} {...this.resizeProps}>
                {this.renderLeftSidebar()}
              </ReflexElement>

              <ReflexElement {...this.resizeProps}>
                {this.renderMiddlePanel()}
              </ReflexElement>

              <ReflexSplitter{...this.resizeProps}/>

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
