/*
 * Copyright 2028 WICKLETS LLC
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

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import ColorPicker from 'Editor/Util/ColorPicker/ColorPicker';
import ReactTooltip from 'react-tooltip'
import TimedChangeInput from './TimedChangeInput/TimedChangeInput';
import NumericTimedChangeInput from './NumericTimedChangeInput/NumericTimedChangeInput';

import { Input } from 'reactstrap';

var classNames = require('classnames');

/**
 * Creates an input to be used in the Wick Editor
 * prop {string} className The classname to apply to the input element
 *
 * prop {string} containerclassname The classname to apply to the container
 * element of the input.
 *
 * prop {string} tooltip The tooltip text to display on the container of the
 * element. No tooltip is shown if this is not provided.
 *
 * props {string} tooltipID A unique id which is required to properly display
 * the tooltip.
 *
 * prop {string} tooltipPlace 'top', 'bottom', 'left', 'right'. Defaults to 'bottom'.
 *
 * All remaining props will be applied directly to the input element.
 * @extends Component
 */
class WickInput extends Component {
  render() {
    let tooltipID = this.props.tooltipID === undefined ? 'action-button-tooltip-nyi' : this.props.tooltipID;

    return (
      <div
        data-tip
        data-for={tooltipID}
        id={tooltipID}
        className={classNames("wick-input-container", this.props.containerclassname)}>
        { (this.props.tooltip !== undefined) && this.renderTooltip(tooltipID) }
        { this.renderContent() }
      </div>
    )
  }

  renderTooltip = (tooltipID) => {
    // Detect if on mobile to disable tooltips.
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    return (
      <ReactTooltip
        disable={isMobile}
        id={tooltipID}
        type='info'
        place={this.props.tooltipPlace === undefined ? 'bottom' : this.props.tooltipPlace}
        effect='solid'
        aria-haspopup='true'
        className="wick-tooltip">
        <span>{this.props.tooltip}</span>
      </ReactTooltip>
    )
  }

  renderContent = () => {
    if (this.props.type==="numeric") {
      return ( this.renderNumeric() );
    } else if (this.props.type==="text") {
      return ( this.renderText() );
    } else if (this.props.type === "slider") {
      return ( this.renderSlider() );
    } else if (this.props.type === "select") {
      return ( this.renderSelect() );
    } else if (this.props.type === "color") {
      return ( this.renderColor());
    } else if (this.props.type === "checkbox") {
      return ( this.renderCheckbox() );
    } else if (this.props.type === "radio") {
      return ( this.renderRadio() );
    } else if (this.props.type === "button") {
      return ( this.renderButton() );
    } else {
      return ( this.renderButton() ); // default to a button.
    }
  }

  renderNumeric = () => {
    return (
      <NumericTimedChangeInput
        {...this.props}
        className={classNames("wick-numeric-input", this.props.className)}
        ></NumericTimedChangeInput>
    )
  }

  renderText = () => {
    return (
      <TimedChangeInput
         className={classNames("wick-input", {"read-only":this.props.readOnly})}
         {...this.props}
          value={this.props.value ? this.props.value : ''}
          onChange={this.props.onChange} />
    );
  }

  renderSlider = () => {
    // Spit out the value of a text box back to the onChange function.
    let wrappedOnChange = (val) => {
      this.props.onChange(parseFloat(val.target.value));
    };
    return (
      <input
        {...this.props}
        className={classNames("wick-slider", this.props.className)}
        type='range'
        onChange={this.props.onChange ? wrappedOnChange : null}
        />
    );
  }

  renderColor = () => {
    let wrappedOnChange = (color) => {
      let newColor = color;

      // TODO: Check if we can just use HEX here.
      if (color.rgb) {
        let rgb = color.rgb;
        let str = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + rgb.a + ")";
        newColor = str;
      }

      this.props.updateLastColors && this.props.updateLastColors(newColor);
      this.props.onChange && this.props.onChange(newColor);
    };

    return (
      <ColorPicker
        className={classNames("wick-color-picker", this.props.className)}
        {...this.props}
        onChangeComplete={this.props.onChange ? wrappedOnChange : null}
        />
    );
  }

  renderSelect = () => {
    return (
      <Dropdown
        {...this.props}
        className={classNames("wick-select", this.props.className)}
        controlClassName="wick-select-control"
        placeholderClassName={classNames("wick-select-placeholder", this.props.placeholderClassName)}
        arrowClassName="wick-select-arrow"
        menuClassName="wick-select-menu"
      />
    );
  }

  renderCheckbox = () => {
    return (
      <input
        {...this.props}
        type="checkbox"
        className={classNames("wick-checkbox", this.props.className)}/>
    );
  }

  renderCheckboxInput = () => {
    return (
      <WickInput
        type="checkbox"
        containerclassname="settings-checkbox-wick-input-container"
        className="settings-checkbox-input"
        onChange={this.props.onChange}
        defaultChecked={this.props.value}
        />
    );
  }


  renderRadio = () => {
    if(!this.props.name) throw new Error("WickInput radio buttons require a name.");
    return (
      <Input
        type="radio"
        {...this.props}
        className={classNames("wick-radio", this.props.className)}
      />
    );
  }

  renderButton = () => {
    return (
      <div
        onClick={this.props.onClick}
        className={classNames("wick-button ", this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}

export default WickInput
