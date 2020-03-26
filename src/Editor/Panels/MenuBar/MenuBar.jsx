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
import './_menubar.scss';
import MenuBarButton from './MenuBarButton/MenuBarButton';
import MenuBarIconButton from './MenuBarIconButton/MenuBarIconButton';

class MenuBar extends Component {

  constructor(props) {
    super();
  }

  render() {
    return(
      <div className="docked-pane menu-bar">
        <MenuBarIconButton
          id="tool-information-button"
          tooltip="Editor Information"
          action={() => this.props.openModal('EditorInfo')}
          icon="mascotmark"
          />
        <div className="menu-bar-project-name" onClick={() => this.props.openModal('ProjectSettings')}>
          {this.props.projectName}
        </div>
        <div className="menu-bar-actions-container">

          <MenuBarButton
            text="new"
            action={this.props.openNewProjectConfirmation}
          />

          <MenuBarButton
            text="open"
            action={this.props.openProjectFileDialog}
          />

          <MenuBarButton
            text="export"
            action={() => {this.props.exporting ? this.props.openExportMedia() : this.props.openExportOptions()}}
          />

          <MenuBarButton
            text="save"
            action={this.props.exportProjectAsWickFile}
            color='save'
          />
          
          <MenuBarIconButton
            icon="gear"
            action={() => this.props.openModal('SettingsModal')}
            tooltip="Editor Settings"
            id="editor-settings-button" />
        </div>
      </div>
    )
  }
}

export default MenuBar
