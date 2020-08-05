import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import '../CanvasTransforms/_canvastransforms.scss';
import './_deletecopypaste.scss';

var classNames = require('classnames');

export default function DeleteCopyPaste (props) {

    return (
      <div className="delete-copy-paste-widget">
        {!props.previewPlaying && 
        <div className='delete-copy-paste-container'>
            <ActionButton
                disabled={props.selectionEmpty}
                color="tool"
                action={props.editorActions.delete.action}
                icon="delete"
                className={classNames("canvas-transform-button", "canvas-transform-item")}
                buttonClassName={"canvas-transform-wick-button"}
                iconClassName={classNames("canvas-transform-icon", props.selectionEmpty && "disabled")}
            />
            <ActionButton
                disabled={props.selectionEmpty}
                color="tool"
                action={props.editorActions.copy.action}
                icon="copy"
                className={classNames("canvas-transform-button", "canvas-transform-item")}
                buttonClassName={"canvas-transform-wick-button"}
                iconClassName={classNames("canvas-transform-icon", props.selectionEmpty && "disabled")}
            />
            <ActionButton
                color="tool"
                action={props.editorActions.paste.action}
                icon="paste"
                className={classNames("canvas-transform-button", "canvas-transform-item")}
                buttonClassName={"canvas-transform-wick-button"}
                iconClassName="canvas-transform-icon"
            />
        </div>}
      </div>
    );
}
