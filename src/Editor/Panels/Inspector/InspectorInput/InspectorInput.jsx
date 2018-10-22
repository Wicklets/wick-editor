import React, { Component } from 'react';
import './_inspectorinput.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import WickInput from 'Editor/Util/WickInput/WickInput';
import InspectorInputIcon from './InspectorInputIcon/InspectorInputIcon';

class InspectorInput extends Component {
  renderSingleComponent() {
    return (
      <div className="inspector-input single">
        <InspectorInputIcon type={this.props.icon}/>
        <WickInput {...this.props.input1}/>
      </div>
    )
  }

  render() {
    if (this.props.input2 === undefined) {
      return(this.renderSingleComponent());
    }
  }
}

export default InspectorInput
