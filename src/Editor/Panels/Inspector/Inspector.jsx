import React, { Component } from 'react';
import './_inspector.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from 'Editor/Util/DockedTitle/DockedTitle';

import iconSettings from '../../../resources/inspector-icons/settings.png';

class Inspector extends Component {
  render() {
    return(
      <div className="docked-pane inspector">
        <DockedTitle title={"Inspector"}></DockedTitle>
        <div className="selection-name-container">
          <img className="selection-icon" alt="" src={iconSettings}></img>
          <div className="selection-name">Inspector</div>
        </div>
      </div>

    )
  }
}

export default Inspector
