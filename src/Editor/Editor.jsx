import React, { Component } from 'react';
import './Editor.css';
import './styles/split-pane.css'
import SplitPane from "react-split-pane";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'reactstrap';

import Inspector from './Components/Inspector/Inspector';

class Editor extends Component {
  render() {
    return (
      {/* Menu Bar */},
      <SplitPane allowResize={false} split="horizontal" minSize={50} maxSize={50}>
        <div className="pane-menuBar">MenuBar</div>
        <div>
          {/* Toolbox */}
          <SplitPane allowResize={false} split="vertical" minSize={50} maxSize={100}>
            <div className="pane-toolBox">ToolBox</div>
            <div>
               {/* Inspector */}
                <SplitPane split="vertical" minSize={300} maxSize={500} primary="second">
                  <div>
                    {/* Timeline */}
                    <SplitPane split="horizontal" minSize={200} maxSize={350}>
                      <div className="pane-timeline">Timeline</div>
                      <div>
                        {/* Code Editor */}
                        <SplitPane split="horizontal" minSize={50} maxSize={400} primary="second">
                          {/* Canvas */}
                          <div className="pane-canvas">Canvas</div>
                          <div className="pane-codeEditor">Code Editor</div>
                        </SplitPane>
                      </div>
                    </SplitPane>
                  </div>
                  <div>
                    {/* Asset Library */}
                    <SplitPane split="horizontal" minSize={300} maxSize={500} primary="second">
                      {/* Inpsector */}
                      <div className="pane-inspector"><Inspector /></div>
                      <div className="pane-assetLibrary">Asset Library</div>
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
