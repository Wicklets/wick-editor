import React, { Component } from 'react';
import './Editor.css';
import SplitPane from "react-split-pane";

class Editor extends Component {
  render() {
    return (
      <SplitPane split="vertical" minSize={50}>
        <div></div>
        <SplitPane split="horizontal">
            <div></div>
            <div></div>
        </SplitPane>
      </SplitPane>
    )
  }
}

export default Editor
