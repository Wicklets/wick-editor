import React, { Component } from 'react';
import './_wickinput.scss';
import 'rc-slider/assets/index.css'

import NumericInput from 'react-numeric-input';
import Slider from 'rc-slider';
import Select from 'react-select';

class WickInput extends Component {
  render() {
    if (this.props.type==="numeric") {
      return (
        <NumericInput className="wick-input"
          style={false}
          {...this.props.inputProps}
          ></NumericInput>
      )
    } else if (this.props.type==="text") {
      return (
        <input className="wick-input"
               type="text"
               {...this.props.inputProps}></input>
      )
    } else if (this.props.type === "slider") {
      return (
        <Slider className="wick-slider"
                {...this.props.inputProps}></Slider>
      )
    } else if (this.props.type === "select") {
      return (
        <Select className="wick-select"
            {...this.props.inputProps}></Select>
      )
    }
  }
}

export default WickInput
