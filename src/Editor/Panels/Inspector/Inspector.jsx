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
      "asset": this.renderAsset.bind(this),
    }

    this.renderDisplay = this.renderDisplay.bind(this);
    this.renderGroupContent = this.renderGroupContent.bind(this);
    this.renderPathContent = this.renderPathContent.bind(this);
    this.renderActionButtonRow = this.renderActionButtonRow.bind(this);
    this.renderButton = this.renderButton.bind(this);
    this.renderActions = this.renderActions.bind(this);
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
        icon="brushsize"
        val={this.props.toolSettings.brushSize}
        onChange={(val) => this.handleToolSettingChange('brushSize', val)}
        divider={false}/>
    )
  }

  renderSmoothness() {
    return (
      <InspectorNumericSlider
        icon="brushsmoothness"
        val={this.props.toolSettings.brushSmoothness}
        onChange={(val) => this.handleToolSettingChange('brushSmoothness', val)}
        divider={false}/>
    )
  }

  renderStrokeWidth() {
    return (
      <InspectorNumericSlider
        icon="strokewidth"
        val={this.props.toolSettings.strokeWidth}
        onChange={(val) => this.handleToolSettingChange('strokeWidth', val)}
        divider={false}/>
    )
  }

  renderSelectionStrokeWidth() {
    return (
      <InspectorNumericSlider
        icon="strokewidth"
        val={this.props.selection.attributes.strokeWidth}
        onChange={(val) => this.handleSelectionPropertyChange('strokeWidth', val)}
        divider={false}/>
    )
  }

  renderFillColor() {
    return(
      <InspectorColorPicker
        icon="fillcolor"
        val={this.props.toolSettings.fillColor}
        onChange={(col) => this.handleToolSettingChange('fillColor', this.toRgbaString(col))}
        id={"inspector-tool-fill-color"} />
    )
  }

  renderSelectionFillColor() {
    return(
      <InspectorColorPicker
        icon="fillcolor"
        val={this.props.selection.attributes.fillColor}
        onChange={(col) => this.handleSelectionPropertyChange('fillColor', this.toRgbaString(col))}
        id={"inspector-selection-fill-color"} />
    )
  }

  renderStrokeColor() {
    return(
      <InspectorColorPicker
        icon="strokecolor"
        val={this.props.toolSettings.strokeColor}
        onChange={(col) => this.handleToolSettingChange('strokeColor', this.toRgbaString(col))}
        id={"inspector-tool-stroke-color"} />
    )
  }


  renderSelectionStrokeColor() {
    return(
      <InspectorColorPicker
        icon="strokecolor"
        val={this.props.selection.attributes.strokeColor}
        onChange={(col) => this.handleSelectionPropertyChange('strokeColor', this.toRgbaString(col))}
        id={"inspector-selection-stroke-color"}
        stroke={true}/>
    )
  }

  renderCornerRoundness() {
    return (
      <InspectorNumericSlider
        icon="cornerroundness"
        val={this.props.toolSettings.cornerRadius}
        onChange={(val) => this.handleToolSettingChange("cornerRadius", val)}
        divider={false} />
    )
  }

  renderFonts(args) {
    return (
      <InspectorSelector icon="fontfamily" value={args.val} options={args.options} onChange={args.onChange} />
    )
  }

  renderFontSize(args) {
    return (
      <InspectorNumericInput icon="fontsize" val={args.val} onChange={args.onChange} />
    )
  }

  renderName() {
    return (
      <InspectorTextInput
        icon="name"
        val={this.props.selection.attributes.name}
        onChange={(val) => this.handleSelectionPropertyChange('name', val.value)} />
    )
  }

  renderFilename() {
    return (
      <InspectorTextInput
        icon="name"
        val={this.props.selection.attributes.filename}
        readOnly={true} />
    )
  }

  renderImagePreview() {
    return (
      <InspectorImagePreview
        icon="image"
        src={this.props.selection.attributes.src} />
    )
  }

  renderFrameLength() {
    return (
      <InspectorNumericInput
        icon="framelength"
        val={this.props.selection.attributes.frameLength}
        onChange={(val) => this.handleSelectionPropertyChange('frameLength', val)} />
    )
  }

  renderPosition() {
    return (
      <InspectorDualNumericInput
        icon="position"
        val1={this.props.selection.attributes.x}
        val2={this.props.selection.attributes.y}
        onChange1={(val) => this.handleSelectionPropertyChange('x', val)}
        onChange2={(val) => this.handleSelectionPropertyChange('y', val)}
        divider={true} />
    )
  }

  renderSize() {
    return (
      <InspectorDualNumericInput
        icon="size"
        val1={this.props.selection.attributes.width}
        val2={this.props.selection.attributes.height}
        onChange1={(val) => this.handleSelectionPropertyChange('width', val)}
        onChange2={(val) => this.handleSelectionPropertyChange('height', val)}
        divider={true} />

    )
  }

  renderScale() {
    return (
      <InspectorDualNumericInput
        icon="scale"
        val1={this.props.selection.attributes.scaleW}
        val2={this.props.selection.attributes.scaleH}
        onChange1={(val) => this.handleSelectionPropertyChange('scaleW', val)}
        onChange2={(val) => this.handleSelectionPropertyChange('scaleH', val)}
        divider={true} />
    )
  }

  renderRotation() {
    return (
      <InspectorNumericInput
        icon="rotation"
        val={this.props.selection.attributes.rotation}
        onChange={(val) => this.handleSelectionPropertyChange('rotation', val)} />
    )
  }

  renderOpacity() {
    return (
      <InspectorNumericInput
        icon="opacity"
        val={this.props.selection.attributes.opacity}
        onChange={(val) => this.handleSelectionPropertyChange('opacity', val)} />
    )
  }

  renderPressureToggle() {
    return (
      <InspectorCheckbox
        icon="pressure"
        defaultChecked={this.props.toolSettings.pressureEnabled}
        onChange={() => this.handleToolSettingChange('pressureEnabled', !this.props.toolSettings.pressureOn)} />
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

  handleToolSettingChange(setting, newVal) {
    this.props.toolSettings[setting] = newVal;
    this.props.updateEditorState({
      toolSettings: {
        ...this.props.toolSettings,
      }
    });
  }

  handleSelectionPropertyChange(property, newVal) {
    this.props.selection.attributes[property] = newVal;
    this.props.updateEditorState({
      selection: this.props.selection
    });
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
    if (this.props.selection.type in this.inspectorContentRenderFunctions) {
      let renderFunction = this.inspectorContentRenderFunctions[this.props.selection.type];
      return(renderFunction());
    } else if (this.props.activeTool in this.inspectorContentRenderFunctions) {
      let renderFunction = this.inspectorContentRenderFunctions[this.props.activeTool];
      return(renderFunction());
    } else {
      this.renderUnknown();
    }
  }

  renderActionButton(btn, i) {
    return (
      <InspectorActionButton key={i} btn={btn} />
    )
  }

  renderActionButtonRow(actionList, i) {
    return (
      <div key={i} className="inspector-action-row">
        {actionList.map(this.renderActionButton)}
      </div>
    )
  }

  renderActions() {
    return(
      <div className="inspector-content">
        {this.props.selection.possibleActions.map(this.renderActionButtonRow)}
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
