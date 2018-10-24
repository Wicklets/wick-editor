import React, { Component } from 'react';
import './_menubar.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Wrapper, Button, Menu, MenuItem } from 'react-aria-menubutton';

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
              <MenuItem className='AriaMenuButton-menuItem'>
                {word}
              </MenuItem>
            </li>
          );
        });

        return (
          <Wrapper
            className="AriaMenuButton"
            onSelection={(e,v) => console.log("HANDLE")}
          >
            <Button className="AriaMenuButton-trigger">
              {menuName}
            </Button>
            <Menu className="AriaMenuButton-menu">
              <ul className="menu-items">{menuItems}</ul>
            </Menu>
          </Wrapper>
        );
      }

  render() {
    return(
      <div className="docked-pane menu-bar">
        <div className="menu-bar-overlay">
          {this.renderButton("File", fileItems)}
          {this.renderButton("Edit", editItems)}
          {this.renderButton("Import", importItems)}
          {this.renderButton("Help", helpItems)}
          {this.renderButton("About", aboutItems)}
          {this.renderButton("Run", runItems)}
        </div>
        {/*<Button onClick={() => {this.props.openModal('ProjectSettings')}}>Project Settings</Button>*/}
      </div>
    )
  }
}

export default MenuBar
