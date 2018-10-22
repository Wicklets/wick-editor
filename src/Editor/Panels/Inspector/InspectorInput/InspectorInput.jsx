import React, { Component } from 'react';
import './_inspectorinput.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

// import WickInput from 'Editor/Util/WickInput/WickInput';
import InspectorInputIcon from './InspectorInputIcon/InspectorInputIcon';

class InspectorInput extends Component {
  render() {
    return(
      <div>
        <InspectorInputIcon />
      </div>
    )
  }
}

export default InspectorInput
