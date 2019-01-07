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
import './_toolbutton.scss'

import iconBrush from 'resources/tool-icons/brush.svg';
import iconCursor from 'resources/tool-icons/cursor.svg';
import iconEllipse from 'resources/tool-icons/ellipse.svg';
import iconRectangle from 'resources/tool-icons/rect.svg';
import iconLine from 'resources/tool-icons/line.svg';
import iconPencil from 'resources/tool-icons/pencil.svg';
import iconEyeDropper from 'resources/tool-icons/eyedropper.svg';
import iconEraser from 'resources/tool-icons/eraser.svg';
import iconPan from 'resources/tool-icons/pan.svg';
import iconZoom from 'resources/tool-icons/zoom.svg';
import iconFillBucket from 'resources/tool-icons/bucket.svg';

class ToolIcon extends Component {
  constructor(props) {
    super(props);

    this.icons = {
      "brush":iconBrush,
      "cursor":iconCursor,
      "ellipse":iconEllipse,
      "rectangle":iconRectangle,
      "line":iconLine,
      "pencil":iconPencil,
      "eyedropper":iconEyeDropper,
      "eraser":iconEraser,
      "pan":iconPan,
      "zoom":iconZoom,
      "fillbucket": iconFillBucket,
    }
  }

  render() {
    if (this.props.name in this.icons) {
      return (
        <img
          className="img-tool-icon"
          alt={this.props.name+" icon"}
          src={this.icons[this.props.name]} />
      )
    } else {
      return (
        <div className="img-tool-icon">{this.props.default === undefined ? "X" : this.props.default}</div>
      )
    }

  }
}

export default ToolIcon
