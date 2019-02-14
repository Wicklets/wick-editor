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

import { Popover, PopoverBody } from 'reactstrap';

import ToolSettingsInput from '../ToolSettingsInput/ToolSettingsInput';

class ToolSettingsPopover extends Component {
  constructor(props) {
    super(props);

    this.state = {
      popoverOpen: false,
    }

    this.settingsFunctions = {
      "cursor": this.renderCursorSettings,
      "brush": this.renderBrushSettings,
      "pencil": this.renderPencilSettings,
      "eraser": this.renderEraserSettings,
      "rectangle": this.renderRectangleSettings,
      "ellipse": this.renderEllipseSettings,
      "line": this.renderLineSettings,
      "text": this.renderTextSettings,
      "pan": this.renderPanSettings,
      "zoom": this.renderZoomSettings,
      "fillbucket": this.renderFillBucketSettings,
    }
  }

  togglePopover = () => {
    this.props.setPopover(null);
  }

  renderSettings = () => {
    if (this.props.name in this.settingsFunctions) {
      return this.settingsFunctions[this.props.name]();
    }

    return (
      <div className="default">DEFAULT</div>
    )
  }

  render () {
    return (
      <Popover
        placement='bottom'
        isOpen={this.props.isOpen(this.props.name)}
        target={"tool-settings-" + this.props.name}
        toggle={this.togglePopover}
        boundariesElement={'viewport'}>
        <PopoverBody>{this.renderSettings()}</PopoverBody>
      </Popover>
    );
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
        {this.renderEnablePressure()}
        {this.renderBrushSmoothing()}
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
        {this.renderFontFamily()}
      </div>
    );
  }

  renderPanSettings = () => {
    return (
      <div className='settings-input-container'>
      </div>
    );
  }

  renderZoomSettings = () => {
    return (
      <div className='settings-input-container'>
      </div>
    );
  }

  renderFillBucketSettings = () => {
    return (
      <div className='settings-input-container'>
      </div>
    );
  }

  renderEnablePressure = () => {
    return (
      <ToolSettingsInput
        name='Enable Pressure'
        type='checkbox'
        value={this.getToolSetting('pressureEnabled')}
        onChange={() => this.setToolSetting('pressureEnabled', !this.getToolSetting('pressureEnabled'))}/>
    )
  }

  renderSelectCurves = () => {
    return (
      <ToolSettingsInput
        name='Select Curves'
        type='checkbox'
        value={this.getToolSetting('selectCurves')}
        onChange={() => this.setToolSetting('selectCurves', !this.getToolSetting('selectCurves'))}/>
    )
  }

  renderSelectPoints = () => {
    return (
      <ToolSettingsInput
        name='Select Points'
        type='checkbox'
        value={this.getToolSetting('selectPoints')}
        onChange={() => this.setToolSetting('selectPoints', !this.getToolSetting('selectPoints'))}/>
    )
  }

  renderCornerRadius = () => {
    return (
      <ToolSettingsInput
        name='Corner Radius'
        type='numeric'
        value={this.getToolSetting('cornerRadius')}
        onChange={(val) => this.setToolSetting('cornerRadius', val)}/>
    )
  }

  renderBrushSmoothing = () => {
    return (
      <ToolSettingsInput
        name='Brush Smoothing'
        type='numeric'
        value={this.getToolSetting('brushSmoothing')}
        onChange={(val) => this.setToolSetting('brushSmoothing', val)}/>
    )
  }

  renderFontSize = () => {
    return (
      <ToolSettingsInput
        name='Font Size'
        type='numeric'
        value={this.getToolSetting('fontSize')}
        onChange={(val) => this.setToolSetting('fontSize', val)}/>
    )
  }

  renderEraserSize = () => {
    return (
      <ToolSettingsInput
        name='Eraser Size'
        type='numeric'
        value={this.getToolSetting('eraserSize')}
        onChange={(val) => this.setToolSetting('eraserSize', val)}/>
    )
  }

  renderStrokeWidth = () => {
    return (
      <ToolSettingsInput
        name='Stroke Width'
        type='numeric'
        value={this.getToolSetting('strokeWidth')}
        onChange={(val) => this.setToolSetting('strokeWidth', val)}/>
    )
  }

  renderDropperMode = () => {
    return (
      <ToolSettingsInput
        name='Pixel Select'
        type='checkbox'
        value={this.getToolSetting('pixelDropper')}
        onChange={() => this.setToolSetting('pixelDropper', !this.getToolSetting('pixelDropper'))}/>
    )
  }

  renderFontFamily = () => {
    return (
      <ToolSettingsInput
        name='Font Family'
        type='dropdown'
        value={this.getToolSetting('fontFamily')}
        onChange={(val) => this.setToolSetting('fontFamily', val)}/>
    )
  }

  renderBrushSize = () => {
    return (
      <ToolSettingsInput
        name='Brush Size'
        type='numeric'
        value={this.getToolSetting('brushSize')}
        onChange={(val) => this.setToolSetting('brushSize', val)}/>
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

export default ToolSettingsPopover
