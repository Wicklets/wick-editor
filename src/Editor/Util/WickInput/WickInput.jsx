import React, { Component } from 'react';
import './_wickinput.scss';
import 'rc-slider/assets/index.css'

import NumericInput from 'react-numeric-input';
import Slider from 'rc-slider';
import Select from 'react-select';
import ColorPicker from 'Editor/Util/ColorPicker/ColorPicker';

class WickInput extends Component {
  render() {
    if (this.props.type==="numeric") {
      return (
        //eslint-disable-next-line
        <NumericInput style={false}
          className="wick-input"
          {...this.props}
          ></NumericInput>
      )
    } else if (this.props.type==="text") {
      return (
        <input className="wick-input"
               type="text"
               {...this.props}></input>
      )
    } else if (this.props.type === "slider") {
      return (
        <Slider className="wick-slider"
                {...this.props}></Slider>
      )
    } else if (this.props.type === "select") {
      return (
        <Select className="wick-select"
            {...this.props}></Select>
      )
    } else if (this.props.type === "color") {
      return (
        <ColorPicker className="wick-color-picker"
            {...this.props}></ColorPicker>
      )
    }
  }
}

export default WickInput
