import React, { Component } from 'react';
import './Inspector.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from '../Util/DockedTitle/DockedTitle';

class Inspector extends Component {
  render() {
    return(
      <div className="inspector">
        <DockedTitle title={"Inspector"}></DockedTitle>
      </div>

    )
  }
}

export default Inspector
