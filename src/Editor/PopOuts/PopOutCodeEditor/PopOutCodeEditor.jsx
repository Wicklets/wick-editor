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
import AceEditor from 'react-ace';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';

// Import Ace Editor themes.
import 'brace/mode/javascript';
import 'brace/theme/monokai';


import './_popoutcodeditor.scss';

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
   * Render an ace editor.
   */
  renderAceEditor = () => {
    return (
      <AceEditor
        onLoad={this.addNewEditor}
        mode="javascript"
        theme="monokai"
        name="ace-editor"
        fontSize={14}
        width="100%"
        height="100%"
        onChange={(e) => {this.updateScriptOfSelection(e)}}
        value={this.getScriptOfSelection().src}
      />
    );
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

  getScriptOfSelection = (selection, project) => {
    let type = this.props.getSelectionType();
    if(type === 'frame') {
      return this.props.getSelectedFrames()[0].script;
    } else if (type === 'clip'
            || type === 'button') {
      return this.props.getSelectedClips()[0].script;
    }
  }

  updateScriptOfSelection = (newScriptSrc) => {
    let script = this.getScriptOfSelection();
    script.src = newScriptSrc;
    this.props.updateProjectInState();
  }

  onDragHandler = (e, d) => {
    this.props.updateCodeEditorProperties({
      x: d.x,
      y: d.y,
    });
  }

  onResizeHandler = (e, dir, ref, delta, position) => {
    this.props.updateCodeEditorProperties({
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

  render() {
    return (
      <Rnd
        id="code-editor-resizeable"
        bounds="window"
        dragHandleClassName="code-editor-drag-handle"
        minWidth={this.props.codeEditorProperties.minWidth}
        minHeight={this.props.codeEditorProperties.minHeight}
        onResize={this.onResizeHandler}
        onDrag={this.onDragHandler}
        default={{
          x: this.props.codeEditorProperties.x,
          y: this.props.codeEditorProperties.y,
          width: this.props.codeEditorProperties.width,
          height: this.props.codeEditorProperties.height,
        }}
      >
        <div
          className="code-editor-drag-handle">
          <div className="code-editor-title">
            {"Code Editor |"}
            <span className="code-editor-selection-type"> {"editing: " + this.props.getSelectionType()} </span>
          </div>
          <div className="code-editor-close-button">
            <ActionButton
              icon="close"
              action={this.onCloseHandler}
              color="red"/>
          </div>
        </div>
        <div className="code-editor-body">
          <div className="code-editor-details-panel">
          </div>
          <div className="code-editor-code-panel">
            {this.props.selectionIsScriptable()
              ? this.renderAceEditor()
              : this.renderNotScriptableInfo()}
          </div>
        </div>
      </Rnd>
    );
  }
}

export default PopOutCodeEditor;
