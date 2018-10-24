import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './_toolbutton.scss'

class ToolButton extends Component {
  render() {
    return(
      <input
        type="button"
        className={this.props.toolIsActive(this.props.name) ? "tool-button active-tool" : "tool-button"}
        onClick={() => {this.props.activateTool(this.props.name)}}
        value={this.props.name}
        />
    )
  }
}

export default ToolButton
