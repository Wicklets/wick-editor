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

class ToolButton extends Component {
  constructor (props) {
    super(props);

    this.actionDefault = this.props.setActiveTool ?  () => this.props.setActiveTool(this.props.name) : null;
  }
  renderSelectButton = () => {
    return (
      <ActionButton
        color="tool"
        isActive={ () => this.props.getActiveTool().name === this.props.name }
        id={"tool-button-" + this.props.name}
        tooltip={this.props.tooltip}
        action={this.props.action ? this.props.action : this.actionDefault}
        tooltipPlace={this.props.tooltipPlace ? this.props.tooltipPlace : "bottom"}
        icon={this.props.name}
        className="tool-button-select"
        iconClassName="tool-button-icon"
        />
    )
  }

  render () {
    return (
      <div
        className={this.props.className ? this.props.className : ''}>
          <div className="tool-button-select-container">
            {this.renderSelectButton()}
          </div>
      </div>
    );
  }
}

export default ToolButton
