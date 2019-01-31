import React, { Component } from 'react';

import './_selectionpreview.scss';

import missingImage from 'resources/interface/missing.jpg';

class SelectionPreview extends Component {

  render () {
    return (
      <img
      className="code-editor-selection-preview"
      src={this.props.imgSource ? this.props.imgSource : missingImage} />
    );
  }

}

export default SelectionPreview;
