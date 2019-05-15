/*
 * Copyright 2018 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import { Rnd } from "react-rnd";

import WickTabCodeEditor from './WickTabCodeEditor/WickTabCodeEditor';
import WickCodeDetailsPanel from './WickCodeDetailsPanel/WickCodeDetailsPanel';
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';
import missingImage from 'resources/interface/missing.jpg';

// Import Ace Editor themes.
import 'brace/mode/javascript';
import 'brace/theme/monokai';


import './_popoutcodeditor.scss';

var classNames = require('classnames');

class PopOutCodeEditor extends Component {
  constructor(props) {
    super(props);

    this.editors = [];
  }

  /**
   * Adds a new editor to the list of editors.
   * @param  {AceEditor} editor Ace Editor object which has been created.
   */
  addNewEditor = (editor) => {
    this.editors.push(editor);
  }

  /**
   * Render a div in place of the code editor for a non selectable object.
   * @return {<div>} JSX Div that displays a "no scriptable object selected" error.
   */
  renderNotScriptableInfo = () => {
    return (
      <div className="code-editor-unscriptable-warning">No Scriptable Object Selected</div>
    )
  }

  onDragHandler = (e, d) => {
    this.props.updateCodeEditorWindowProperties({
      x: d.x,
      y: d.y,
    });
  }

  onResizeHandler = (e, dir, ref, delta, position) => {
    this.props.updateCodeEditorWindowProperties({
      width: ref.style.width,
      height: ref.style.height,
    });

    this.editors.forEach(editor => {
      editor.resize();
    });
  }

  onCloseHandler = () => {
    this.props.toggleCodeEditor();
  }

  rerenderCodeEditor = () => {
    this.forceUpdate();
  }

  codeHasErrors = () => {
    return this.props.errors && this.props.errors.length > 0;
  }

  getCodeEditorInfo = () => {
    if (this.codeHasErrors()) {
      let error = this.props.errors[0];
      return "error: on " + error.name + ' | ' + error.message;
    } else {
      return "editing: " + this.props.getSelectionType()
    }
  }

  render() {
    return (
      <Rnd
        id="code-editor-resizeable"
        bounds="window"
        dragHandleClassName="code-editor-drag-handle"
        minWidth={this.props.codeEditorWindowProperties.minWidth}
        minHeight={this.props.codeEditorWindowProperties.minHeight}
        onResizeStop={this.onResizeHandler}
        onDragStop={this.onDragHandler}
        default={{
          x: this.props.codeEditorWindowProperties.x,
          y: this.props.codeEditorWindowProperties.y,
          width: this.props.codeEditorWindowProperties.width,
          height: this.props.codeEditorWindowProperties.height,
        }}
      >
        <img className='code-editor-thumbnail'
             alt='Object Thumbnail'
             src={this.props.imgSource ? this.props.imgSource : missingImage}
        />
        <div
          className="code-editor-drag-handle">
          <div className="code-editor-title">
            {"Code Editor |"}
            <span
              className={classNames("code-editor-information",
                {'code-editor-error-information':this.codeHasErrors()})}>
              {this.getCodeEditorInfo()} </span>
          </div>
          <div className="code-editor-close-button" onClick={this.onCloseHandler}>
            <ToolIcon name="closemodal" />
          </div>
        </div>
        <div className="code-editor-body">
          <WickCodeDetailsPanel />
          <div className="code-editor-code-panel">
            {this.props.selectionIsScriptable() && 
            <WickTabCodeEditor
                addNewEditor={this.addNewEditor}
                script={this.props.script}
                rerenderCodeEditor={this.rerenderCodeEditor}
                errors={this.props.errors}
                onMinorScriptUpdate={this.props.onMinorScriptUpdate}
                onMajorScriptUpdate={this.props.onMajorScriptUpdate}
                scriptInfoInterface={this.props.scriptInfoInterface}
                deleteScript={this.props.deleteScript} 
                scriptToEdit={this.props.scriptToEdit}
                editScript={this.props.editScript}
              /> }
              {!this.props.selectionIsScriptable() && this.renderNotScriptableInfo()}
          </div>
        </div>
      </Rnd>
    );
  }
}

export default PopOutCodeEditor;
