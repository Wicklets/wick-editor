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
import './_inspectortitle.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import iconSettings from 'resources/inspector-icons/selection-icons/settings.png';
import iconCursor from 'resources/tool-icons/cursor.svg';
import iconBrush from 'resources/tool-icons/brush.svg';
import iconUnknown from 'resources/inspector-icons/selection-icons/unknown.svg';

class InspectorTitle extends Component {

  renderIcon(type) {
    if (type === "settings") {
      return (
        <img className="selection-icon" alt="settings icon" src={iconSettings} />
      )
    } else if (type === "cursor") {
      return (
        <img className="selection-icon" alt="cursor icon" src={iconCursor} />
      )
    } else if (type === "brush") {
      return (
        <img className="selection-icon" alt="brush icon" src={iconBrush} />
      )
    }

    // If inspector isn't sure, render an unknown identifier.
    return (
      <img className="selection-icon" alt="unknown icon" src={iconUnknown} />
    )
  }

  renderName(name) {
    return (
      <div className="selection-name">{name}</div>
    )
  }

  render() {
    return(
        <div className="selection-name-container">
          {this.renderIcon(this.props.type)}
          {this.renderName(this.props.title + " Options")}
        </div>

    )
  }
}

export default InspectorTitle
