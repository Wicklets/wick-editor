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
      />
    );
  }

  render () {
    return (this.renderAceEditor());
  }

}

export default WickAceEditor;
