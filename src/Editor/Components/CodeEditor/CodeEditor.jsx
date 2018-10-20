import React, { Component } from 'react';
import './_codeeditor.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from '../Util/DockedTitle/DockedTitle';

class CodeEditor extends Component {
  render() {
    return(
      <div className="docked-pane code-editor">
        <DockedTitle title={"Code Editor"}></DockedTitle>
      </div>

    )
  }
}

export default CodeEditor
