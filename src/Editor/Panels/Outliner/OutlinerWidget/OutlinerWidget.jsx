import React, { Component } from 'react';

import '../_outliner.scss';

var classNames = require('classnames');

class OutlinerLayerButtons extends Component {
  render() {
    return (
      <button 
      className="widget"
      onClick={(e) => {
        e.stopPropagation();
        this.props.onClick();
      }}>
      <img 
        className={classNames(this.props.on === undefined || this.props.on ? "widget-on" : "widget-off")}
        alt={this.props.alt}
        src={this.props.src}
        
      />
      </button>
    );
  }
}

export default OutlinerLayerButtons;