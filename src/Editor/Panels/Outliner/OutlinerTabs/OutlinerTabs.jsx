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
import '../_outliner.scss';

var classNames = require('classnames');

class OutlinerTabs extends Component {

  render() {
    return(
      <div className="outliner-tabs">
        {this.props.tabs.map((timeline, i) => {
          return(<button 
            key={timeline.uuid}
            onClick={() => {this.props.setFocusObject(timeline.parentClip)}}
            className={classNames("outliner-tab", 
            i === this.props.tabs.length - 1 && "current-timeline")}>
          {timeline.parent.identifier ? timeline.parent.identifier : timeline.parent.classname}
          </button>);
        })}
      </div>
    )
  }
}

export default OutlinerTabs






