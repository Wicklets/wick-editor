import React, { Component } from 'react';
import './_menubar.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

class MenuBar extends Component {
  render() {
    return(
      <div className="docked-pane menu-bar">
        <div className="menu-bar-overlay">

        </div>
        {/*<Button onClick={() => {this.props.openModal('ProjectSettings')}}>Project Settings</Button>*/}
      </div>
    )
  }
}

export default MenuBar
