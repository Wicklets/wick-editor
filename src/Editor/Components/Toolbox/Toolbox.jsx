import React, { Component } from 'react';
import './_toolbox.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from '../Util/DockedTitle/DockedTitle';

class Toolbox extends Component {
  render() {
    return(
      <div className="docked-pane tool-box">
        <DockedTitle title={"Toolbox"}></DockedTitle>
      </div>

    )
  }
}

export default Toolbox
