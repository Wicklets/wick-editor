import React, { Component } from 'react';
import './_wickinput.scss';

import NumericInput from 'react-numeric-input';

class WickInput extends Component {
  render() {
    if (this.props.type==="number") {
      return (
        <NumericInput className="wick-input"
                      precision={this.props.precision}
                      step={this.props.step}
                      value={this.props.value}
                      min={this.props.min}
                      max={this.props.max}
                      style={false}></NumericInput>
      )
    } else if (this.props.type==="string") {
      return (
        <input className="wick-input" type="text"></input>
      )
    }
  }
}

export default WickInput
