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

  render() {
    // These props are injected by React DnD, as defined by the `collect` function above:
    const { connectDragSource } = this.props;

    let icon = this.getIcon(this.props.asset.classname);

    return connectDragSource (
      <button className={classNames("asset-item", {"asset-selected": this.props.isSelected})} onClick={this.props.onClick}>
        <div className="asset-icon">
          <ToolIcon name={icon} />
        </div>
        <span className="asset-name-text">{this.props.asset.name}</span>
      </button>

    )
    // <div className="asset-controls">
    //   <ActionButton
    //   color="green"
    //   text="Add"
    //   />
    //   <ActionButton
    //   color="red"
    //   text="Delete"
    //   />
    // </div>
  }
}

export default DragSource(DragDropTypes.GET_ASSET_TYPE, assetSource, collect)(Asset)
