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

import iconSettings from 'resources/inspector-icons/selection-icons/settings.png';

class MenuBar extends Component {
  render() {
    return(
      <div className="docked-pane menu-bar">
        <MenuBarButton
          text="Save"
          action={this.props.exportProjectAsWickFile}></MenuBarButton>
        <MenuBarButton
          text="Open"
          action={() => {console.log("OPEN")}}></MenuBarButton>
        <div className="project-settings-preview" onClick={() => this.props.openModal('ProjectSettings')}>
          {this.props.projectName}
          <img className="project-settings-image" src={iconSettings} alt="settings icon" />
        </div>
      </div>
    )
  }
}

export default MenuBar
