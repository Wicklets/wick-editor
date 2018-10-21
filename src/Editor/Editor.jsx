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
      if (e.domElement) {
        e.domElement.classList.add('resizing')
      }
    }

    onStopResize (e) {
      if (e.domElement) {
        e.domElement.classList.remove('resizing')
      }
    }

    render () {
      return (
        <ReflexContainer orientation="horizontal">

          <ReflexElement className="header" flex={0.05}>
            <div className="pane-content">Header (Fixed)</div>
          </ReflexElement>

          <ReflexElement>
            <ReflexContainer orientation="vertical">
              <ReflexElement flex={0.05} {...this.resizeProps}>
                <div className="pane-content">Sidebar (Fixed)</div>
              </ReflexElement>
              <ReflexElement {...this.resizeProps}>
                <ReflexContainer orientation="horizontal">
                  <ReflexElement flex={0.2} {...this.resizeProps}>
                    <div className="pane-content">Center Pane Top</div>
                  </ReflexElement>

                  <ReflexSplitter {...this.resizeProps}/>

                  <ReflexElement {...this.resizeProps}>
                    <div className="pane-content">Center Pane Middle</div>
                  </ReflexElement>

                  <ReflexSplitter {...this.resizeProps}/>

                  <ReflexElement flex={0.2} {...this.resizeProps}>
                    <div className="pane-content">Center Pane Bottom</div>
                  </ReflexElement>
                </ReflexContainer>
              </ReflexElement>

              <ReflexSplitter{...this.resizeProps}/>

              <ReflexElement flex={0.2} {...this.resizeProps}>
                <ReflexContainer orientation="horizontal">
                  <ReflexElement {...this.resizeProps}>
                    <div className="pane-content">Right Pane Top</div>
                  </ReflexElement>

                  <ReflexSplitter {...this.resizeProps}/>

                  <ReflexElement {...this.resizeProps}>
                    <div className="pane-content">Right Pane Bottom</div>
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
