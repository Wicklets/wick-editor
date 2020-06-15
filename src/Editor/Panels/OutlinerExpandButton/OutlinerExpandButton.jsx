import React, { Component } from 'react';

import './_outlinerexpandbutton.scss';

class OutlinerExpandButton extends Component {
  render () {
    return (
      <button className="outliner-expand-button"
      onClick={this.props.toggleOutliner}>
      randus
      </button>
    );
  }
}

export default OutlinerExpandButton
