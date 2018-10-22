import React, { Component } from 'react';
import './_inspector.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from 'Editor/Util/DockedTitle/DockedTitle';
import InspectorTitle from './InspectorTitle/InspectorTitle';
import InspectorRow from './InspectorRow/InspectorRow';

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
        <div className="inspector-content">
          <div class="inspector-row">
            <InspectorRow icon="brushsize"
                            input1={{type: "numeric",}}/>
          </div>
          <div class="inspector-row">
            <InspectorRow icon="brushsmoothness"
                            input1={{type: "numeric",}}/>
          </div>
          <div class="inspector-row">
            <InspectorRow icon="fillcolor"
                            input1={{type: "numeric",}}
                            input2={{type: "numeric",}}/>
          </div>
        </div>
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
