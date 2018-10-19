import React, { Component } from 'react';
import './Editor.css';
import SplitPane from "react-split-pane";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'reactstrap';

class Editor extends Component {
  render() {
    return (
      <SplitPane split="vertical" minSize={50}>
        <div></div>
        <SplitPane split="horizontal">
            <div><Button color="danger">Danger!</Button></div>
            <div></div>
        </SplitPane>
      </SplitPane>
    )
  }
}

export default Editor
