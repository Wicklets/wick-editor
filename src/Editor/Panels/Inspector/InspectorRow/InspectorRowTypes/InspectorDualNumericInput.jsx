import React, { Component } from 'react';

import InspectorRow from '../InspectorRow';

class InspectorDualNumericInput extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div className="inspector-row">
        <InspectorRow icon={this.props.icon}
                      input1={
                        {type: "numeric",
                        value: this.props.val1,
                        onChange: this.props.onChange1}
                      }
                      input1={
                        {type: "numeric",
                        value: this.props.val2,
                        onChange: this.props.onChange2}
                      }
                      divider={this.props.divider}
                    />
      </div>
    )
  }
}

export default InspectorDualNumericInput
