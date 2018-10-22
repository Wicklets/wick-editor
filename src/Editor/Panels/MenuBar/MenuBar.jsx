import React, { Component } from 'react';
import './_menubar.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'reactstrap';

class MenuBar extends Component {
  render() {
    return(
      <div className="docked-pane menu-bar">
        <Button onClick={() => {this.props.openModal('ProjectSettings')}}>Project Settings</Button>
      </div>
    )
  }
}

export default MenuBar
