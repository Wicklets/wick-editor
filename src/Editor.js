import React, { Component } from 'react';
import './Editor.css';

class Editor extends Component {
  render() {
    return (
      <SplitPane split="vertical" minSize={50} defaultSize={100}>
        <div></div>
        <div></div>
      </SplitPane>
    )
  }
}

export default Editor
