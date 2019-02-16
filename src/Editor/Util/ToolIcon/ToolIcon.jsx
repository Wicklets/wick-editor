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

// Tools
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
import iconZoomIn from 'resources/tool-icons/zoomin.svg';
import iconZoomOut from 'resources/tool-icons/zoomout.svg';
import iconFillBucket from 'resources/tool-icons/bucket.svg';
import iconText from 'resources/tool-icons/text.svg';

// Actions
import iconAction from 'resources/tool-icons/action.svg';
import iconUpload from 'resources/tool-icons/upload.svg';
import iconDelete from 'resources/tool-icons/delete.svg';
import iconDuplicate from 'resources/tool-icons/duplicate.svg';
import iconFlipHorizontal from 'resources/tool-icons/flipHorizontal.svg';
import iconFlipVertical from 'resources/tool-icons/flipVertical.svg';
import iconBringForwards from 'resources/tool-icons/bringForwards.svg';
import iconBringToFront from 'resources/tool-icons/bringToFront.svg';
import iconSendBackwards from 'resources/tool-icons/sendBackwards.svg';
import iconSendToBack from 'resources/tool-icons/sendToBack.svg';
import iconTimeline from 'resources/tool-icons/timeline.svg';
import iconScript from 'resources/tool-icons/script.svg';
import iconSymbol from 'resources/tool-icons/symbol.svg';
import iconLeaveUp from 'resources/tool-icons/leaveUp.svg';
import iconBreakApart from 'resources/tool-icons/breakApart.svg';
import iconClose from 'resources/tool-icons/close.svg';
import iconUndo from 'resources/tool-icons/undo.svg';
import iconRedo from 'resources/tool-icons/redo.svg';
import iconRecenter from 'resources/tool-icons/recenter.svg';

// Assets
import iconImage from 'resources/tool-icons/image.svg';
import iconGear from 'resources/tool-icons/settings.svg';
import iconGroup from 'resources/tool-icons/group.svg';
import iconSearch from 'resources/tool-icons/search.svg';

// Rows
import iconBrushSize from "resources/inspector-icons/property-icons/brushsize.svg";
import iconBrushSmoothness from "resources/inspector-icons/property-icons/brushsmoothness.svg";
import iconCornerRoundness from "resources/inspector-icons/property-icons/cornerroundness.svg";
import iconEase from "resources/inspector-icons/property-icons/ease.svg";
import iconFillColor from "resources/inspector-icons/property-icons/fillcolor.svg";
import iconFontFamily from "resources/inspector-icons/property-icons/fontfamily.svg";
import iconFontSize from "resources/inspector-icons/property-icons/fontsize.svg";
import iconFrameLength from "resources/inspector-icons/property-icons/framelength.svg";
import iconFrameRate from "resources/inspector-icons/property-icons/framerate.svg";
import iconMultipleObjects from "resources/inspector-icons/property-icons/multipleobjects.svg";
import iconName from "resources/inspector-icons/property-icons/name.svg";
import iconOpacity from "resources/inspector-icons/property-icons/opacity.svg";
import iconPaint from "resources/inspector-icons/property-icons/paint.svg";
import iconOnionSkinning from "resources/tool-icons/onionskinning.svg";
import iconPressure from "resources/inspector-icons/property-icons/brushsmoothness.svg";
import iconPosition from "resources/inspector-icons/property-icons/position.svg";
import iconRotation from "resources/inspector-icons/property-icons/rotation.svg";
import iconScale from "resources/inspector-icons/property-icons/scale.svg";
import iconSize from "resources/inspector-icons/property-icons/size.svg";
import iconSound from "resources/inspector-icons/property-icons/sound.svg";
import iconStrokeColor from "resources/inspector-icons/property-icons/strokecolor.svg";
import iconStrokeWidth from "resources/inspector-icons/property-icons/strokewidth.png";
import iconVolume from "resources/inspector-icons/property-icons/volume.svg";
import iconUnknown from 'resources/inspector-icons/selection-icons/unknown.svg';

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
      "zoomin":iconZoomIn,
      "zoomout":iconZoomOut,
      "fillbucket": iconFillBucket,
      "text": iconText,
      "image": iconImage,
      "imageAsset": iconImage,
      "leaveUp": iconLeaveUp,
      "upload": iconUpload,
      "action": iconAction,
      "breakApart": iconBreakApart,
      "brushsize": iconBrushSize,
      "brushsmoothness": iconBrushSmoothness,
      "cornerroundness": iconCornerRoundness,
      "close": iconClose,
      "delete": iconDelete,
      "search": iconSearch,
      "duplicate": iconDuplicate,
      "ease": iconEase,
      "fillcolor": iconFillColor,
      "fontfamily": iconFontFamily,
      "fontsize": iconFontSize,
      "framelength": iconFrameLength,
      "framerate": iconFrameRate,
      "flipHorizontal": iconFlipHorizontal,
      "flipVertical": iconFlipVertical,
      "group": iconGroup,
      "multipleobjects": iconMultipleObjects,
      "name": iconName,
      "opacity": iconOpacity,
      "paint": iconPaint,
      "onionskinning": iconOnionSkinning,
      "position": iconPosition,
      "pressure": iconPressure,
      "rotation": iconRotation,
      "undo": iconUndo,
      "redo": iconRedo,
      "scale": iconScale,
      "sendToBack": iconSendToBack,
      "sendBackwards": iconSendBackwards,
      "bringToFront": iconBringToFront,
      "bringForwards": iconBringForwards,
      "gear": iconGear,
      "recenter": iconRecenter,
      "size": iconSize,
      "sound": iconSound,
      "SoundAsset": iconSound,
      "strokecolor": iconStrokeColor,
      "strokewidth": iconStrokeWidth,
      "symbol": iconSymbol,
      "timeline": iconTimeline,
      "script": iconScript,
      "volume": iconVolume,
    }
  }

  getSource() {
    if (this.props.name in this.icons) {
      return this.icons[this.props.name];
    } else {
      return iconUnknown;
    }
  }

  render() {
    if (this.props.name in this.icons || this.props.default === undefined) {
      return (
        <img
          className="img-tool-icon"
          alt={this.props.name+" icon"}
          src={this.getSource()} />
      )
    } else {
      return (
        <div className="img-tool-icon">{this.props.default}</div>
      )
    }
  }
}

export default ToolIcon
