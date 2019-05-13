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

import ToolSettingsInput from './ToolSettingsInput/ToolSettingsInput';

import './_toolsettings.scss';

class ToolSettings extends Component {
  constructor(props) {
    super(props);

    this.settingsFunctions = {
      "cursor": this.renderCursorSettings,
      "brush": this.renderBrushSettings,
      "pencil": this.renderPencilSettings,
      "eraser": this.renderEraserSettings,
      "rectangle": this.renderRectangleSettings,
      "ellipse": this.renderEllipseSettings,
      "line": this.renderLineSettings,
      "text": this.renderTextSettings,
    }
  }

  render () {
    return (
      <div id='settings-panel-container'>
        {this.renderSettings()}
      </div>
    );
  }

  renderSettings = () => {
    if (this.props.activeTool in this.settingsFunctions) {
      return this.settingsFunctions[this.props.activeTool]();
    }

    return (
      <div className="default"></div>
    )
  }

  // Selection contents and properties
  renderCursorSettings = () => {
    return (
      <div className='settings-input-container'>
        {this.renderSelectPoints()}
        {this.renderSelectCurves()}
      </div>
    );
  }

  renderBrushSettings = () => {
    return (
      <div className='settings-input-container'>
        {this.renderBrushSize()}
        {this.renderBrushSmoothing()}
        {this.renderEnablePressure()}
      </div>
    );
  }

  renderPencilSettings = () => {
    return (
      <div className='settings-input-container'>
        {this.renderStrokeWidth()}
      </div>
    );
  }

  renderEraserSettings = () => {
    return (
      <div className='settings-input-container'>
        {this.renderEraserSize()}
      </div>
    );
  }

  renderRectangleSettings = () => {
    return (
      <div className='settings-input-container'>
        {this.renderStrokeWidth()}
        {this.renderCornerRadius()}
      </div>
    );
  }

  renderEllipseSettings = () => {
    return (
      <div className='settings-input-container'>
        {this.renderStrokeWidth()}
      </div>
    );
  }

  renderLineSettings = () => {
    return (
      <div className='settings-input-container'>
        {this.renderStrokeWidth()}
      </div>
    );
  }

  renderTextSettings = () => {
    return (
      <div className='settings-input-container'>
        {this.renderFontSize()}
      </div>
    );
  }

  renderEnablePressure = () => {
    return (
      <ToolSettingsInput
        name='Enable Pressure'
        icon='brushpressure'
        type='checkbox'
        value={this.getToolSetting('pressureEnabled')}
        onChange={() => this.setToolSetting('pressureEnabled', !this.getToolSetting('pressureEnabled'))}/>
    )
  }

  renderSelectCurves = () => {
    return (
      <ToolSettingsInput
        name='Select Curves'
        icon='curve'
        type='checkbox'
        value={this.getToolSetting('selectCurves')}
        onChange={() => this.setToolSetting('selectCurves', !this.getToolSetting('selectCurves'))}/>
    )
  }

  renderSelectPoints = () => {
    return (
      <ToolSettingsInput
        name='Select Points'
        icon='point'
        type='checkbox'
        value={this.getToolSetting('selectPoints')}
        onChange={() => this.setToolSetting('selectPoints', !this.getToolSetting('selectPoints'))}/>
    )
  }

  renderCornerRadius = () => {
    return (
      <ToolSettingsInput
        name='Corner Radius'
        icon='cornerradius'
        type='numeric'
        value={this.getToolSetting('cornerRadius')}
        onChange={(val) => this.setToolSetting('cornerRadius', val)}
        inputRestrictions={this.props.toolRestrictions.cornerRadius}/>
    )
  }

  renderBrushSmoothing = () => {
    return (
      <ToolSettingsInput
        name='Brush Smoothing'
        icon='brushsmoothness'
        type='numeric'
        value={this.getToolSetting('brushSmoothing')}
        onChange={(val) => this.setToolSetting('brushSmoothing', val)}
        inputRestrictions={this.props.toolRestrictions.brushSmoothing}/>
    )
  }

  renderFontSize = () => {
    return (
      <ToolSettingsInput
        name='Font Size'
        icon='fontsize'
        type='numeric'
        value={this.getToolSetting('fontSize')}
        onChange={(val) => this.setToolSetting('fontSize', val)}
        inputRestrictions={this.props.toolRestrictions.fontSize}/>
    )
  }

  renderEraserSize = () => {
    return (
      <ToolSettingsInput
        name='Eraser Size'
        icon='eraser'
        type='numeric'
        value={this.getToolSetting('eraserSize')}
        onChange={(val) => this.setToolSetting('eraserSize', val)}
        inputRestrictions={this.props.toolRestrictions.eraserSize}/>
    )
  }

  renderStrokeWidth = () => {
    return (
      <ToolSettingsInput
        name='Stroke Width'
        icon='strokewidth'
        type='numeric'
        value={this.getToolSetting('strokeWidth')}
        onChange={(val) => this.setToolSetting('strokeWidth', val)}
        inputRestrictions={this.props.toolRestrictions.strokeWidth}/>
    )
  }

  renderDropperMode = () => {
    return (
      <ToolSettingsInput
        name='Pixel'
        icon='pixel'
        type='checkbox'
        value={this.getToolSetting('pixelDropper')}
        onChange={() => this.setToolSetting('pixelDropper', !this.getToolSetting('pixelDropper'))}/>
    )
  }

  renderFontFamily = () => {
    return (
      <ToolSettingsInput
        name='Font'
        icon='fontfamily'
        type='dropdown'
        value={this.getToolSetting('fontFamily')}
        onChange={(val) => this.setToolSetting('fontFamily', val)}/>
    )
  }

  renderBrushSize = () => {
    return (
      <ToolSettingsInput
        name='Brush Size'
        icon='brushsize'
        type='numeric'
        value={this.getToolSetting('brushSize')}
        onChange={(val) => this.setToolSetting('brushSize', val)}
        inputRestrictions={this.props.toolRestrictions.brushSize}/>
    )
  }

  /**
   * Returns the value of an editor tool setting.
   * @param  {string} setting Setting value to retrieve
   * @return {string|number} Value of requested setting. Returns undefined if setting does no exist.
   */
  getToolSetting = (setting) => {
    return this.props.toolSettings[setting];
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
}

export default ToolSettings
