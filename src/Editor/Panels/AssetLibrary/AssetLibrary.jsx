/*
 * Copyright 2018 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from 'Editor/Util/DockedTitle/DockedTitle';
import Asset from './Asset/Asset';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_assetlibrary.scss';

class AssetLibrary extends Component {
  constructor(props) {
    super(props);
    this.makeNode = this.makeNode.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
  }

  handleDelete(uuid) {
    console.log("DEL", uuid);
  }

  handleAdd(uuid) {
    this.props.openFileDialog();
  }

  handleEdit(uuid) {
    console.log("EDIT", uuid);
  }

  makeNode(assetObject, i) {
    return (
      <Asset
       key={i}
       asset={assetObject}
       isSelected={this.props.isObjectSelected(assetObject)}
       onClick={() => {this.props.selectObjects([assetObject])}}/>
    )
  }

  /**
   * Sorts an array of assets by their names.
   * @param  {Wick.Asset[]} assets An array of Wick.Asset objects.
   * @return {Wick.Asset[]}        Returns a sorted array of Wick.Assets.
   */
  sortAssets = (assets) => {
    let copiedAssets = [].concat(assets);

    // Perform alphabetic sort.
    copiedAssets.sort( (a,b) => a.name.localeCompare(b.name) );
    return copiedAssets;
  }

  render() {
    let sortedAssets = this.sortAssets(this.props.assets);
    return(
      <div className="docked-pane asset-library">
        <div className="asset-library-title-container">
          <div className="asset-library-title-text">
            Asset Library
          </div>
          <div className="btn-asset-upload">
            <ActionButton
              color="green"
              action={this.handleAdd}
              id="button-asset-upload"
              tooltip="Upload Assets"
              icon="upload" />
          </div>
        </div>

        <div className="asset-container">
          {sortedAssets.map(this.makeNode)}
        </div>
      </div>
    )
  }
}

export default AssetLibrary
