import React, { Component } from 'react';
import './DockedTitle.css';

class DockedTitle extends Component {
  render() {
    return(
      <div className="titleBox">{this.props.title}</div>
    )
  }
}

export default DockedTitle
