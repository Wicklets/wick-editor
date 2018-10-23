import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from 'Editor/Util/DockedTitle/DockedTitle';

import './_assetlibrary.scss';

class AssetLibrary extends Component {
  constructor(props) {
    super(props);
    this.state ={
      assets: [
        { name:"a" },
        { name:"b" },
        { name:"c" },
      ]
    }
    this.makeNode = this.makeNode.bind(this);
  }

  makeNode(asset, i) {
    return (
      <div className="asset-node">{asset.name}</div>
    )
  }

  render() {
    return(
      <div className="docked-pane asset-library">
        <DockedTitle title={"Asset Library"}></DockedTitle>
        <div className="asset-container">
          {this.state.assets.map(this.makeNode)}
        </div>
      </div>
    )
  }
}

export default AssetLibrary
