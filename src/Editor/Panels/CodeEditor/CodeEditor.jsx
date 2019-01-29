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
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/theme/monokai';

import './_codeeditor.scss';

class CodeEditor extends Component {
  constructor (props) {
    super(props);

    this.renderAceEditor = this.renderAceEditor.bind(this);
    this.renderNotScriptableInfo = this.renderNotScriptableInfo.bind(this);

    this.selectionIsScriptable = this.selectionIsScriptable.bind(this);
    this.getScriptOfSelection = this.getScriptOfSelection.bind(this);
    this.updateScriptOfSelection = this.updateScriptOfSelection.bind(this);
  }

  render() {
    this.refs.reactAceComponent && this.refs.reactAceComponent.editor.resize();
    return (
      <div className="code-editor">
        {this.selectionIsScriptable()
          ? this.renderAceEditor()
          : this.renderNotScriptableInfo()}
      </div>
    );
  }

  renderAceEditor () {
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

  renderNotScriptableInfo () {
    return (
      <div>not scriptable</div>
    )
  }

  selectionIsScriptable () {
    let type = this.props.getSelectionType();
    return type === 'frame'
        || type === 'clip'
        || type === 'button';
  }

  getScriptOfSelection (selection, project) {
    let type = this.props.getSelectionType();
    if(type === 'frame') {
      return this.props.getSelectedFrames()[0].script;
    } else if (type === 'clip'
            || type === 'button') {
      return this.props.getSelectedClips()[0].script;
    }
  }

  updateScriptOfSelection (newScriptSrc) {
    let script = this.getScriptOfSelection();
    script.src = newScriptSrc;
    this.props.updateProjectInState();
  }
}

export default CodeEditor;
