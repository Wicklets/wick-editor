import React, { Component } from 'react';

import SelectionPreview from './SelectionPreview/SelectionPreview';

import './_wickcodedetailspanel.scss';
import '../_popoutcodeditor.scss';

class WickCodeDetailsPanel extends Component {
  render () {
    return (
      <div className='code-editor-details-panel'>
        <div className='code-editor-thumbnail-preview'>
          <SelectionPreview />
        </div>
        <div className='code-editor-reference'>
          Reference
        </div>
      </div>
    );
  }
}

export default WickCodeDetailsPanel;
