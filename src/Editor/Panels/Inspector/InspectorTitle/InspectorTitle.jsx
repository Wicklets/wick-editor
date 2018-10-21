import React, { Component } from 'react';
import './_inspectortitle.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import iconSettings from 'resources/inspector-icons/settings.png';

class InspectorTitle extends Component {
  render() {
    return(
        <div className="selection-name-container">
          <img className="selection-icon" alt="" src={iconSettings}></img>
          <div className="selection-name">Inspector</div>
        </div>

    )
  }
}

export default InspectorTitle
