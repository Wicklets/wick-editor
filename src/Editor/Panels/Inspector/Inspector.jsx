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
import InspectorColorNumericInput from './InspectorRow/InspectorRowTypes/InspectorColorNumericInput';
import InspectorActionButton from './InspectorActionButton/InspectorActionButton';
import InspectorImagePreview from './InspectorPreview/InspectorPreviewTypes/InspectorImagePreview';
import InspectorScriptWindow from './InspectorScriptWindow/InspectorScriptWindow';

class Inspector extends Component {
  constructor (props) {
    super(props);

    /**
     * Which render function should be used for each selection type?
     */
    this.inspectorContentRenderFunctions = {
      "frame": this.renderFrame,
      "multiframe": this.renderMultiFrame,
      "tween": this.renderTween,
      "multitween": this.renderMultiTween,
      "clip": this.renderClip,
      "button": this.renderButton,
      "path": this.renderPath,
      "multipath": this.renderMultiPath,
      "multiclip": this.renderMultiClip,
      "multitimeline": this.renderMultiTimeline,
      "multicanvas": this.renderMultiCanvas,
      "imageasset": this.renderAsset,
      "soundasset": this.renderAsset,
      "multiassetmixed": this.renderAsset,
      "multisoundasset": this.renderAsset,
      "multiimageasset": this.renderAsset,
    }

    /**
     * Which actions should be shown for which selection types.
     */
    this.actionRules = {
      'breakApart': ["clip", "button",],
      'makeInteractive': ["path", "multipath", "multiclip",],
      'makeAnimated': ["path", "multipath", "multiclip",],
      'editTimeline': ["clip", "button"],
    }

    /**
     * What titles should be displayed for each selection type?
     */
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
  }

  /**
   * Returns the value of a requested selection attribute.
   * @param  {string} attribute Selection attribute to retrieve.
   * @return {string|number|undefined} Value of the selection attribute to retrieve. Returns undefined is attribute does not exist.
   */
  getSelectionAttribute = (attribute) => {
    if (attribute === 'fillColorOpacity') {
      return this.getSelectionFillColorOpacity();
    }

    return this.props.getAllSelectionAttributes()[attribute];
  }

  /**
   * Returns the selection fill color opacity.
   * @return {string} fill color opacity from 0 to 1.
   */
  getSelectionFillColorOpacity = () => {
    return this.getSelectionAttribute('fillColor').alpha;
  }

  /**
   * Sets the value of the selection fillColor opacity.
   * @param  {string} attribute Selection attribute to retrieve.
   */
  setSelectionFillColorOpacity = (value) => {
    var color = this.getSelectionAttribute('fillColor');
    color.alpha = value;
    this.setSelectionAttribute('fillColor', color);
  }

  /**
   * Updates the value of a selection attribute for the selected item in the editor.
   * @param {string} attribute Name of the attribute to update.
   * @param {string|number} newValue  New value of the attribute to update.
   */
  setSelectionAttribute = (attribute, newValue) => {
    if (attribute === 'fillColorOpacity') {
      return this.setSelectionFillColorOpacity(newValue);
    }
    this.props.setSelectionAttribute(attribute, newValue);
  }

  // Inspector Row Types

  /**
   * Renders an inspector row allowing viewing and editing of the selection stroke width.
   */
  renderSelectionStrokeWidth = () => {
    return (
      <InspectorNumericSlider
        tooltip="Stroke Width"
        val={this.getSelectionAttribute('strokeWidth')}
        onChange={(val) => this.setSelectionAttribute('strokeWidth', val)}
        divider={false}
        inputProps={this.getSelectionInputProps('strokeWidth')}
        id="inspector-selection-stroke-width"/>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection fill color.
   */
  renderSelectionFillColor = () => {
    return (
      <div className="inspector-item">
        <InspectorColorNumericInput
          tooltip="Fill Color"
          val={this.getSelectionAttribute('fillColor').toCSS()}
          onChange={(col) => this.setSelectionAttribute('fillColor', col)}
          id={"inspector-selection-fill-color"}
          val2={this.getSelectionAttribute('fillColorOpacity')}
          onChange2={(val) => this.setSelectionAttribute('fillColorOpacity', val)}
          divider={false}
        />
      </div>
    );
  }
  /**
   * Renders an inspector row allowing viewing and editing of the selection stroke color.
   */
  renderSelectionStrokeColor = () => {
    return (
      <div className="inspector-item">
        <InspectorColorNumericInput
          tooltip="Stroke Color"

          val={this.getSelectionAttribute('strokeColor').toCSS()}
          onChange={(col) => this.setSelectionAttribute('strokeColor', col)}
          id={"inspector-selection-stroke-color"}
          stroke={true}

          val2={this.getSelectionAttribute('strokeWidth')}
          onChange2={(val) => this.setSelectionAttribute('strokeWidth', val)}
          divider={false}
        />
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selected object's font.
   */
  renderFonts = (args) => {
    // TODO: Reimplement...
    return (
      <InspectorSelector
        value={args.val}
        options={args.options}
        onChange={args.onChange} />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection font size.
   */
  renderFontSize = (args) =>  {
    // TODO: Reimplement...
    return (
      <InspectorNumericInput
        val={args.val}
        onChange={args.onChange} />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's name.
   */
  renderName = () => {
    return (
      <div className="inspector-item">
        <InspectorTextInput
          tooltip="Name"
          val={this.getSelectionAttribute('name')}
          onChange={(val) => {this.setSelectionAttribute('name', val);}}
          placeholder="no_name"
          id="inspector-name" />
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing of the selection's file name.
   */
  renderFilename = () => {
    return (
      <div className="inspector-item">
        <InspectorTextInput
          tooltip="File Name"
          val={this.getSelectionAttribute('filename')}
          readOnly={true}
          id="inspector-file-name"/>
      </div>
    );
  }

  /**
   * Renders an inspector row allowing viewing of the selection's src image.
   */
  renderImagePreview = () => {
    return (
      <InspectorImagePreview
        src={this.getSelectionAttribute('src')}
        id="inspector-image-preview" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's frame length.
   */
  renderFrameLength = () => {
    return (
      <div className="inspector-item">
        <InspectorNumericInput
          tooltip="Frame Length"
          val={this.getSelectionAttribute('frameLength')}
          onChange={(val) => this.setSelectionAttribute('frameLength', val)}
          id="inspector-frame-length" />
      </div>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's x y position.
   */
  renderPosition = () => {
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

  /**
   * Renders an inspector row allowing viewing and editing of the selection's width and height.
   */
  renderSize = () => {
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

  /**
   * Renders an inspector row allowing viewing and editing of the selection's scaleX and scaleY.
   */
  renderScale = () => {
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

  /**
   * Renders an inspector row allowing viewing and editing of the selection's rotation.
   */
  renderRotation = () => {
    return (
      <InspectorNumericInput
        tooltip="Rotation"
        val={this.getSelectionAttribute('rotation')}
        onChange={(val) => this.setSelectionAttribute('rotation', val)}
        id="inspector-rotation" />
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of the selection's opacity.
   */
  renderOpacity = () => {
    return (
      <InspectorNumericSlider
        tooltip="Opacity"
        val={this.getSelectionAttribute('opacity')}
        onChange={(val) => this.setSelectionAttribute('opacity', val)}
        divider={false}
        inputProps={{min: 0, max: 1, step: 0.01}}
        id="inspector-opacity"/>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of all transformation properties
   * icluding position, scale, size, rotation and opacity.
   */
  renderSelectionTransformProperties = () => {
    return (
      <div className="inspector-item">
        {this.renderPosition()}
        {this.renderSize()}
        {/*this.renderScale() disabled scale temporarily -zj */}
        {this.renderRotation()}
        {this.renderOpacity()}
      </div>
    )
  }

  /**
   * Renders an inspector row allowing viewing and editing of sound assets attached to the
   * current object.
   */
  renderSelectionSoundAsset = () => {
    let mapAsset = asset => {
      if (!asset) {
        return {
          value: "novalue",
          label: "No Sound",
        }
      }
      return {
        value: asset,
        label: asset.name,
      }
    }

    let options = this.props.getAllSoundAssets().map(mapAsset);
    let value = mapAsset(this.getSelectionAttribute('sound'));
    return (
      <InspectorSelector
        tooltip="Sound"
        type="select"
        options={options}
        value={value}
        isSearchable={true}
        onChange={(val) => {this.setSelectionAttribute('sound', val.value)}} />
    );
  }

  renderSelectionSoundVolume = () => {
    return (
      <InspectorNumericInput
        tooltip="Volume"
        type="numeric"
        value={this.getSelectionAttribute('soundVolume')}
        onChange={(val) => {this.setSelectionAttribute('soundVolume', val)}} />
    )
  }

  renderSelectionSoundStart = () => {
    return (
      <InspectorNumericInput
        tooltip="Sound Start"
        type="numeric"
        value={this.getSelectionAttribute('soundStart')}
        onChange={(val) => {this.setSelectionAttribute('soundStart', val)}} />
    )
  }

  renderSoundContent = () => {
    let sound = this.getSelectionAttribute('sound');
    return (
      <div className="inspector-item">
        {this.renderSelectionSoundAsset()}
        {sound !== null && this.renderSelectionSoundVolume()}
        {sound !== null && this.renderSelectionSoundStart()}
      </div>
    )
  }

  // Selection contents and properties

  /**
   * Renders the inspector view for all properties of a frame.
   */
  renderFrame = () => {
    return (
        <div className="inspector-content">
          {this.renderName()}
          {/*this.renderFrameLength()*/}
          {this.renderSoundContent()}
        </div>
    );
  }

  /**
   * Renders the inspector view for all properties of a multi-frame selection.
   */
  renderMultiFrame = () => {
    return ( <div className="inspector-content" /> );
  }

  /**
   * Renders the inspector view for all properties of a multi-clip selection.
   */
  renderMultiClip = () => {
    return ( <div className="inspector-content" /> );
  }

  /**
   * Renders the inspector view for all properties of a tween selection.
   */
  renderTween = () =>  {
    return ( <div className="inspector-content"/> );
  }

  /**
   * Renders the inspector view for all properties of a multi-tween selection.
   */
  renderMultiTween = () => {
    return ( <div className="inspector-content"/> );
  }

  /**
   * Renders the inspector view for all properties of a selection with group properties.
   */
  renderGroupContent = () => {
    return (
      <div className="inspector-content">
        {this.renderName()}
        {this.renderSelectionTransformProperties()}
      </div>
    );
  }

  /**
   * Renders the inspector view for all properties of a group selection.
   */
  renderGroup = () => {
    return ( this.renderGroupContent() );
  }

  /**
   * Renders the inspector view for all properties of a multi-group selection.
   */
  renderMultiGroup = () => {
    return ( this.renderGroupContent() );
  }

  /**
   * Renders the inspector view for all properties of a clip selection.
   */
  renderClip = () => {
    return ( this.renderGroupContent() );
  }

  /**
   * Renders the inspector view for all properties of a button selection.
   */
  renderButton = () => {
    return ( this.renderGroupContent() );
  }

  /**
   * Renders the inspector view for all properties of a selection with path properties.
   */
  renderPathContent = () => {
    return(
      <div className="inspector-content">
        {this.renderSelectionTransformProperties()}
        {this.renderSelectionFillColor()}
        {this.renderSelectionStrokeColor()}
      </div>
    );
  }

  /**
   * Renders the inspector view for all properties of a path selection.
   */
  renderPath = () => {
    return ( this.renderPathContent() );
  }

  /**
   * Renders the inspector view for all properties of a multi-path selection.
   */
  renderMultiPath = () => {
    return ( this.renderPathContent() );
  }

  /**
   * Renders the inspector view for all properties of a multi-canvas selection.
   */
  renderMultiCanvas = () => {
    return ( this.renderSelectionTransformProperties() )
  }

  /**
   * Renders the inspector view for all properties of a multi-timeline selection.
   */
  renderMultiTimeline = () => {
    return (
      <div>
      </div>
    )
  }

  /**
   * Renders the inspector view for all properties of an asset selection.
   */
  renderAsset = () => {
    return (
      <div className="inspector-content">
        {this.renderName()}
        {this.renderFilename()}
        {this.renderImagePreview()}
      </div>
    )
  }

  /**
   * Renders a default selection view with no properties.
   */
  renderUnknown = () => {
    return (
      <div>
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  /**
   * Renders the proper view for the given selection type.
   * @param   {string} selectionType A string representation of the selection to display.
   * @returns {Component} JSX component to render.
   */
  renderDisplay = (selectionType) => {
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

  /**
   * Renders a single action button for a given editor action.
   * @param {object} btn editor action with action, icon, color, and tooltip text properties.
   * @param {number} i unique key to be applied to returned object.
   * @returns {Component} JSX component to render.
   */
  renderActionButton = (btn, i) => {
    return (
      <div key={i} className="inspector-item">
        <InspectorActionButton
          btn={btn} />
      </div>
    );
  }

  /**
   * Renders all actions for the current selection.
   * @returns {Component} JSX component containing all the actions for the current selection.
   */
  renderActions = () => {
    let actions = [];
    let selectionType = this.props.getSelectionType();

    Object.keys(this.actionRules).forEach(action => {
        let actionList = this.actionRules[action];
        if (actionList.indexOf(selectionType) > -1) actions.push(action);
    });

    return(
      <div className="inspector-content">
        {actions.map((action, i) => {
            return this.renderActionButton(this.props.editorActions[action], i);
          })}
      </div>
    )
  }

  /**
   * Renders an edit script window if a script exists for the selected object.
   * @returns {Component} JSX component containing script window.
   */
  renderScripts = () => {
    return (
      <div className="inspector-item">
        <InspectorScriptWindow
          script={this.props.script}
          deleteScript={this.props.deleteScript}
          editScript={this.props.editScript}
          scriptInfoInterface={this.props.scriptInfoInterface}
        />
      </div>
    );
  }

  /**
   * Renders the inspector title for the current selection.
   * @param {string} selectionType selection type to return.
   */
  renderTitle = (selectionType) => {
    if (!(selectionType in this.inspectorTitles)) selectionType = "";

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
          {this.props.selectionIsScriptable() && this.renderScripts()}
        </div>
      </div>
    )
  }
}

export default Inspector
