import React, { Component } from 'react';
import './_menubar.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from '../Util/DockedTitle/DockedTitle';

class MenuBar extends Component {
  render() {
    return(
      <div className="docked-pane menu-bar">
        <DockedTitle title={"Menu Bar"}></DockedTitle>
      </div>

    )
  }
}

export default MenuBar
