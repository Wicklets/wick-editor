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

import ToolSettingsPopover from './ToolSettingsPopover/ToolSettingsPopover';

import './_toolbutton.scss';

var classNames = require('classnames');

class ToolButton extends Component {
  constructor(props) {
    super(props);

    this.parentContainerClass="tool-button-container";
    this.settingsContainerClass="tool-button-settings-container";
    this.parentContainerID=this.parentContainerClass + '-' + this.props.name;
    this.settingsContainerID=this.settingsContainerClass + '-' + this.props.name;

    // Connect the onScroll callback to the parent component if it exists.
    if (this.props.onScroll) {
      this.props.onScroll(this.setLeft);
    }
  }

  componentDidMount = () => {
    this.setLeft();
  }

  /**
   * Sets the position of the settings button to the left of the container.
   */
  setLeft = () => {
    let element = document.getElementById(this.parentContainerID);
    if (!element) return

    let rect = element.getBoundingClientRect();
    let childElement = document.getElementById(this.settingsContainerID);
    if (!childElement) return
    childElement.style.left = rect.left + 'px';
  }

  renderSelectButton = (name, tooltip) => {
    return (
      <ActionButton
        color="tool"
        isActive={ () => this.props.getActiveTool() === name }
        id={"tool-button-" + name}
        tooltip={tooltip}
        action={ () => this.props.setActiveTool(name) }
        tooltipPlace="bottom"
        icon={name}
        className="tool-button-select"/>
    )
  }

  renderSettingsButton = (settings) => {
    return (
      <ActionButton
        color="tool-settings"
        id={"tool-settings-" + this.props.name}
        className="tool-button-settings"
        action={() => {
          this.props.setPopover(this.props.name);
          this.props.setActiveTool(this.props.name);
        }}/>
    );
  }

  render () {
    return (
      <div
        id={this.parentContainerID}
        className={classNames(this.parentContainerClass, this.props.className ? this.props.className : '')}>
          <div className="tool-button-select-container">
            {this.renderSelectButton(this.props.name, this.props.tooltip)}
          </div>
          <div
            id={this.settingsContainerID}
            className={this.settingsContainerClass}>
            {this.renderSettingsButton(this.props.settings)}
          </div>
          <ToolSettingsPopover
            isOpen={this.props.popoverOn}
            setPopover={this.props.setPopover}
            toolSettings={this.props.toolSettings}
            setToolSettings={this.props.setToolSettings}
            name={this.props.name} />
      </div>
    );
  }
}

export default ToolButton
