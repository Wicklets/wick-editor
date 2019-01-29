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
import { Input } from 'reactstrap';

var classNames = require('classnames');

class WickInput extends Component {
  render() {
    if (this.props.type==="numeric") {
      return (
        <NumericInput
          style={false}
          className="wick-input"
          precision={2}
          {...this.props}
          ></NumericInput>
      )
    } else if (this.props.type==="text") {

      // Spit out the value of a text box back to the onChange function.
      let wrappedOnChange = (val) => {
        this.props.onChange(val.target.value);
      };

      return (
        <input
          className={classNames("wick-input", {"read-only":this.props.readOnly})}
          {...this.props}
          type="text"
          onChange={this.props.onChange ? wrappedOnChange : null}
        ></input>
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
    } else if (this.props.type === "radio") {
      if(!this.props.name) throw new Error("WickInput radio buttons require a name.");
      return (
        <Input
          type="radio"
          {...this.props}
        />
      );
    } else if (this.props.type === "button") {
      return (
        <div className={"wick-button" + " " + this.props.className} onClick={this.props.onClick}>{this.props.children}</div>
      )
    }
  }
}

export default WickInput
