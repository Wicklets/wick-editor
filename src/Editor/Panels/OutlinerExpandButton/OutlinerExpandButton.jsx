import React, { Component } from 'react';

import './_outlinerexpandbutton.scss';

import minusIcon from 'resources/interface/minus.svg';
import plusIcon from 'resources/interface/plus.svg';

class OutlinerExpandButton extends Component {
  render () {
    const image = this.props.expanded ? minusIcon : plusIcon;
    return (
      <button className="outliner-expand-button"
      onClick={this.props.toggleOutliner}>
        <img src={image}
        alt="expand"/>
      </button>
    );
  }
}

export default OutlinerExpandButton
