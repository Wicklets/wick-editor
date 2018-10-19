import React, { Component } from 'react';
import './_inspector.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

// component imports
import DockedTitle from '../Util/DockedTitle/DockedTitle';

// icon imports
import iconSettings from '../../../resources/inspector-icons/settings.png';

class Inspector extends Component {
  render() {
    return(
      <div className="inspector">
        <DockedTitle title={"Inspector"}></DockedTitle>
        <div className="selection-name-container">
          <img className="selection-icon" src={iconSettings}></img>
          <div className="selection-name">Inspector</div>
        </div>
      </div>

    )
  }
}

export default Inspector
