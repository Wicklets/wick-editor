import React, { Component } from 'react';
import './_assetlibrary.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'reactstrap';

import DockedTitle from '../Util/DockedTitle/DockedTitle';

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
