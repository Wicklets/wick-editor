import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import ToolboxBreak from '../ToolboxBreak/ToolboxBreak';
import PopupMenu from 'Editor/Util/PopupMenu/PopupMenu';
import './_canvasactions.scss';

var classNames = require("classnames");

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
      <div className={classNames('actions-container', this.props.renderSize === "small" && "vertical")}>
        {this.renderActionButton(this.props.editorActions.sendToBack)}
        {this.renderActionButton(this.props.editorActions.sendBackward)}
        {this.renderActionButton(this.props.editorActions.sendForward)}
        {this.renderActionButton(this.props.editorActions.sendToFront)}
        <ToolboxBreak vertical={this.props.renderSize === "small"}/>
        {this.renderActionButton(this.props.editorActions.flipHorizontal)}
        {this.renderActionButton(this.props.editorActions.flipVertical)}
        <ToolboxBreak vertical={this.props.renderSize === "small"}/>
        {this.renderActionButton(this.props.editorActions.booleanUnite)}
        {this.renderActionButton(this.props.editorActions.booleanSubtract)}
        {this.renderActionButton(this.props.editorActions.booleanIntersect)}
      </div>
    );
  }

  render () {
    return (
      <PopupMenu
        mobile={this.props.renderSize === "small"}
        isOpen={this.props.showCanvasActions}
        toggle={this.props.toggleCanvasActions}
        target="more-canvas-actions-popover-button"
        className={"more-canvas-actions-popover"}
      >
        <div className={classNames("canvas-actions-widget", this.props.renderSize === "small" && "vertical")}>
          {!this.props.previewPlaying && this.renderActions()}
        </div>
      </PopupMenu>
    )
  }
}

export default CanvasActions
