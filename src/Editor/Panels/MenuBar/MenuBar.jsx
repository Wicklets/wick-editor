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
import './_menubar.scss';
import MenuBarButton from './MenuBarButton/MenuBarButton';
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';

class MenuBar extends Component {

  constructor(props) {
    super();
    this.openFileRef = React.createRef();
  }

  handleWickFileLoad = (e) => {
    var file = e.target.files[0];
    if (!file) {
      console.warn('handleWickFileLoad: no files recieved');
      return;
    }
    this.props.importProjectAsWickFile(file);
  }

  openProjectFileDialog = () => {
    this.openFileRef.current.click();
  }

  render() {
    return(
      <div className="docked-pane menu-bar">
        <div className="menu-bar-project-name" onClick={() => this.props.openModal('ProjectSettings')}>
          {this.props.projectName}
        </div>
        <div className="menu-bar-actions-container">
          {/* Add hidden file input to retrieve wick files. */}
          <input
            type='file'
            accept='.zip, .wick'
            style={{display: 'none'}}
            ref={this.openFileRef}
            onChange={this.handleWickFileLoad}
          />
          <MenuBarButton
            text="hotkeys"
            action={() => this.props.openModal('KeyboardShortcuts')}
          />
          <MenuBarButton
            text="new"
            action={this.props.openNewProjectConfirmation}
          />
          <MenuBarButton
            text="open"
            action={this.openProjectFileDialog}
          />
          <MenuBarButton
            text="export"
            action={this.props.openExportOptions} />
          <MenuBarButton
            text="save"
            action={this.props.exportProjectAsWickFile}
            color='save'
          />
          <div
            className="project-settings-preview"
            onClick={() => this.props.openModal('ProjectSettings')}>
            <ToolIcon name='gear' />
          </div>
        </div>
      </div>
    )
  }
}

export default MenuBar
