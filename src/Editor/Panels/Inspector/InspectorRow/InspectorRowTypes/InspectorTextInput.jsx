import React, { Component } from 'react';

import InspectorRow from '../InspectorRow';

class InspectorTextInput extends Component {
  render() {
    return(
      <div className="inspector-row">
        <InspectorRow icon={this.props.icon}
                      input1={
                        {type: "text",
                        value: this.props.val,
                        onChange: this.props.onChange}
                      }
                    />
      </div>
    )
  }
}

export default InspectorTextInput
