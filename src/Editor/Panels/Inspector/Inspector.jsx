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
import './_inspector.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import InspectorTitle from './InspectorTitle/InspectorTitle';

import InspectorNumericSlider from './InspectorRow/InspectorRowTypes/InspectorNumericSlider';
import InspectorTextInput from './InspectorRow/InspectorRowTypes/InspectorTextInput';
import InspectorNumericInput from './InspectorRow/InspectorRowTypes/InspectorNumericInput';
import InspectorDualNumericInput from './InspectorRow/InspectorRowTypes/InspectorDualNumericInput';
import InspectorSelector from './InspectorRow/InspectorRowTypes/InspectorSelector';
import InspectorColorPicker from './InspectorRow/InspectorRowTypes/InspectorColorPicker';
import InspectorActionButton from './InspectorActionButton/InspectorActionButton';
import InspectorImagePreview from './InspectorPreview/InspectorPreviewTypes/InspectorImagePreview';

class Inspector extends Component {
  constructor (props) {
    super(props);

    /* this is temporary so the app doesnt crash - zj*/
    this.state = {
      selection: {
        possibleActions: [],
      }
    };

    this.inspectorContentRenderFunctions = {
      "frame": this.renderFrame.bind(this),
      "multiframe": this.renderMultiFrame.bind(this),
      "tween": this.renderTween.bind(this),
      "multitween": this.renderMultiTween.bind(this),
      "clip": this.renderClip.bind(this),
      "button": this.renderButton.bind(this),
      "path": this.renderPath.bind(this),
      "multipath": this.renderMultiPath.bind(this),
      "multitimelinemixed": this.renderMultiTimelineMixed.bind(this),
      "multicanvasmixed": this.renderMultiCanvasMixed.bind(this),
      "imageasset": this.renderAsset.bind(this),
      "soundasset": this.renderAsset.bind(this),
      "multiassetmixed": this.renderAsset.bind(this),
      "multisoundasset": this.renderAsset.bind(this),
      "multiimageasset": this.renderAsset.bind(this),
    }

    this.renderDisplay = this.renderDisplay.bind(this);
    this.renderGroupContent = this.renderGroupContent.bind(this);
    this.renderPathContent = this.renderPathContent.bind(this);
    this.renderActionButtonRow = this.renderActionButtonRow.bind(this);
    this.renderButton = this.renderButton.bind(this);
    this.renderActions = this.renderActions.bind(this);
  }

  /**
   * Returns the value of a requested selection attribute.
   * @param  {string} attribute Selection attribute to retrieve.
   * @return {string|number|undefined} Value of the selection attribute to retrieve. Returns undefined is attribute does not exist.
   */
  getSelectionAttribute = (attribute) => {
    return this.props.getSelectionAttribute(attribute);
  }

  /**
   * Updates the value of a selection attribute for the selected item in the editor.
   * @param {string} attribute Name of the attribute to update.
   * @param {string|number} newValue  New value of the attribute to update.
   */
  setSelectionAttribute = (attribute, newValue) => {
    this.props.setSelectionAttribute(attribute, newValue);
  }

  toRgbaString (col) {
    let r = col.rgb.r;
    let g = col.rgb.g;
    let b = col.rgb.b;
    let a = col.rgb.a;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  // Inspector Row Types
  renderSelectionStrokeWidth() {
    return (
      <InspectorNumericSlider
        tooltip="Stroke Width"
        icon="strokewidth"
        val={this.getSelectionAttribute('strokeWidth')}
        onChange={(val) => this.setSelectionAttribute('strokeWidth', val)}
        divider={false}
        inputProps={this.props.toolRestrictions.strokeWidth}
        id="inspector-selection-stroke-width"/>
    )
  }

  renderSelectionFillColor() {
    return(
      <InspectorColorPicker
        tooltip="Fill Color"
        icon="fillcolor"
        val={this.getSelectionAttribute('fillColor')}
        onChange={(col) => this.setSelectionAttribute('fillColor', this.toRgbaString(col))}
        id={"inspector-selection-fill-color"} />
    )
  }

  renderSelectionStrokeColor() {
    return(
      <InspectorColorPicker
        tooltip="Stroke Color"
        icon="strokecolor"
        val={this.getSelectionAttribute('strokeColor')}
        onChange={(col) => this.setSelectionAttribute('strokeColor', this.toRgbaString(col))}
        id={"inspector-selection-stroke-color"}
        stroke={true}/>
    )
  }

  renderFonts(args) {
    return (
      <InspectorSelector
        icon="fontfamily"
        value={args.val}
        options={args.options}
        onChange={args.onChange} />
    )
  }

  renderFontSize(args) {
    return (
      <InspectorNumericInput
        icon="fontsize"
        val={args.val}
        inputProps={this.props.toolRestrictions.fontSize}
        onChange={args.onChange} />
    )
  }

  renderName() {
    return (
      <InspectorTextInput
        tooltip="Name"
        icon="name"
        val={this.getSelectionAttribute('name')}
        onChange={(val) => {this.setSelectionAttribute('name', val);}}
        id="inspector-name" />
    )
  }

  renderFilename() {
    return (
      <InspectorTextInput
        tooltip="File Name"
        icon="name"
        val={this.getSelectionAttribute('filename')}
        readOnly={true}
        id="inspector-file-name"/>
    )
  }

  renderImagePreview() {
    return (
      <InspectorImagePreview
        icon="image"
        src={this.getSelectionAttribute('src')}
        id="inspector-image-preview" />
    )
  }

  renderFrameLength() {
    return (
      <InspectorNumericInput
        tooltip="Frame Length"
        icon="framelength"
        val={this.getSelectionAttribute('frameLength')}
        onChange={(val) => this.setSelectionAttribute('frameLength', val)}
        id="inspector-frame-length" />
    )
  }

  renderPosition() {
    return (
      <InspectorDualNumericInput
        tooltip="Position"
        icon="position"
        val1={this.getSelectionAttribute('x')}
        val2={this.getSelectionAttribute('y')}
        onChange1={(val) => this.setSelectionAttribute('x', val)}
        onChange2={(val) => this.setSelectionAttribute('y', val)}
        divider={true}
        id="inspector-position" />
    )
  }

  renderSize() {
    return (
      <InspectorDualNumericInput
        tooltip="Size"
        icon="size"
        val1={this.getSelectionAttribute('width')}
        val2={this.getSelectionAttribute('height')}
        onChange1={(val) => this.setSelectionAttribute('width', val)}
        onChange2={(val) => this.setSelectionAttribute('height', val)}
        divider={true}
        id="inspector-size" />
    )
  }

  renderScale() {
    return (
      <InspectorDualNumericInput
        tooltip="Scale"
        icon="scale"
        val1={this.getSelectionAttribute('scaleX')}
        val2={this.getSelectionAttribute('scaleY')}
        onChange1={(val) => this.setSelectionAttribute('scaleX', val)}
        onChange2={(val) => this.setSelectionAttribute('scaleY', val)}
        divider={true}
        id="inspector-scale" />
    )
  }

  renderRotation() {
    return (
      <InspectorNumericInput
        tooltip="Rotation"
        icon="rotation"
        val={this.getSelectionAttribute('rotation')}
        onChange={(val) => this.setSelectionAttribute('rotation', val)}
        id="inspector-rotation" />
    )
  }

  renderOpacity() {
    return (
      <InspectorNumericSlider
        tooltip="Opacity"
        icon="opacity"
        val={this.getSelectionAttribute('opacity')}
        onChange={(val) => this.setSelectionAttribute('opacity', val)}
        inputProps={this.props.toolRestrictions.opacity}
        divider={false}
        id="inspector-opacity"/>
    )
  }

  renderTransformProperties() {
    return (
      <div className="inspector-transform-properties">
        {this.renderPosition()}
        {this.renderSize()}
        {this.renderScale()}
        {this.renderRotation()}
        {this.renderSelectionStrokeWidth()}
        {this.renderOpacity()}
      </div>
    )
  }

  // Selection contents and properties
  renderFrame() {
    return (
      <div>
        <InspectorTitle type={"frame"} title={"Frame"} />
        <div className="inspector-content">
          {this.renderName()}
          {this.renderFrameLength()}
        </div>
      </div>
    )
  }

  renderMultiFrame() {
    return (
      <div>
        <InspectorTitle type={"multiframe"} title={"Multiple Frames"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderTween() {
    return (
      <div>
        <InspectorTitle type={"tween"} title={"Tween"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderMultiTween() {
    return (
      <div>
        <InspectorTitle type={"multitween"} title={"Multiple Tweens"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderGroupContent() {
    return (
      <div className="inspector-content">
        {this.renderName()}
        {this.renderTransformProperties()}
      </div>
    )
  }

  renderGroup() {
    return (
      <div>
        <InspectorTitle type={"group"} title={"Group"} />
        {this.renderGroupContent()}
      </div>
    )
  }

  renderMultiGroup() {
    return (
      <div>
        <InspectorTitle type={"multigroup"} title={"Multiple Groups"} />
        {this.renderGroupContent()}
      </div>
    )
  }

  renderClip() {
    return (
      <div>
        <InspectorTitle type={"clip"} title={"Clip"} />
        {this.renderGroupContent()}
      </div>
    )
  }

  renderButton() {
    return (
      <div>
        <InspectorTitle type={"button"} title={"Button"} />
        {this.renderGroupContent()}
      </div>
    )
  }

  renderPathContent() {
    return(
      <div className="inspector-content">
        {this.renderTransformProperties()}
        {this.renderSelectionFillColor()}
        {this.renderSelectionStrokeColor()}
      </div>
    )
  }

  renderPath() {
    return (
      <div>
        <InspectorTitle type={"path"} title={"Path"} />
        {this.renderPathContent()}
      </div>
    )
  }

  renderMultiPath() {
    return (
      <div>
        <InspectorTitle type={"multipath"} title={"Multiple Paths"} />
        {this.renderPathContent()}
      </div>
    )
  }

  renderMultiCanvasMixed() {
    return (
      <div>
        <InspectorTitle type={"multicanvasmixed"} title={"Mixed Selection"} />
        {this.renderTransformProperties()}
      </div>
    )
  }

  renderMultiTimelineMixed() {
    return (
      <div>
        <InspectorTitle type={"multitimelinemixed"} title={"Mixed Selection"} />
      </div>
    )
  }

  renderAsset() {
    return (
      <div>
        <InspectorTitle type={"asset"} title={"Asset"} />
        <div className="inspector-content">
          {this.renderName()}
          {this.renderFilename()}
          {this.renderImagePreview()}
        </div>
      </div>
    )
  }

  renderUnknown() {
    return (
      <div>
        <InspectorTitle />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderDisplay() {
    let selectionType = this.props.getSelectionType();

    let renderFunction = null;
    if (selectionType in this.inspectorContentRenderFunctions) {
      renderFunction = this.inspectorContentRenderFunctions[selectionType];
    } else {
      renderFunction = this.renderUnknown;
    }

    return (renderFunction());
  }

  renderActionButton(btn, i) {
    return (
      <InspectorActionButton
        key={i}
        btn={btn} />
    )
  }

  renderActionButtonRow(actionList, i) {
    return (
      <div
        key={i}
        className="inspector-action-row">
        {actionList.map(this.renderActionButton)}
      </div>
    )
  }

  renderActions() {
    return(
      <div className="inspector-content">
        {this.props.getSelectionActions().map(this.renderActionButtonRow)}
      </div>
    )
  }

  render() {
    return(
      <div className="docked-pane inspector">
        {this.renderDisplay()}
        {this.renderActions()}
      </div>
    )
  }
}

export default Inspector
