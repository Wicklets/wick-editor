/*
 * Copyright 2028 WICKLETS LLC
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

import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';

import './_addscriptbutton.scss';

var classNames = require('classnames');

// https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

class AddScriptButton extends Component {
  render() {
    return (
      <div 
        className={classNames("add-script-button-container", {"already-used-script" : this.props.used})} 
        onClick={this.props.action}>
        <div 
          className={classNames("add-script-button-title", {"already-used-script" : this.props.used})}
          >
          <ToolIcon className="add-script-icon" name="circle" />
          <div 
            className={classNames("add-script-name", {"already-used-script" : this.props.used})}
            >
            {capitalize(this.props.name)}
          </div>
        </div>
        <div 
          className={classNames("add-script-description", {"already-used-script" : this.props.used})}
          >
          {this.props.description}
        </div>
      </div>
    )
  }
}

// text={scriptObject.name}
// used={scriptObject.used}
// description={scriptObject.description}
// action={() => this.props.addScript(scriptObject.name)} />

export default AddScriptButton
