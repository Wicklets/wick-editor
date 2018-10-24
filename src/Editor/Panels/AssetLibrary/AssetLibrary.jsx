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
import { Button } from 'reactstrap';
import ReactTooltip from 'react-tooltip'

import './_assetlibrary.scss';

// import iconAdd from 'resources/asset-library-icons/add.svg';
// import iconEdit from 'resources/asset-library-icons/edit.png';
// import iconDelete from 'resources/asset-library-icons/delete.svg';

class AssetLibrary extends Component {
  constructor(props) {
    super(props);
    this.state ={
      assets: [
        // { name:"a1", uuid:"1"},
        // { name:"b2", uuid:"2"},
        // { name:"c3", uuid:"3"},
        // { name:"a4", uuid:"4"},
        // { name:"b5", uuid:"5"},
        // { name:"c6", uuid:"6"},
      ]
    }
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

  makeNode(asset, i) {
    return (
      <div key={i} className="asset-node">
        <div className="assetName">{asset.name}</div>
        <div className="btn-container">
          <Button className="btn-asset-action" onClick={() => this.handleDelete(asset.uuid)}>DEL</Button>
          <Button className="btn-asset-action" onClick={() => this.handleAdd(asset.uuid)}>ADD</Button>
          <Button className="btn-asset-action" onClick={() => this.handleEdit(asset.uuid)}>EDIT</Button>
        </div>
      </div>
    )
  }

  render() {
    return(
      <div data-tip data-for='asset-library-coming-soon' className="docked-pane asset-library">
        <DockedTitle title={"Asset Library"}></DockedTitle>
        <ReactTooltip id="asset-library-coming-soon" type='error' place='top' effect='solid' aria-haspopup='true'>
          <span>Coming Soon!</span>
        </ReactTooltip>
        <div className="asset-container">
          {this.state.assets.map(this.makeNode)}
        </div>
      </div>
    )
  }
}

export default AssetLibrary
