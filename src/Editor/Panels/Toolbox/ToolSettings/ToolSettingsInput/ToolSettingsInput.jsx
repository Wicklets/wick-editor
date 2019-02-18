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

import WickInput from 'Editor/Util/WickInput/WickInput';
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';

import './_toolsettingsinput.scss';

class ToolSettingsInput extends Component {
  renderIcon = () => {
    return (
      <div className='settings-input-icon'>
        <ToolIcon name={this.props.icon} />
      </div>);
  }

  renderNumericInput = () => {
    return (
      <div className="settings-numeric-input-container">
        <WickInput
          tooltip={this.props.name}
          id={'settings-numeric-wick-input-container-' + this.props.icon}
          type="numeric"
          containerclassname="settings-numeric-wick-input-container"
          className="settings-numeric-input"
          onChange={this.props.onChange}
          value={this.props.value}
          {...this.props.inputRestrictions}/>
        <WickInput
          tooltip={this.props.name}
          id={'settings-slider-wick-input-container-' + this.props.icon}
          type="slider"
          containerclassname="settings-slider-wick-input-container"
          className="settings-numeric-slider"
          onChange={this.props.onChange}
          value={this.props.value}
          {...this.props.inputRestrictions} />
      </div>
    )
  }

  renderCheckboxInput = () => {
    return (
      <WickInput
        tooltip={this.props.name}
        id={'settings-checkbox-wick-input-container-' + this.props.icon}
        type="checkbox"
        containerclassname="settings-checkbox-wick-input-container"
        className="settings-checkbox-input"
        onChange={this.props.onChange}
        defaultChecked={this.props.value}
        />
    );
  }

  renderDropdownInput = () => {
    return (
      <WickInput
        tooltip={this.props.name}
        id={'settings-dropdown-wick-input-container-' + this.props.icon}
        type="dropdown"
        className="settings-dropdown-input"
        onChange={this.props.onChange}
        value={this.props.value}
        />
    );
  }

  renderInput = () => {
    if (this.props.type === "numeric") {
      return this.renderNumericInput();
    } else if (this.props.type === "checkbox") {
      return this.renderCheckboxInput();
    } else if (this.props.type === "dropdown") {
      return this.renderDropdownInput();
    } else {
      console.error("No valid 'type' prop provided.");
      return
    }
  }

  render () {
    return (
      <div className="setting-input-container">
        {this.renderIcon()}
        {this.renderInput()}
      </div>
    );
  }
}

export default ToolSettingsInput
