import React, { Component } from 'react';
import './_inspector.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from 'Editor/Util/DockedTitle/DockedTitle';
import WickInput from 'Editor/Util/WickInput/WickInput';
import InspectorTitle from './InspectorTitle/InspectorTitle';

class Inspector extends Component {
  render() {
    return(
      <div className="docked-pane inspector">
        <DockedTitle title={"Inspector"}></DockedTitle>
        <InspectorTitle type={"settings"}/>
        <WickInput type="number"></WickInput>
        <WickInput type="string"></WickInput>
      </div>
    )
  }
}

export default Inspector
