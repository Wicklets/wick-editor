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
import './_inspectorinputicon.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

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
import iconPosition from "resources/inspector-icons/property-icons/position.svg";
import iconRotation from "resources/inspector-icons/property-icons/rotation.svg";
import iconScale from "resources/inspector-icons/property-icons/scale.svg";
import iconSize from "resources/inspector-icons/property-icons/size.svg";
import iconSound from "resources/inspector-icons/property-icons/sound.svg";
import iconStrokeColor from "resources/inspector-icons/property-icons/strokecolor.svg";
import iconStrokeWidth from "resources/inspector-icons/property-icons/strokewidth.png";
import iconVolume from "resources/inspector-icons/property-icons/volume.svg";
import iconUnknown from "resources/inspector-icons/selection-icons/unknown.svg";

class InspectorInputIcon extends Component {
  constructor() {
    super();
    this.iconTypes = {
      "brushsize": iconBrushSize,
      "brushsmoothness": iconBrushSmoothness,
      "cornerroundness": iconCornerRoundness,
      "ease": iconEase,
      "fillcolor": iconFillColor,
      "fontfamily": iconFontFamily,
      "fontsize": iconFontSize,
      "framelength": iconFrameLength,
      "framerate": iconFrameRate,
      "multipleobjects": iconMultipleObjects,
      "name": iconName,
      "opacity": iconOpacity,
      "paint": iconPaint,
      "position": iconPosition,
      "rotation": iconRotation,
      "scale": iconScale,
      "size": iconSize,
      "sound": iconSound,
      "strokecolor": iconStrokeColor,
      "strokewidth": iconStrokeWidth,
      "volume": iconVolume,
      "unknown": iconUnknown,
    }
  }

  renderIcon(type) {
    if (type in this.iconTypes) {
      return this.iconTypes[type];
    } else {
      return this.iconTypes["unknown"];
    }
  }
  render() {
    return(
      <img alt="" className="inspector-input-icon" src={this.renderIcon(this.props.type)} />
    )
  }
}

export default InspectorInputIcon
