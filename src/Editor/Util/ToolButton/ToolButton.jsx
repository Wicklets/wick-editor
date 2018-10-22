import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'reactstrap';

class ToolButton extends Component {
  render() {
    return(
      <Button
        color={this.props.toolIsActive(this.props.name) ? 'primary' : 'secondary'}
        onClick={() => {this.props.activateTool(this.props.name)}}
      >
        {this.props.name}
      </Button>
    )
  }
}

export default ToolButton
