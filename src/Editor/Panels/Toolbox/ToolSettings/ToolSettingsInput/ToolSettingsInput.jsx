/*
 * Copyright 2020 WICKLETS LLC
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
import SettingsNumericSlider from './SettingsNumericSlider/SettingsNumericSlider';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_toolsettingsinput.scss';

class ToolSettingsInput extends Component {
  renderNumericInput = () => {
    return (
      <SettingsNumericSlider
        onChange={this.props.onChange}
        value={this.props.value}
        inputRestrictions={this.props.inputRestrictions}
        name={this.props.name}
        icon={this.props.icon} />
    );
  }

  renderCheckboxInput = () => {
    return (
      <div className="settings-checkbox-input">
        <ActionButton
          icon={this.props.icon}
          isActive={() => this.props.value}
          color='checkbox'
          id={"settings-input-id-" + this.props.name}
          tooltip={this.props.name}
          action={() => this.props.onChange(!this.props.value)}
          />
      </div>
    );
  }

  renderDropdownInput = () => {
    return (
      <WickInput
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
        {this.renderInput()}
      </div>
    );
  }
}

export default ToolSettingsInput
