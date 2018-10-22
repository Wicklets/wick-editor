import React, { Component } from 'react';
import './_inspectortitle.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import iconSettings from 'resources/inspector-icons/selection-icons/settings.png';
import iconCursor from 'resources/tool-icons/cursor.svg';
import iconBrush from 'resources/tool-icons/brush.svg';
import iconUnknown from 'resources/inspector-icons/selection-icons/unknown.svg';

class InspectorTitle extends Component {

  renderIcon(type) {
    if (type === "settings") {
      return (
        <img className="selection-icon" alt="settings icon" src={iconSettings} />
      )
    } else if (type === "cursor") {
      return (
        <img className="selection-icon" alt="cursor icon" src={iconCursor} />
      )
    } else if (type === "brush") {
      return (
        <img className="selection-icon" alt="brush icon" src={iconBrush} />
      )
    }

    // If inspector isn't sure, render an unknown identifier.
    return (
      <img className="selection-icon" alt="unknown icon" src={iconUnknown} />
    )
  }

  renderName(name) {
    return (
      <div className="selection-name">{name}</div>
    )
  }

  render() {
    return(
        <div className="selection-name-container">
          {this.renderIcon(this.props.type)}
          {this.renderName(this.props.title)}
        </div>

    )
  }
}

export default InspectorTitle
