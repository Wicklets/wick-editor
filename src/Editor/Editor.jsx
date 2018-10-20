import React, { Component } from 'react';
import './styles/_editor.scss';
import './styles/_splitpane.scss'
import SplitPane from "react-split-pane";
import 'bootstrap/dist/css/bootstrap.min.css';

import Canvas from './Components/Canvas/Canvas';
import Inspector from './Components/Inspector/Inspector';
import MenuBar from './Components/MenuBar/MenuBar';
import Timeline from './Components/Timeline/Timeline';
import Toolbox from './Components/Toolbox/Toolbox';
import AssetLibrary from './Components/AssetLibrary/AssetLibrary';
import CodeEditor from './Components/CodeEditor/CodeEditor';

class Editor extends Component {
  render() {
    return (
      {/* Menu Bar */},
      <SplitPane allowResize={false} split="horizontal" minSize={50} maxSize={50}>
        <div className="pane pane-menuBar"><MenuBar /></div>
        <div>
          {/* Toolbox */}
          <SplitPane allowResize={false} split="vertical" minSize={50} maxSize={100}>
            <div className="pane pane-toolBox"><Toolbox /></div>
            <div>
               {/* Inspector */}
                <SplitPane split="vertical" minSize={300} maxSize={500} primary="second">
                  <div>
                    {/* Timeline */}
                    <SplitPane split="horizontal" minSize={200} maxSize={350}>
                      <div className="pane pane-timeline"><Timeline /></div>
                      <div>
                        {/* Code Editor */}
                        <SplitPane defaultSize="70%" split="horizontal" minSize={50} maxSize="75%">
                          {/* Canvas */}
                          <div className="pane pane-canvas"><Canvas /></div>
                          <div className="pane pane-codeEditor"><CodeEditor /></div>
                        </SplitPane>
                      </div>
                    </SplitPane>
                  </div>
                  <div>
                    {/* Asset Library */}
                    <SplitPane split="horizontal" defaultSize={200} minSize={50} maxSize={400} primary="second">
                      {/* Inpsector */}
                      <div className="pane pane-inspector"><Inspector /></div>
                      <div className="pane pane-assetLibrary"><AssetLibrary /></div>
                    </SplitPane>
                  </div>
                </SplitPane>
            </div>
          </SplitPane>
        </div>
      </SplitPane>
    );
  }
}

export default Editor
