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

  onLoad = (e) => {
    this.props.addNewEditor(e);
  }

  mapErrorsToAnnotations = (errors) => {
    let annotations = [];

    errors.forEach(error => {
      let a = {};
      a.row = error.lineNumber;
      a.text = error.message;
      annotations.push(a);
    }); 

    return annotations;
  }
  /**
   * Render an ace editor.
   */
  renderAceEditor = () => {
    return (
      <AceEditor
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
        annotations={this.mapErrorsToAnnotations(this.props.errors)}
      />
    );
  }

  render () {
    return (this.renderAceEditor());
  }

}

export default WickAceEditor;
