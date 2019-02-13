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

import { Popover, PopoverBody } from 'reactstrap';

import './_toolbutton.scss';

var classNames = require('classnames');

class ToolButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popoverOpen: false,
      leftPosition: 0,
    }

    this.class="tool-button-container";
    this.containerID=this.class + '-' + this.props.name;


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
    let element = document.getElementById(this.containerID);
    if (!element) return
    let rect = element.getBoundingClientRect();
    this.setState({
      leftPosition: rect.left,
    });
  }

  togglePopover = () => {
    this.setState({
      popoverOpen: !this.state.popoverOpen,
    });
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
        action={this.togglePopover}/>
    );
  }

  render () {
    return (
      <div
        id={this.containerID}
        className={classNames(this.class, this.props.className ? this.props.className : '')}>
          <div className="tool-button-select-container">
            {this.renderSelectButton(this.props.name, this.props.tooltip)}
          </div>
          <div
            className="tool-button-settings-container"
            style={{
              left: this.state.leftPosition,
            }}>
            {this.renderSettingsButton(this.props.settings)}
          </div>
          <Popover
            placement='bottom'
            isOpen={this.state.popoverOpen}
            target={"tool-settings-" + this.props.name}
            toggle={this.togglePopover}
            boundariesElement={'viewport'}>
            <PopoverBody>{this.props.name}</PopoverBody>
          </Popover>
      </div>
    );
  }
}

export default ToolButton
