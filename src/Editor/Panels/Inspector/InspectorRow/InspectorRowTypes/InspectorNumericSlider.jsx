import React, { Component } from 'react';

import InspectorRow from '../InspectorRow';

class InspectorNumericSlider extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div className="inspector-row">
        <InspectorRow icon={this.props.icon}
                      input1={
                        {type: "numeric",
                        value: this.props.val,
                        onChange: this.props.onChange}
                      }
                      input2={
                        {type: "slider",
                         value: this.props.val,
                         onChange: this.props.onChange}
                       }
                       divider={this.props.divider}/>
      </div>
    )
  }
}

export default InspectorNumericSlider
