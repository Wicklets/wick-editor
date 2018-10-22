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
      type: "brush",
    }
  }

  renderCursor() {
    return (
      <InspectorTitle type={"cursor"} title={"Cursor"}/>
    )
  }

  renderBrush() {
    return (
      <div>
        <InspectorTitle type={"brush"} title={"Brush"} />
      </div>
    )
  }

  renderDisplay() {
    if (this.state.type === "cursor") {
      return(this.renderCursor());
    } else if (this.state.type === "brush") {
      return(this.renderBrush());
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
