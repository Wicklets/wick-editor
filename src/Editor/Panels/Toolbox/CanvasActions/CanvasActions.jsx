import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import ToolboxBreak from '../ToolboxBreak/ToolboxBreak';
import PopupMenu from 'Editor/Util/PopupMenu/PopupMenu';
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
        {this.renderActionButton(this.props.editorActions.sendToBack)}
        {this.renderActionButton(this.props.editorActions.sendBackward)}
        {this.renderActionButton(this.props.editorActions.sendForward)}
        {this.renderActionButton(this.props.editorActions.sendToFront)}
        <ToolboxBreak className="toolbox-item"/>
        {this.renderActionButton(this.props.editorActions.flipHorizontal)}
        {this.renderActionButton(this.props.editorActions.flipVertical)}
        <ToolboxBreak className="toolbox-item"/>
        {this.renderActionButton(this.props.editorActions.booleanUnite)}
        {this.renderActionButton(this.props.editorActions.booleanSubtract)}
        {this.renderActionButton(this.props.editorActions.booleanIntersect)}
      </div>
    );
  }

  render () {
    return (
      <PopupMenu
        isOpen={this.props.showCanvasActions}
        toggle={this.props.toggleCanvasActions}
        target="more-canvas-actions-popover-button"
        className={"more-canvas-actions-popover"}
      >
        <div className="canvas-actions-widget">
          {!this.props.previewPlaying && this.renderActions()}
        </div>
      </PopupMenu>
    )
  }
}

export default CanvasActions
