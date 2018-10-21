import React, { Component } from 'react';
import './_dockedpanel.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

class DockedPanel extends Component {
  render() {
    return(
      <div className="docked-panel">{this.props.children}</div>
    )
  }
}

export default DockedPanel
