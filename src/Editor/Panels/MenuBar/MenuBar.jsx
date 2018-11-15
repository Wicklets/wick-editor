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
import 'bootstrap/dist/css/bootstrap.min.css';
import { Wrapper, Button, Menu } from 'react-aria-menubutton';
import ReactTooltip from 'react-tooltip'

import iconSettings from 'resources/inspector-icons/selection-icons/settings.png';

const fileItems = ['New Project', 'Open Project', 'Save Project', 'Export', 'Project Settings'];
const editItems = ['Undo', 'Redo', 'Cut', 'Copy', 'Paste', 'Delete'];
const importItems = ['Image', 'Sound'];
const helpItems = ['Hotkeys', 'Examples', 'Tutorials', 'Forums', 'Browser Info'];
const aboutItems = ['Source Code', 'Credits'];
const runItems = [];

class MenuBar extends Component {
  renderButton(menuName, items) {
    return (
      <Wrapper data-tip data-for="menu-bar-coming-soon"
        className="AriaMenuButton"
        onSelection={(e,v) => console.log("HANDLE")}
      >
        <Button className="AriaMenuButton-trigger">
          {menuName}
        </Button>
        <Menu className="AriaMenuButton-menu">
          <ul className="menu-items"></ul>
        </Menu>
      </Wrapper>
    );
  }

  render() {
    return(
      <div className="docked-pane menu-bar">
        <div className="menu-bar-overlay">
          <ReactTooltip id="menu-bar-coming-soon" type='error' place='right' effect='solid' aria-haspopup='true'>
            <span>Coming Soon!</span>
          </ReactTooltip>
          {this.renderButton("File", fileItems)}
          {this.renderButton("Edit", editItems)}
          {this.renderButton("Import", importItems)}
          {this.renderButton("Help", helpItems)}
          {this.renderButton("About", aboutItems)}
          {this.renderButton("Run", runItems)}
        </div>
        <div className="project-settings-preview" onClick={() => this.props.openModal('ProjectSettings')}>
          {this.props.projectName}
          <img className="project-settings-image" src={iconSettings} alt="settings icon" />
        </div>
      </div>
    )
  }
}

export default MenuBar
