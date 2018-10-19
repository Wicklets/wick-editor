import React, { Component } from 'react';
import './Editor.css';
import './styles/split-pane.css'
import SplitPane from "react-split-pane";

class Editor extends Component {
  render() {
    return (

      <SplitPane split="horizontal" minSize={50} maxSize={50}>
        <div className="pane-menuBar">MenuBar</div>
        <div>
          <SplitPane split="vertical" minSize={50} maxSize={50}>
            <div className="pane-toolBox">ToolBox</div>
            <div>
                <SplitPane split="vertical" minSize={300} maxSize={500} primary="second">
                  <div>
                    <SplitPane split="horizontal" minSize={200} maxSize={350}>
                      <div className="pane-timeline">Timeline</div>
                      <div>
                        <SplitPane split="horizontal" minSize={50} maxSize={400} primary="second">
                          <div className="pane-canvas">Canvas</div>
                          <div className="pane-codeEditor">Code Editor</div>
                        </SplitPane>
                      </div>
                    </SplitPane>
                  </div>
                  <div className="pane-inspector">Inspector</div>
                </SplitPane>
            </div>
          </SplitPane>
        </div>
      </SplitPane>
    );
  }
}

export default Editor

// <div>Pane 1</div>
// <SplitPane split="vertical" minSize={400} maxSize={500} defaultSize="50%">
//   <div>Pane 2</div>
//   <SplitPane split="vertical" >
//     <SplitPane split="horizontal">
//       <div>Pane 4</div>
//       <SplitPane split="horizontal">
//         <div>Pane 5</div>
//       </SplitPane>
//     </SplitPane>
//     <div>Pane 3</div>
//   </SplitPane>
// </SplitPane>
