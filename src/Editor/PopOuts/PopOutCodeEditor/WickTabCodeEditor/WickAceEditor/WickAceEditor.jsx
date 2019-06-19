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

// Import Ace Editor themes.
import 'brace/mode/javascript';
import 'brace/theme/monokai';

import './_wickaceeditor.scss';

// Import default tab style
class WickAceEditor extends Component {

  onLoad = (editor) => {
    editor.commands.addCommand({
        name: "toggleCodeEditorWindow",
        bindKey: {win: "`", mac: "`"},
        exec: (editor) => {
            this.props.toggleCodeEditor();
        }
    })

    this.props.addNewEditor(editor);
  }

  mapErrorsToMarkers = (errors) => {
    let markers = [];

    errors.forEach(error => {
      let marker = {};
      marker.startRow = error.lineNumber-1;
      marker.endRow = error.lineNumber-1;
      marker.startCol = 0;
      marker.endCol = 1000; // Set length to an arbitrary amount that should encompass the whole line.
      marker.className = 'error-marker';
      marker.type = 'background';
      markers.push(marker);
    });
    return markers;
  }
  /**
   * Render an ace editor.
   */
  renderAceEditor = () => {
    return (
      <AceEditor
        onCursorChange={this.props.onCursorChange}
        focus={this.props.focus}
        onLoad={this.onLoad}
        mode="javascript"
        theme="monokai"
        name={this.props.name + "-ace-editor"}
        fontSize={14}
        width="100%"
        height="100%"
        onChange={(e) => {this.props.onUpdate(e)}}
        editorProps={{$blockScrolling: true}}
        value={this.props.script}
        markers={this.mapErrorsToMarkers(this.props.errors)}
      />
    );
  }

  render () {
    return (this.renderAceEditor());
  }

}

export default WickAceEditor;
