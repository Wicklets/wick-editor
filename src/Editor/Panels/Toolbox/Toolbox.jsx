import React, { Component } from 'react';
import './_toolbox.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import ColorPicker from 'Editor/Util/ColorPicker/ColorPicker';

class Toolbox extends Component {
  render() {
    return(
      <div className="docked-pane tool-box">
        <div>tools go here ...</div>
        <div>tools go here ...</div>
        <div>tools go here ...</div>
        <div>tools go here ...</div>
        <ColorPicker
          disableAlpha={true}
          placement={'right'}
          color={'#ffffff'}
          onColorChange={(color) => {
            console.log(color);
          }}
        />
      </div>
    )
  }
}

export default Toolbox
