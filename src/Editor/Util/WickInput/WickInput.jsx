/*
 * Copyright 2018 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

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
          {...this.props}/>
      )
    } else if (this.props.type === "checkbox") {
      return (
        <input
          className="wick-checkbox"
          type="checkbox"
          {...this.props}/>
      )
    }
  }
}

export default WickInput
