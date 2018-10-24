import React, { Component } from 'react';

import InspectorRow from '../InspectorRow';

class InspectorSelector extends Component {
  render() {
    return(
      <div className="inspector-row">
        <InspectorRow icon={this.props.icon}
                      input1={
                        {type: "select",
                        defaultValue: this.props.value,
                        onChange: this.props.onChange,
                        options: this.props.options,
                        className: this.props.className}
                      }
                    />
      </div>
    )
  }
}

export default InspectorSelector
