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

import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_toolbutton.scss';

var classNames = require('classnames');

class ToolButton extends Component {
  renderSelectButton = (name, tooltip) => {
    return (
      <ActionButton
        color="tool"
        isActive={ () => this.props.activeTool === name }
        id={"tool-button-" + name}
        tooltip={tooltip}
        action={ () => this.props.setActiveTool(name) }
        tooltipPlace={this.props.tooltipPlace ? this.props.tooltipPlace : "bottom"}
        icon={name}
        className="tool-button-select"/>
    )
  }

  render () {
    return (
      <div
        className={this.props.className ? this.props.className : ''}>
          <div className="tool-button-select-container">
            {this.renderSelectButton(this.props.name, this.props.tooltip)}
          </div>
      </div>
    );
  }
}

export default ToolButton
