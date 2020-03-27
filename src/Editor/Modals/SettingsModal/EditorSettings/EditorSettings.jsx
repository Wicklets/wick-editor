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

import './_editorsettings.scss';
import WickInput from 'Editor/Util/WickInput/WickInput';

var classNames = require('classnames'); 

class EditorSettings extends Component {
  constructor () {
    super();
   
    this.state = {

    }
  }

  render () {
    return (
      <div className="editor-settings-modal-body">
        <div className="editor-settings-group">
          <div className="editor-settings-group-title">Onion Skinning Colors</div>

          <div className="editor-settings-color-containers-row">
            <div className="editor-settings-color-container">
              B: 

              <WickInput
              type="color"
              id="editor-settings-backward-color-picker"
              disableAlpha={true}
              placement={'bottom'}
              color={this.props.getToolSetting('backwardOnionSkinTint').rgba}
              onChange={(color) => {this.props.setToolSetting('backwardOnionSkinTint', new window.Wick.Color(color))}}
              colorPickerType={this.props.colorPickerType}
              changeColorPickerType={this.props.changeColorPickerType}
              updateLastColors={this.props.updateLastColors}
              lastColorsUsed={this.props.lastColorsUsed} />
            </div>

            <div className="editor-settings-color-container">
              F:

              <WickInput
              type="color"
              id="editor-settings-forward-color-picker"
              disableAlpha={true}
              placement={'bottom'}
              color={this.props.getToolSetting('forwardOnionSkinTint').rgba}
              onChange={(color) => {this.props.setToolSetting('forwardOnionSkinTint', new window.Wick.Color(color))}}
              colorPickerType={this.props.colorPickerType}
              changeColorPickerType={this.props.changeColorPickerType}
              updateLastColors={this.props.updateLastColors}
              lastColorsUsed={this.props.lastColorsUsed} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default EditorSettings
