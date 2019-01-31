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

    this.state = {
      width: 400,
      height: 300,
      x: window.innerWidth/2 - 150,
      y: window.innerHeight/2 - 150,
    }

  }

  renderAceEditor = () => {
    return (
      <AceEditor
        mode="javascript"
        theme="monokai"
        name="ace-editor"
        fontSize={14}
        ref="reactAceComponent"
        onChange={(e) => {this.updateScriptOfSelection(e)}}
        editorProps={{$blockScrolling: true}}
        value={this.getScriptOfSelection().src}
      />
    );
  }

  renderNotScriptableInfo = () => {
    return (
      <div>not scriptable</div>
    )
  }

  selectionIsScriptable = () => {
    let type = this.props.getSelectionType();
    return type === 'frame'
        || type === 'clip'
        || type === 'button';
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
    this.setState( {
      x: d.x,
      y: d.y,
    })
  }

  onResizeHandler = (e, dir, ref, delta, position) => {
    this.setState( {
      width: ref.style.width,
      height: ref.style.height,
    })
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
        minWidth={300}
        minHeight={250}
        onResize={this.onResizeHandler}
        onDrag={this.onDragHandler}
        default={{
          x: this.state.x,
          y: this.state.y,
          width: this.state.width,
          height: this.state.height,
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
          {this.selectionIsScriptable()
            ? this.renderAceEditor()
            : this.renderNotScriptableInfo()}
        </div>
      </Rnd>
    );
  }
}

export default PopOutCodeEditor;
