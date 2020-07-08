import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import '../CanvasTransforms/_canvastransforms.scss';
import './_deletecopypaste.scss';

var classNames = require('classnames');

class CanvasTransforms extends Component {
  render () {
    return (
      <div className="delete-copy-paste-widget">
        {!this.props.previewPlaying && 
        <div className='delete-copy-paste-container'>
            <ActionButton
                disabled={this.props.selectionEmpty}
                color="tool"
                action={this.props.editorActions.delete.action}
                icon="delete"
                className={classNames("canvas-transform-button", "canvas-transform-item")}
                buttonClassName={"canvas-transform-wick-button"}
                iconClassName={classNames("canvas-transform-icon", this.props.selectionEmpty && "disabled")}
            />
            <ActionButton
                disabled={this.props.selectionEmpty}
                color="tool"
                action={this.props.editorActions.copy.action}
                icon="copy"
                className={classNames("canvas-transform-button", "canvas-transform-item")}
                buttonClassName={"canvas-transform-wick-button"}
                iconClassName={classNames("canvas-transform-icon", this.props.selectionEmpty && "disabled")}
            />
            <ActionButton
                color="tool"
                action={this.props.editorActions.paste.action}
                icon="paste"
                className={classNames("canvas-transform-button", "canvas-transform-item")}
                buttonClassName={"canvas-transform-wick-button"}
                iconClassName="canvas-transform-icon"
            />
        </div>}
      </div>
    );
  }
}

export default CanvasTransforms
