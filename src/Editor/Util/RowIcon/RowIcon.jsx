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
import ReactTooltip from 'react-tooltip'
import './_rowicon.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';

class RowIcon extends Component {
  render() {
    let iconID = this.props.id === undefined ? 'row-icon-tooltip-NYI' : "row-icon-" + this.props.id;

    return(
      <div data-tip data-for={iconID} className="row-icon">
        { (this.props.tooltip !== undefined) && (
            <ReactTooltip
              id={iconID}
              type='info'
              place={this.props.tooltipPlace === undefined ? 'left' : this.props.tooltipPlace}
              effect='solid'
              aria-haspopup='true'>
              <span>{this.props.tooltip}</span>
            </ReactTooltip>
          )
        }
        <ToolIcon name={this.props.type} />
      </div>
    )
  }
}


export default RowIcon
