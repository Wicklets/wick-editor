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
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import './_scriptwindowrow.scss';

// https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}


class ScriptWindowRow extends Component {
  getColorBar = () => {
    let scriptsByType = this.props.scriptInfoInterface.scriptsByType;

    let color = 'blue-bar'; 

    Object.keys(scriptsByType).forEach(type => {
        if (scriptsByType[type].indexOf(this.props.name) > -1) {
            color = this.props.scriptInfoInterface.scriptTypeColors[type] + "-bar";
        }
    }); 

    return color;
  }

  render() {
    let scriptName = capitalize(this.props.name);
    return(
      <div className="inspector-script-window-row-container">
        <div className="script-row-item inspector-script-window-row-name">
          <div className={"inspector-script-window-row-color-bar " + this.getColorBar()}/>
          <ActionButton 
                id={"inspector-script-window-row-edit" + this.props.name}
                text={capitalize(this.props.name)}
                tooltip={"Edit " + scriptName}
                tooltipPlace="left"
                action={this.props.editScript}
                color="script-name"
                className="action-button-script-name"
                />
        </div>
        <div className="script-row-item inspector-script-window-row-delete">
            <ActionButton 
                id={"inspector-script-window-row-delete" + this.props.name}
                icon="delete-black"
                tooltip="Delete"
                tooltipPlace="left"
                color="red"
                action={this.props.deleteScript}
                />
        </div>
      </div>
    );
  }
}

export default ScriptWindowRow
