import React, { Component } from 'react';
import './_inspectorrow.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import WickInput from 'Editor/Util/WickInput/WickInput';
import InspectorInputIcon from './InspectorInputIcon/InspectorInputIcon';

// Quick documentation...
// input1: object: input information, all props pased to child
// input2: object: input information, all props pased to child
// icon: image reference
// divider: boolean: show x or don't show x, default to show x.

class InspectorInput extends Component {
  renderSingleComponent() {
    return (
      <div className="inspector-row">
        {/* Icon */}
        <div className="input-icon">
          <InspectorInputIcon className="input-icon" type={this.props.icon}/>
        </div>
        {/* Input */}
        <div  className="single-input-element inspector-input-element">
          <WickInput {...this.props.input1}/>
        </div>

      </div>
    )
  }

  renderDoubleComponent() {
    let divider = (this.props.divider || this.props.divider === undefined) ? "x" : "";

    return (
      <div className="inspector-row">
        {/* Icon */}
        <div className="input-icon">
          <InspectorInputIcon type={this.props.icon}/>
        </div>
        {/* Double Input*/}
        <div className="double-input">
          {/* Left Element */}
          <div className="double-input-element inspector-input-element">
            <WickInput  {...this.props.input1}/>
          </div>
          {/* Divider */}
          <div className="input-divider inspector-input-element">{divider}</div>
          {/* Right Element */}
          <div className="double-input-element inspector-input-element">
            <WickInput {...this.props.input2}/>
          </div>
        </div>
      </div>
    )
  }

  render() {
    if (this.props.input2 === undefined) {
      return(this.renderSingleComponent());
    } else {
      return(this.renderDoubleComponent());
    }
  }
}

export default InspectorInput
