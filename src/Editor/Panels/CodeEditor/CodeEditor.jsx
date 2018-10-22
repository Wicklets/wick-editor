import React, { Component } from 'react';
import { render } from 'react-dom';
import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/theme/monokai';

import './_codeeditor.scss';

class CodeEditor extends Component {
  render() {
    return (
      <div className="code-editor">
        <AceEditor
          mode="javascript"
          theme="monokai"
          name="ace-editor"
          fontSize={14}
        />
      </div>
    );
  }
}

export default CodeEditor;
