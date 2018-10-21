import React, { Component } from 'react';
import './_codeeditor.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from 'Editor/Util/DockedTitle/DockedTitle';

class CodeEditor extends Component {
  render() {
    return(
      <div className="code-editor">
        <DockedTitle title={"Code Editor"}></DockedTitle>

      </div>

    )
  }
}

export default CodeEditor
