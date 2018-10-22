import React, { Component } from 'react';
import './_inspectorinputicon.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import iconBrushSize from "resources/inspector-icons/property-icons/brushsize.svg";

class InspectorInputIcon extends Component {
  render() {
    return(
      <img className="inspector-input-icon" src={iconBrushSize} />
    )
  }
}

export default InspectorInputIcon
