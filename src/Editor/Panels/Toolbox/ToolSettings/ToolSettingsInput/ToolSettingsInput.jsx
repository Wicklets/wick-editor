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
import ReactTooltip from 'react-tooltip';

import './_toolsettingsinput.scss';

class ToolSettingsInput extends Component {
  renderIcon = () => {
    let tooltipID = 'settings-input-id-'+this.props.icon;
    return (
      <div
        data-tip
        data-for={tooltipID}
        className='settings-input-icon'>
        <ToolIcon name={this.props.icon} />
        {this.renderTooltip(tooltipID)}
      </div>);
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
        aria-haspopup='true'>
        <span>{this.props.name}</span>
      </ReactTooltip>
    )
  }

  renderNumericInput = () => {
    return (
      <div className="settings-numeric-input-container">
        <WickInput
          type="numeric"
          containerclassname="settings-numeric-wick-input-container"
          className="settings-numeric-input"
          onChange={this.props.onChange}
          value={this.props.value}
          {...this.props.inputRestrictions}/>
        <WickInput
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
