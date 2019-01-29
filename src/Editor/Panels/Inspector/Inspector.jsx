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

import DockedTitle from 'Editor/Util/DockedTitle/DockedTitle';
import InspectorTitle from './InspectorTitle/InspectorTitle';

import InspectorNumericSlider from './InspectorRow/InspectorRowTypes/InspectorNumericSlider';
import InspectorTextInput from './InspectorRow/InspectorRowTypes/InspectorTextInput';
import InspectorNumericInput from './InspectorRow/InspectorRowTypes/InspectorNumericInput';
import InspectorDualNumericInput from './InspectorRow/InspectorRowTypes/InspectorDualNumericInput';
import InspectorSelector from './InspectorRow/InspectorRowTypes/InspectorSelector';
import InspectorColorPicker from './InspectorRow/InspectorRowTypes/InspectorColorPicker';
import InspectorCheckbox from './InspectorRow/InspectorRowTypes/InspectorCheckbox';
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
      "cursor": this.renderCursor.bind(this),
      "brush": this.renderBrush.bind(this),
      "pencil": this.renderPencil.bind(this),
      "eraser": this.renderEraser.bind(this),
      "fillbucket": this.renderFillBucket.bind(this),
      "rectangle": this.renderRectangle.bind(this),
      "ellipse": this.renderEllipse.bind(this),
      "line": this.renderLine.bind(this),
      "eyedropper": this.renderEyeDropper.bind(this),
      "text": this.renderText.bind(this),
      "zoom": this.renderZoom.bind(this),
      "pan": this.renderPan.bind(this),
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
   * Returns the value of an editor tool setting.
   * @param  {string} setting Setting value to retrieve
   * @return {string|number} Value of requested setting. Returns undefined if setting does no exist.
   */
  getToolSetting = (setting) => {
    return this.props.getToolSettings()[setting];
  }

  /**
   * Updates the value of a tool setting within the editor.
   * @param {string} setting  Name of the setting to update.
   * @param {string|number} newValue Value to update selected tool setting to.
   */
  setToolSetting = (setting, newValue) => {
    let newToolSetting = {}
    newToolSetting[setting] = newValue;
    this.props.setToolSettings(newToolSetting);
  }

  /**
   * Returns the value of a requested selection attribute.
   * @param  {string} attribute Selection attribute to retrieve.
   * @return {string|number} Value of the selection attribute to retrieve. Returns undefined is attribute does not exist.
   */
  getSelectionAttribute = (attribute) => {
    return this.props.getSelectionAttributes()[attribute];
  }

  /**
   * Updates the value of a selection attribute for the selected item in the editor.
   * @param {string} attribute Name of the attribute to update.
   * @param {string|number} newValue  New value of the attribute to update.
   */
  setSelectionAttribute = (attribute, newValue) => {
    let newSelectionAttributes = {}
    newSelectionAttributes[attribute] = newValue;
    this.props.setSelectionAttributes(newSelectionAttributes);
  }

  toRgbaString (col) {
    let r = col.rgb.r;
    let g = col.rgb.g;
    let b = col.rgb.b;
    let a = col.rgb.a;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  // Inspector Row Types
  renderBrushSize() {
    return (
      <InspectorNumericSlider
        tooltip="Brush Size"
        icon="brushsize"
        val={this.getToolSetting('brushSize')}
        onChange={(val) => this.setToolSetting('brushSize', val)}
        divider={false}
        id="inspector-brush-size"/>
    )
  }

  renderSmoothness() {
    return (
      <InspectorNumericSlider
        tooltip="Brush Smoothness"
        icon="brushsmoothness"
        val={this.getToolSetting('brushSmoothness')}
        onChange={(val) => this.setToolSetting('brushSmoothness', val)}
        divider={false}
        id="inspector-brush-smoothness"/>
    )
  }

  renderStrokeWidth() {
    return (
      <InspectorNumericSlider
        tooltip="Stroke Width"
        icon="strokewidth"
        val={this.getToolSetting('strokeWidth')}
        onChange={(val) => this.setToolSetting('strokeWidth', val)}
        divider={false}
        id="inspector-stroke-width"/>
    )
  }

  renderSelectionStrokeWidth() {
    return (
      <InspectorNumericSlider
        tooltip="Stroke Width"
        icon="strokewidth"
        val={this.getSelectionAttribute('strokeWidth')}
        onChange={(val) => this.setSelectionAttribute('strokeWidth', val)}
        divider={false}
        id="inspector-selection-stroke-width"/>
    )
  }

  renderFillColor() {
    return(
      <InspectorColorPicker
        tooltip="Fill Color"
        icon="fillcolor"
        val={this.getToolSetting('fillColor')}
        onChange={(col) => this.setToolSetting('fillColor', this.toRgbaString(col))}
        id={"inspector-tool-fill-color"} />
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

  renderStrokeColor() {
    return(
      <InspectorColorPicker
        tooltip="Stroke Color"
        icon="strokecolor"
        val={this.getToolSetting('strokeColor')}
        onChange={(col) => this.setToolSetting('strokeColor', this.toRgbaString(col))}
        id={"inspector-tool-stroke-color"} />
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

  renderCornerRoundness() {
    return (
      <InspectorNumericSlider
        tooltip="Corner Roundness"
        icon="cornerroundness"
        val={this.getToolSetting('cornerRadius')}
        onChange={(val) => this.setToolSetting("cornerRadius", val)}
        divider={false}
        id="inspector-corner-radius"/>
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
      <InspectorNumericInput
        tooltip="Opacity"
        icon="opacity"
        val={this.getSelectionAttribute('opacity')}
        onChange={(val) => this.setSelectionAttribute('opacity', val)}
        id="inspector-opacity"/>
    )
  }

  renderPressureToggle() {
    return (
      <InspectorCheckbox
        tooltip="Enable Pressure"
        icon="pressure"
        defaultChecked={this.getSelectionAttribute('pressureEnabled')}
        onChange={() => this.setSelectionAttribute('pressureEnabled', !this.props.getToolSettings().pressureOn)}
        id="inspector-pressure-toggle" />
    )
  }

  renderTransformProperties() {
    return (
      <div className="inspector-transform-properties">
        {this.renderPosition()}
        {this.renderSize()}
        {this.renderScale()}
        {this.renderRotation()}
        {this.renderOpacity()}
      </div>
    )
  }

  // Selection contents and properties
  renderCursor() {
    return (
      <InspectorTitle type={"cursor"} title={"Cursor"}/>
    )
  }

  renderBrush() {
    return (
      <div>
        <InspectorTitle type={"brush"} title={"Brush"} />
        <div className="inspector-content">
          {this.renderBrushSize()}
          {this.renderPressureToggle()}
          {/*{this.renderSmoothness()}*/}
        </div>
      </div>
    )
  }

  renderPencil() {
    return (
      <div>
        <InspectorTitle type={"pencil"} title={"Pencil"} />
        <div className="inspector-content">
          {this.renderStrokeWidth()}
          {this.renderPressureToggle()}
          {/*{this.renderSmoothness()}*/}
        </div>
      </div>
    )
  }

  renderEraser() {
    return (
      <div>
        <InspectorTitle type={"eraser"} title={"Eraser"} />
        <div className="inspector-content">
          {this.renderBrushSize()}
          {this.renderPressureToggle()}
          {/*{this.renderSmoothness()}*/}
        </div>
      </div>
    )
  }

  renderFillBucket() {
    return (
      <div>
        <InspectorTitle type={"fillbucket"} title={"Fill Bucket"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderRectangle() {
    return (
      <div>
        <InspectorTitle type={"rectangle"} title={"Rectangle"} />
        <div className="inspector-content">
          {this.renderStrokeWidth()}
          {this.renderCornerRoundness()}
        </div>
      </div>
    )
  }

  renderEllipse() {
    return (
      <div>
        <InspectorTitle type={"ellipse"} title={"Ellipse"} />
        <div className="inspector-content">
          {this.renderStrokeWidth()}
        </div>
      </div>
    )
  }

  renderLine() {
    return (
      <div>
        <InspectorTitle type={"line"} title={"Line"} />
        <div className="inspector-content">
          {this.renderStrokeWidth()}
        </div>
      </div>
    )
  }

  renderEyeDropper() {
    return (
      <div>
        <InspectorTitle type={"eyedropper"} title={"Eye Dropper"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderText() {
    return (
      <div>
        <InspectorTitle type={"text"} title={"Text"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderZoom() {
    return (
      <div>
        <InspectorTitle type={"zoom"} title={"Zoom"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderPan() {
    return (
      <div>
        <InspectorTitle type={"pan"} title={"Pan"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

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
        {this.renderSelectionStrokeWidth()}
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
        <InspectorTitle type={"unknown"} title={"Unknown"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderDisplay() {
    let selectionType = this.props.getSelectionType();
    let activeTool = this.props.getActiveTool();

    let renderFunction = null;
    if (selectionType in this.inspectorContentRenderFunctions) {
      renderFunction = this.inspectorContentRenderFunctions[selectionType];
    } else if (activeTool in this.inspectorContentRenderFunctions) {
      renderFunction = this.inspectorContentRenderFunctions[activeTool];
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
        <DockedTitle title={"Inspector"}></DockedTitle>
        {this.renderDisplay()}
        {this.renderActions()}
      </div>
    )
  }
}

export default Inspector
