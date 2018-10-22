import React, { Component } from 'react';
import './_inspectortitle.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import iconSettings from 'resources/inspector-icons/selection-icons/settings.png';
import iconUnknown from 'resources/inspector-icons/selection-icons/unknown.svg';

class InspectorTitle extends Component {

  renderIcon(type) {
    if (type === "settings") {
      return (
        <img className="selection-icon"
          alt="settings icon"
          src={iconSettings}>
        </img>
      )
    } else {
      return (
        <img className="selection-icon"
          alt="unknown icon"
          let src={iconUnknown}>
        </img>
      )
    }
  }

  renderName(type) {
    return (
      <div className="selection-name">{type}</div>
    )
  }

  render() {
    return(
        <div className="selection-name-container">
          {this.renderIcon(this.props.type)}
          {this.renderName(this.props.type)}
        </div>

    )
  }
}

export default InspectorTitle
