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
    console.log("ADD", uuid);
  }

  handleEdit(uuid) {
    console.log("EDIT", uuid);
  }

  makeNode(assetObject, i) {
    let asset = <Asset key={i} asset={assetObject} />;
    return asset;
  }

  render() {
    return(
      <div className="docked-pane asset-library">
        <DockedTitle title={"Asset Library"}></DockedTitle>
        <div className="asset-container">
          {this.props.assets.map(this.makeNode)}
        </div>
      </div>
    )
  }
}

export default AssetLibrary
