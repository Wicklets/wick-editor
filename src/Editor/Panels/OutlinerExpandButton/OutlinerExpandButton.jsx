import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_outlinerexpandbutton.scss';

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
      iconClassName="outliner-toggle-icon"
      />
    );
  }
}

export default OutlinerExpandButton