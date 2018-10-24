import React, { Component } from 'react';
import './_menubar.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Wrapper, Menu, MenuItem } from 'react-aria-menubutton';

class MenuBar extends Component {

  renderButton() {
    const menuItemWords = ['foo', 'bar', 'baz'];
        const menuItems = menuItemWords.map((word, i) => {
          return (
            <li key={i}>
              <MenuItem className='MyMenuButton-menuItem'>
                {word}
              </MenuItem>
            </li>
          );
        });

        return (
          <Wrapper
            className='MyMenuButton'
            onSelection={(e,v) => console.log("Ey")}
          >
            <Button className='MyMenuButton-button'>
              click me
            </Button>
            <Menu className='MyMenuButton-menu'>
              <ul>{menuItems}</ul>
            </Menu>
          </Wrapper>
        );
      }

  render() {
    return(
      <div className="docked-pane menu-bar">
        {this.renderButton()}
        {/*<Button onClick={() => {this.props.openModal('ProjectSettings')}}>Project Settings</Button>*/}
      </div>
    )
  }
}

export default MenuBar
