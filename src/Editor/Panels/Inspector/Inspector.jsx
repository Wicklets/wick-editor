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
import InspectorColorNumericInput from './InspectorRow/InspectorRowTypes/InspectorColorNumericInput';
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
      "multiclip": this.renderMultiClip.bind(this),
      "multitimeline": this.renderMultiTimeline.bind(this),
      "multicanvas": this.renderMultiCanvas.bind(this),
      "imageasset": this.renderAsset.bind(this),
      "soundasset": this.renderAsset.bind(this),
      "multiassetmixed": this.renderAsset.bind(this),
      "multisoundasset": this.renderAsset.bind(this),
      "multiimageasset": this.renderAsset.bind(this),
    }

    this.inspectorTitles = {
      "frame": "Frame",
      "multiframe": "Multi-Frame",
      "tween": "Tween",
      "multitween": "Multi-Tween",
      "clip": "Clip",
      "button": "Button",
      "path": "Path",
      "multipath": "Multi-Path",
      "multiclip": "Multi-Clip",
      "multitimeline": "Multi-Timeline",
      "multicanvas": "Multi-Canvas",
      "imageasset": "Image Asset",
      "soundasset": "Sound Asset",
      "multiassetmixed": "Multi-Asset",
      "multisoundasset": "Multi-Asset Sound",
      "multiimageasset": "Multi-Asset Image",
      "unknown": "Unknown",
    }

    this.renderDisplay = this.renderDisplay.bind(this);
    this.renderGroupContent = this.renderGroupContent.bind(this);
    this.renderPathContent = this.renderPathContent.bind(this);
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
        val={this.getSelectionAttribute('strokeWidth')}
        onChange={(val) => this.setSelectionAttribute('strokeWidth', val)}
        divider={false}
        inputProps={this.props.toolRestrictions.strokeWidth}
        id="inspector-selection-stroke-width"/>
    )
  }

  renderSelectionFillColor() {
    return (
      <div className="inspector-item">
        <InspectorColorNumericInput
          tooltip="Fill Color"
          val={this.getSelectionAttribute('fillColor')}
          onChange={(col) => this.setSelectionAttribute('fillColor', this.toRgbaString(col))}
          id={"inspector-selection-fill-color"}
          val2={this.getSelectionAttribute('opacity')}
          onChange2={(val) => this.setSelectionAttribute('opacity', val)}
          inputProps={this.props.toolRestrictions.opacity}
          divider={false}/>
      </div>
    );
  }

  renderSelectionStrokeColor() {
    return (
      <div className="inspector-item">
        <InspectorColorNumericInput
          tooltip="Stroke Color"

          val={this.getSelectionAttribute('strokeColor')}
          onChange={(col) => this.setSelectionAttribute('strokeColor', this.toRgbaString(col))}
          id={"inspector-selection-stroke-color"}
          stroke={true}

          val2={this.getSelectionAttribute('strokeWidth')}
          onChange2={(val) => this.setSelectionAttribute('strokeWidth', val)}
          inputProps={this.props.toolRestrictions.strokeWidth}
          divider={false}/>
      </div>
    );
  }

  renderFonts(args) {
    return (
      <InspectorSelector
        value={args.val}
        options={args.options}
        onChange={args.onChange} />
    )
  }

  renderFontSize(args) {
    return (
      <InspectorNumericInput
        val={args.val}
        inputProps={this.props.toolRestrictions.fontSize}
        onChange={args.onChange} />
    )
  }

  renderName() {
    return (
      <InspectorTextInput
        tooltip="Name"
        val={this.getSelectionAttribute('name')}
        onChange={(val) => {this.setSelectionAttribute('name', val);}}
        id="inspector-name" />
    )
  }

  renderFilename() {
    return (
      <InspectorTextInput
        tooltip="File Name"
        val={this.getSelectionAttribute('filename')}
        readOnly={true}
        id="inspector-file-name"/>
    )
  }

  renderImagePreview() {
    return (
      <InspectorImagePreview
        src={this.getSelectionAttribute('src')}
        id="inspector-image-preview" />
    )
  }

  renderFrameLength() {
    return (
      <InspectorNumericInput
        tooltip="Frame Length"
        val={this.getSelectionAttribute('frameLength')}
        onChange={(val) => this.setSelectionAttribute('frameLength', val)}
        id="inspector-frame-length" />
    )
  }

  renderPosition() {
    return (
      <InspectorDualNumericInput
        tooltip="Position"
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
        val={this.getSelectionAttribute('rotation')}
        onChange={(val) => this.setSelectionAttribute('rotation', val)}
        id="inspector-rotation" />
    )
  }

  renderOpacity() {
    return (
      <InspectorNumericSlider
        tooltip="Opacity"
        val={this.getSelectionAttribute('opacity')}
        onChange={(val) => this.setSelectionAttribute('opacity', val)}
        inputProps={this.props.toolRestrictions.opacity}
        divider={false}
        id="inspector-opacity"/>
    )
  }

  renderSelectionTransformProperties() {
    return (
      <div className="inspector-item">
        {this.renderPosition()}
        {this.renderSize()}
        {this.renderScale()}
        {this.renderRotation()}
        {this.renderOpacity()}
      </div>
    )
  }

  // Selection contents and properties
  renderFrame() {
    return (
        <div className="inspector-item">
          {this.renderName()}
          {this.renderFrameLength()}
        </div>
    );
  }

  renderMultiFrame() {
    return ( <div className="inspector-content" /> );
  }

  renderMultiClip() {
    return ( <div className="inspector-content" /> );
  }


  renderTween() {
    return ( <div className="inspector-content"/> );
  }

  renderMultiTween() {
    return ( <div className="inspector-content"/> );
  }

  renderGroupContent() {
    return (
      <div className="inspector-content">
        {this.renderName()}
        {this.renderSelectionTransformProperties()}
      </div>
    );
  }

  renderGroup() {
    return ( this.renderGroupContent() );
  }

  renderMultiGroup() {
    return ( this.renderGroupContent() );
  }

  renderClip() {
    return ( this.renderGroupContent() );
  }

  renderButton() {
    return ( this.renderGroupContent() );
  }

  renderPathContent() {
    return(
      <div className="inspector-content">
        {this.renderSelectionTransformProperties()}
        {this.renderSelectionFillColor()}
        {this.renderSelectionStrokeColor()}
      </div>
    );
  }

  renderPath() {
    return ( this.renderPathContent() );
  }

  renderMultiPath() {
    return ( this.renderPathContent() );
  }

  renderMultiCanvas() {
    return ( this.renderSelectionTransformProperties() )
  }

  renderMultiTimeline() {
    return (
      <div>
      </div>
    )
  }

  renderAsset() {
    return (
      <div className="inspector-content">
        {this.renderName()}
        {this.renderFilename()}
        {this.renderImagePreview()}
      </div>
    )
  }

  renderUnknown() {
    return (
      <div>
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderDisplay(selectionType) {
    let renderFunction = null;

    if (selectionType in this.inspectorContentRenderFunctions) {
      renderFunction = this.inspectorContentRenderFunctions[selectionType];
    } else {
      renderFunction = this.renderUnknown;
    }

    return (
      renderFunction()
    );
  }

  getPathActions = () => {
    return [
      this.props.editorActions['makeInteractive'],
    ];
  }

  getFrameActions = () => {
    return [
      this.props.editorActions['editCode'],
    ];
  }

  getClipActions = () => {
    return [
      this.props.editorActions['editCode'],
      this.props.editorActions['editClipTimeline'],
      this.props.editorActions['breakApart'],
    ];
  }

  renderActionButton(btn, i) {
    return (
      <InspectorActionButton
        key={i}
        btn={btn} />
    )
  }

  renderActions() {
    return(
      <div className="inspector-content">
      </div>
    )
  }

  renderTitle(selectionType) {
    if (!selectionType in this.inspectorTitles) selectionType = "unknown";

    return (
      <div className="inspector-title-container">
        <InspectorTitle
          type={selectionType}
          title={this.inspectorTitles[selectionType]} />
      </div>
    );
  }

  render() {
    let selectionType = this.props.getSelectionType();
    return(
      <div className="docked-pane inspector">
        {this.renderTitle(selectionType)}
        <div className="inspector-body">
          {this.renderDisplay(selectionType)}
          {this.renderActions()}
        </div>
      </div>
    )
  }
}

export default Inspector
