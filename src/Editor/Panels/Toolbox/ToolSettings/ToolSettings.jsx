/*
 * Copyright 2020 WICKLETS LLC
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
import PopupMenu from 'Editor/Util/PopupMenu/PopupMenu';

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
      "fillbucket": this.renderFillbucketSettings,
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
      <div className='settings-input-container'></div>
    );
  }

  renderBrushSettings = () => {
    return (
      <div className='settings-input-container'>
        {this.renderBrushSize()}
        {this.renderBrushSmoothing()}
        {this.renderEnablePressure()}
        {this.renderEnableRelativeBrushSize()}
        {this.renderBrushMode()}
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
        {/*this.renderFontSize()*/}
      </div>
    );
  }

  renderFillbucketSettings = () => {
    return (
      <div className='settings-input-container'>
        {this.renderGapFillAmount()}
      </div>
    );
  }

  renderEnablePressure = () => {
    return (
      <ToolSettingsInput renderSize={this.props.renderSize}
        name='Enable Pressure'
        icon='brushpressure'
        type='checkbox'
        value={this.getToolSetting('pressureEnabled')}
        onChange={() => this.setToolSetting('pressureEnabled', !this.getToolSetting('pressureEnabled'))}/>
    )
  }

  renderEnableRelativeBrushSize = () => {
    return (
      <ToolSettingsInput renderSize={this.props.renderSize}
        name='Relative Brush Size'
        icon='brushrelativesize'
        type='checkbox'
        value={this.getToolSetting('relativeBrushSize')}
        onChange={() => this.setToolSetting('relativeBrushSize', !this.getToolSetting('relativeBrushSize'))}/>
    )
  }

  renderBrushMode = () => {
    let brushModeIcon = 'brushmodenone';
    let brushMode = this.props.getToolSetting('brushMode');

    if (brushMode === 'inside') {
      brushModeIcon = 'brushmodeinside';
    } else if (brushMode === 'outside') {
      brushModeIcon = 'brushmodeoutside';
    }

    return (
        <div id="brush-modes-popover-button">
          <ToolSettingsInput renderSize={this.props.renderSize}
            name='Brush Modes'
            icon={brushModeIcon}
            type='checkbox'
            value={this.props.showBrushModes}
            onChange={this.props.toggleBrushModes}/>
          <PopupMenu
            mobile={this.props.isMobile}
            isOpen={this.props.showBrushModes && !this.props.previewPlaying}
            toggle={this.props.toggleBrushModes}
            target="brush-modes-popover-button"
            className={"more-canvas-actions-popover"}>
            <div className="brush-modes-widget">
              <div className='actions-container'>
                <ToolSettingsInput renderSize={this.props.renderSize}
                  name='None'
                  icon='brushmodenone'
                  type='checkbox'
                  value={this.props.getToolSetting('brushMode') === 'none'}
                  onChange={() => this.props.setToolSetting('brushMode', 'none')}/>
                <ToolSettingsInput renderSize={this.props.renderSize}
                  name='Inside'
                  icon='brushmodeinside'
                  type='checkbox'
                  value={this.props.getToolSetting('brushMode') === 'inside'}
                  onChange={() => this.props.setToolSetting('brushMode', 'inside')}/>
                <ToolSettingsInput renderSize={this.props.renderSize}
                  name='Outside'
                  icon='brushmodeoutside'
                  type='checkbox'
                  value={this.props.getToolSetting('brushMode') === 'outside'}
                  onChange={() => this.props.setToolSetting('brushMode', 'outside')}/>
              </div>
            </div>
          </PopupMenu>
        </div>
    )
  }

  renderCornerRadius = () => {
    return (
      <ToolSettingsInput renderSize={this.props.renderSize}
        isMobile={this.props.isMobile}
        name='Corner Radius'
        icon='cornerradius'
        type='numeric'
        value={this.getToolSetting('cornerRadius')}
        onChange={(val) => this.setToolSetting('cornerRadius', val)}
        inputRestrictions={this.props.getToolSettingRestrictions('cornerRadius')}/>
    )
  }

  renderBrushSmoothing = () => {
    return (
      <ToolSettingsInput renderSize={this.props.renderSize}
        isMobile={this.props.isMobile}
        name='Brush Smoothing'
        icon='brushsmoothness'
        type='numeric'
        value={this.getToolSetting('brushStabilizerWeight')}
        onChange={(val) => this.setToolSetting('brushStabilizerWeight', val)}
        inputRestrictions={this.props.getToolSettingRestrictions('brushStabilizerWeight')}/>
    )
  }

  renderFontSize = () => {
    return (
      <ToolSettingsInput renderSize={this.props.renderSize}
        isMobile={this.props.isMobile}
        name='Font Size'
        icon='fontsize'
        type='numeric'
        value={this.getToolSetting('fontSize')}
        onChange={(val) => this.setToolSetting('fontSize', val)}
        inputRestrictions={this.props.getToolSettingRestrictions('fontSize')}/>
    )
  }

  renderEraserSize = () => {
    return (
      <ToolSettingsInput renderSize={this.props.renderSize}
        isMobile={this.props.isMobile}
        name='Eraser Size'
        icon='eraser'
        type='numeric'
        value={this.getToolSetting('eraserSize')}
        onChange={(val) => this.setToolSetting('eraserSize', val)}
        inputRestrictions={this.props.getToolSettingRestrictions('eraserSize')}/>
    )
  }

  renderStrokeWidth = () => {
    return (
      <ToolSettingsInput renderSize={this.props.renderSize}
        isMobile={this.props.isMobile}
        name='Stroke Width'
        icon='strokewidth'
        type='numeric'
        value={this.getToolSetting('strokeWidth')}
        onChange={(val) => this.setToolSetting('strokeWidth', val)}
        inputRestrictions={this.props.getToolSettingRestrictions('strokeWidth')}/>
    )
  }

  renderDropperMode = () => {
    return (
      <ToolSettingsInput renderSize={this.props.renderSize}
        name='Pixel'
        icon='pixel'
        type='checkbox'
        value={this.getToolSetting('pixelDropper')}
        onChange={() => this.setToolSetting('pixelDropper', !this.getToolSetting('pixelDropper'))}/>
    )
  }

  renderFontFamily = () => {
    return (
      <ToolSettingsInput renderSize={this.props.renderSize}
        name='Font'
        icon='fontfamily'
        type='dropdown'
        value={this.getToolSetting('fontFamily')}
        onChange={(val) => this.setToolSetting('fontFamily', val)}/>
    )
  }

  renderBrushSize = () => {
    return (
      <ToolSettingsInput renderSize={this.props.renderSize}
        isMobile={this.props.isMobile}
        name='Brush Size'
        icon='brushsize'
        type='numeric'
        value={this.getToolSetting('brushSize')}
        onChange={(val) => this.setToolSetting('brushSize', val)}
        inputRestrictions={this.props.getToolSettingRestrictions('brushSize')}/>
    )
  }

  renderGapFillAmount = () => {
    return (
      <ToolSettingsInput
        name='Gap Fill Amount'
        icon='gapfillamount'
        type='numeric'
        value={this.getToolSetting('gapFillAmount')}
        onChange={(val) => this.setToolSetting('gapFillAmount', val)}
        inputRestrictions={this.props.getToolSettingRestrictions('gapFillAmount')}/>
    )
  }

  /**
   * Returns the value of an editor tool setting.
   * @param  {string} setting Setting value to retrieve
   * @return {string|number} Value of requested setting. Returns undefined if setting does no exist.
   */
  getToolSetting = (setting) => {
    return this.props.getToolSetting(setting);
  }

  /**
   * Updates the value of a tool setting within the editor.
   * @param {string} setting  Name of the setting to update.
   * @param {string|number} newValue Value to update selected tool setting to.
   */
  setToolSetting = (setting, newValue) => {
    this.props.setToolSetting(setting, newValue);
  }
}

export default ToolSettings
