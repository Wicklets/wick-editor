import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from 'Editor/Util/DockedTitle/DockedTitle';

import './_assetlibrary.scss';

class AssetLibrary extends Component {
  render() {
    return(
      <div className="docked-pane asset-library">
        <DockedTitle title={"Asset Library"}></DockedTitle>
      </div>
    )
  }
}

export default AssetLibrary
