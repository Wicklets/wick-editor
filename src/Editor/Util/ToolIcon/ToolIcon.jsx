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

class ToolIcon extends Component {
  constructor(props) {
    super(props);

    this.icons = {
      "croquisBrush":iconBrush,
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

    }
  }

  render() {
    return (
      <img className="img-tool-icon" src={this.icons[this.props.name]} />
    )
  }
}

export default ToolIcon
