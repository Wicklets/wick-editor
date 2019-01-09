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
import ReactTooltip from 'react-tooltip'
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';

import './_actionbutton.scss';

var classNames = require('classnames');

class ActionButton extends Component {
  render() {
    let colorClass = this.props.color === undefined ? "action-button-blue" : "action-button-"+this.props.color;
    let btnID = this.props.id === undefined ? 'action-button-tooltip-nyi' : this.props.id;
    let isActive = this.props.isActive === undefined ? () => false : this.props.isActive;

    let finalClassName = classNames(colorClass, {'active-button' : isActive()})

    return (
      <div data-tip data-for={btnID} className="action-button">
        { (this.props.tooltip !== undefined) && (
        <ReactTooltip
          id={btnID}
          type='info'
          place={this.props.tooltipPlace === undefined ? 'top' : this.props.tooltipPlace}
          effect='solid'
          aria-haspopup='true'>
          <span>{this.props.tooltip}</span>
        </ReactTooltip> )
      }
        <WickInput
          className={finalClassName}
          type="button"
          onClick={this.props.action}>
          <ToolIcon name={this.props.icon} />
        </WickInput>
      </div>
    )
  }
}

export default ActionButton
