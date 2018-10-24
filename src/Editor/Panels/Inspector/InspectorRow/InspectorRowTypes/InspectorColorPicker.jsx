import React, { Component } from 'react';

import InspectorRow from '../InspectorRow';

class InspectorColorPicker extends Component {
  render() {
    return(
      <div className="inspector-row">
        <InspectorRow icon={this.props.icon}
                      input1={
                        {type: "color",
                        color: this.props.val,
                        onChangeComplete: this.props.onChange,
                        id: this.props.id}
                      }
                    />
      </div>
    )
  }
}

export default InspectorColorPicker
