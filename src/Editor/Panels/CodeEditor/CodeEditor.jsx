import React, { Component } from 'react';
import AceEditor from 'react-ace';
import ReactTooltip from 'react-tooltip'

import 'brace/mode/javascript';
import 'brace/theme/monokai';

import './_codeeditor.scss';

class CodeEditor extends Component {
  render() {
    return (
      <div data-tip data-for="code-editor-coming-soon" className="code-editor">
        <ReactTooltip id="code-editor-coming-soon" type='error' place='top' effect='solid' aria-haspopup='true'>
          <span>Coming Soon!</span>
        </ReactTooltip>
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
