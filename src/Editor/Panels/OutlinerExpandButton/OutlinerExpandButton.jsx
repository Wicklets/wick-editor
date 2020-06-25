import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_outlinerexpandbutton.scss';

var classNames = require("classnames");

class OutlinerExpandButton extends Component {
  render () {
    
    return (
      <ActionButton
      color="tool"
      isActive={ () => false }
      id="outliner-toggle"
      tooltip={this.props.expanded ? "Hide Outliner" : "Show Outliner"}
      action={this.props.toggleOutliner}
      tooltipPlace="left"
      icon="outliner"
      className="outliner-expand-button"
      iconClassName={classNames("outliner-toggle-icon", {"outliner-expand-button-closed": !this.props.expanded})}
      />
    );
  }
}

export default OutlinerExpandButton