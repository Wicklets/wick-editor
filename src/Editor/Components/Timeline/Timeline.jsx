import React, { Component } from 'react';
import './_timeline.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'reactstrap';

import DockedTitle from '../Util/DockedTitle/DockedTitle';

class Timeline extends Component {
  render() {
    return(
      <div className="docked-pane timeline">
        <DockedTitle title={"Timeline"}></DockedTitle>
      </div>

    )
  }
}

export default Timeline
