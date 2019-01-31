import React, { Component } from 'react';
import AceEditor from 'react-ace';

// Import Ace Editor themes.
import 'brace/mode/javascript';
import 'brace/theme/monokai';

import './_wickaceeditor.scss';

// Import default tab style
class WickAceEditor extends Component {

  onLoad = (e) => {
    console.log("Loaded Editor");
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
        name="ace-editor"
        fontSize={14}
        width="100%"
        height="100%"
        onChange={(e) => {this.updateScriptOfSelection(e)}}
        value={this.getScriptOfSelection().src}
      />
    );
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

  render () {
    console.log("Rendering Ace");
    return (this.renderAceEditor());
  }

}

export default WickAceEditor;
