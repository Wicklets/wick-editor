import React, { Component } from 'react';
import './_dockedtitle.scss';

class DockedTitle extends Component {
  render() {
    return(
      <div className="title-box">{this.props.title}</div>
    )
  }
}

export default DockedTitle
