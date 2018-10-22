import React, { Component } from 'react';
import './_inspector.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from 'Editor/Util/DockedTitle/DockedTitle';
import WickInput from 'Editor/Util/WickInput/WickInput';
import InspectorTitle from './InspectorTitle/InspectorTitle';

class Inspector extends Component {
  constructor () {
    super();
    this.state = {
      type: "cursor",
    }

    this.renderDisplay = this.renderDisplay.bind(this);
    this.renderCursor = this.renderCursor.bind(this);
  }

  renderCursor() {
    return(
      <div>
        <InspectorTitle type={"cursor"} title={"Cursor"}/>
        <WickInput type="number"></WickInput>
        <WickInput type="string"></WickInput>
      </div>
    )
  }

  renderDisplay() {
    if (this.state.type === "cursor") {
      return(this.renderCursor());
    }
  }

  render() {
    return(
      <div className="docked-pane inspector">
        <DockedTitle title={"Inspector"}></DockedTitle>
        <div className="inspector-content">
          {this.renderDisplay()}
        </div>
      </div>
    )
  }
}

export default Inspector
