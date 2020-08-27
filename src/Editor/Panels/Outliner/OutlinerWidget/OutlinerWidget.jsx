import React, { Component } from 'react';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import '../_outliner.scss';

var classNames = require('classnames');

class OutlinerLayerButtons extends Component {
  render() {
    return (
      <ActionButton
        color="tool"
        id={this.props.tooltip + "widget"}
        className="widget"
        action={() => {
          //e.stopPropagation();
          this.props.onClick();
        }}
        tooltip={this.props.tooltip}
        tooltipPlace="left"
        buttonClassName="no-bg"
        icon={this.props.icon}
        iconClassName={classNames(this.props.on === undefined || this.props.on ? "widget-on" : "widget-off")}
      />
    );
  }
}

export default OutlinerLayerButtons;