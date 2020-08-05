/*
 * Copyright 2020 WICKLETS LLC
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
import { DragSource } from 'react-dnd';
import './_asset.scss';
import DragDropTypes from 'Editor/DragDropTypes.js';
import ToolIcon from 'Editor/Util/ToolIcon/ToolIcon';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

var classNames = require('classnames');

const assetSource = {
  beginDrag(props, monitor, component) {
    // Return the data describing the dragged item
    let info = {
      uuid : props.asset.uuid,
    }

    return info;
  },
}

/**
 * Specifies which props to inject into your component.
 */
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
  }
}

class Asset extends Component {
  getIcon(classname) {
    if (classname === "ImageAsset") {
      return "image";
    } else if (classname === "SoundAsset") {
      return "sound";
    } else if (classname === "ClipAsset") {
      return "clip";
    } else if (classname === "ButtonAsset") {
      return "button";
    } else if (classname === "FontAsset") {
      return "font"
    } else if (classname === "SVGAsset") {
      return "svg"
    }  else {
      return "asset";
    }
  }

  addToCanvas = () => {
    let draggedItem = this.props.asset;
    if(draggedItem.files && draggedItem.files.length > 0) {
      // Dropped a file from native filesystem
      if(draggedItem.files[0].name.endsWith('.wick')) {
        // Wick Project (.wick file)
        var file = draggedItem.files[0];
        this.props.importProjectAsWickFile(file);
      } else {
        // Assets (images, sounds, etc)
        this.props.createAssets(draggedItem.files, []);
      }
    } else {
      // Dropped an asset from the asset library
      this.props.createImageFromAsset(draggedItem.uuid, 0, 0, true);
    }
  }

  render() {
    // These props are injected by React DnD, as defined by the `collect` function above:
    const { connectDragSource } = this.props;

    let icon = this.getIcon(this.props.asset.classname);

    return connectDragSource (
      <div 
      className={classNames("asset-item", {"asset-selected": this.props.isSelected})}>
      <button 
        className="select"
        onClick={this.props.onClick}
        >
        <div className="asset-name-text">
          <span><ToolIcon className="asset-icon" name={icon}/></span>
          <span>{this.props.asset.name}</span>
        </div>
      </button>
      {this.props.isSelected &&
      <div className="asset-buttons-container">
        {this.props.asset.classname === "SoundAsset" &&
        <span className="asset-button add"><ActionButton classsName="add" color="green" text="Add to Frame" action={() => this.props.addSoundToActiveFrame(this.props.asset)}/></span>
        }
        {this.props.asset.classname !== "SoundAsset" &&
        <span className="asset-button add"><ActionButton classsName="add" color="green" text="Add to Canvas" action={this.addToCanvas}/></span>
        }
        <span className="asset-button delete"><ActionButton classsName="delete" color="red" icon="delete" 
        action={() => {
          this.props.clearSelection();
          this.props.selectObjects([this.props.asset]);
          this.props.deleteSelectedObjects();
        }}/></span>
      </div>}
      </div>
    )
  }
}

export default DragSource(DragDropTypes.GET_ASSET_TYPE, assetSource, collect)(Asset)
