import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'reactstrap';

import './_toolbutton.scss'

class ToolButton extends Component {
  render() {
    return(
      <Button
        className="tool-button"
        color={this.props.toolIsActive(this.props.name) ? 'primary' : 'secondary'}
        onClick={() => {this.props.activateTool(this.props.name)}}
      >
        {this.props.name}
      </Button>
    )
  }
}

export default ToolButton
