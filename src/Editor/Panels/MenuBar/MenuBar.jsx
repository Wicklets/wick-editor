import React, { Component } from 'react';
import './_menubar.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Wrapper, Button, Menu, MenuItem } from 'react-aria-menubutton';
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
    const menuItems = items.map((word, i) => {
          return (
            <li className="AriaMenuButton-menuItemWrapper" key={i}>
              <div>
                <MenuItem className='AriaMenuButton-menuItem'>
                  {word}
                </MenuItem>
              </div>
            </li>
          );
        });

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
          <ReactTooltip id="menu-bar-coming-soon" type='error' place='bottom' effect='solid' aria-haspopup='true'>
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
