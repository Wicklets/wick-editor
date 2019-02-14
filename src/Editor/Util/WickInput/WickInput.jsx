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

import NumericInput from 'react-numeric-input';
import Select from 'react-select';
import ColorPicker from 'Editor/Util/ColorPicker/ColorPicker';
import { Input } from 'reactstrap';

var classNames = require('classnames');

class WickInput extends Component {

  renderNumeric = () => {
    // TODO: Replace this custom rolled zero removal with a tested solution.
    let format = (num) => {
      let split = num.split('.')
      let body = split[0];
      let trail = split[1];

      if(trail.length === 2) {
        if (trail.charAt(1) === '0') {
          trail = trail.charAt(0);
        }
      }

      if (trail.length === 1) {
        if (trail.charAt(0) === '0') {
          trail = '';
        }
      }

      let separator = '';
      if (trail.length > 0) {
        separator = '.'
      }

      return body + separator + trail;
    }
    return (
      <NumericInput
        style={false}
        precision={2}
        format={format}
        {...this.props}
        className={classNames("wick-numeric-input", this.props.className ? this.props.className : '')}
        ></NumericInput>
    )
  }

  render() {
    if (this.props.type==="numeric") {
      return (
        this.renderNumeric()
      );
    } else if (this.props.type==="text") {

      // Spit out the value of a text box back to the onChange function.
      let wrappedOnChange = (val) => {
        this.props.onChange(val.target.value);
      };

      return (
        <input
          className={classNames("wick-input", {"read-only":this.props.readOnly})}
          {...this.props}
          value={this.props.value ? this.props.value : ''}
          type="text"
          onChange={this.props.onChange ? wrappedOnChange : null}
        ></input>
      )
    } else if (this.props.type === "slider") {
      // Spit out the value of a text box back to the onChange function.
      let wrappedOnChange = (val) => {
        this.props.onChange(val.target.value);
      };
      return (
        <input
          {...this.props}
          className={classNames("wick-slider", this.props.className ? this.props.className : '')}
          type='range'
          onChange={this.props.onChange ? wrappedOnChange : null}
          />
      )
    } else if (this.props.type === "select") {
      return (
        <Select className="wick-select"
            {...this.props}></Select>
      )
    } else if (this.props.type === "color") {
      return (
        <ColorPicker
          className="wick-color-picker"
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
        <div className={"wick-button " + this.props.className} onClick={this.props.onClick}>{this.props.children}</div>
      )
    }
  }
}

export default WickInput
