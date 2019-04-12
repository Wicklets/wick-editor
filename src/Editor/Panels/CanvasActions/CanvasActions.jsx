import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton'; 
import './_canvasactions.scss';

class CanvasActions extends Component {
  renderActionButton(action) {
    return (
      <ActionButton
        color="tool"
        id={"canvas-action-button-" + action.icon}
        tooltip={action.tooltip}
        action={action.action}
        tooltipPlace={"bottom"}
        icon={action.icon}
        className="canvas-action-button" />
    );
    }

  renderActions = () => {
    return (
      <div className='actions-container'>
        {this.renderActionButton(this.props.editorActions.sendBackward)}
        {this.renderActionButton(this.props.editorActions.sendToBack)}
        {this.renderActionButton(this.props.editorActions.sendToFront)}
        {this.renderActionButton(this.props.editorActions.sendForward)}
      </div>
    );
  }

  render () {
    return (
      <div className="canvas-actions-widget">
        {!this.props.previewPlaying && this.renderActions()}
      </div>
    );
  }
}

export default CanvasActions
