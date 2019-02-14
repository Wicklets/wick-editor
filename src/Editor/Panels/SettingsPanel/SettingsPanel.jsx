import React, { Component } from 'react';

import SettingsPanelInput from './SettingsPanelInput/SettingsPanelInput';

import './_settingspanel.scss';

class SettingsPanel extends Component {
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
      "fillbucket": this.renderFillBucketSettings,
    }
  }

  render () {
    return (
      <div id='settings-panel-container'>
        {this.props.activeTool in this.settingsFunctions && this.renderSettingsHeader()}
        {this.renderSettings()}
      </div>
    );
  }

  renderSettingsHeader = () => {
    return (
      <div className="settings-container-header">
        Tool Options
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
      <SettingsPanelInput
        name='Enable Pressure'
        type='checkbox'
        value={this.getToolSetting('pressureEnabled')}
        onChange={() => this.setToolSetting('pressureEnabled', !this.getToolSetting('pressureEnabled'))}/>
    )
  }

  renderSelectCurves = () => {
    return (
      <SettingsPanelInput
        name='Select Curves'
        type='checkbox'
        value={this.getToolSetting('selectCurves')}
        onChange={() => this.setToolSetting('selectCurves', !this.getToolSetting('selectCurves'))}/>
    )
  }

  renderSelectPoints = () => {
    return (
      <SettingsPanelInput
        name='Select Points'
        type='checkbox'
        value={this.getToolSetting('selectPoints')}
        onChange={() => this.setToolSetting('selectPoints', !this.getToolSetting('selectPoints'))}/>
    )
  }

  renderCornerRadius = () => {
    return (
      <SettingsPanelInput
        name='Corner Radius'
        type='numeric'
        value={this.getToolSetting('cornerRadius')}
        onChange={(val) => this.setToolSetting('cornerRadius', val)}/>
    )
  }

  renderBrushSmoothing = () => {
    return (
      <SettingsPanelInput
        name='Brush Smoothing'
        type='numeric'
        value={this.getToolSetting('brushSmoothing')}
        onChange={(val) => this.setToolSetting('brushSmoothing', val)}/>
    )
  }

  renderFontSize = () => {
    return (
      <SettingsPanelInput
        name='Font Size'
        type='numeric'
        value={this.getToolSetting('fontSize')}
        onChange={(val) => this.setToolSetting('fontSize', val)}/>
    )
  }

  renderEraserSize = () => {
    return (
      <SettingsPanelInput
        name='Eraser Size'
        type='numeric'
        value={this.getToolSetting('eraserSize')}
        onChange={(val) => this.setToolSetting('eraserSize', val)}/>
    )
  }

  renderStrokeWidth = () => {
    return (
      <SettingsPanelInput
        name='Stroke Width'
        type='numeric'
        value={this.getToolSetting('strokeWidth')}
        onChange={(val) => this.setToolSetting('strokeWidth', val)}/>
    )
  }

  renderDropperMode = () => {
    return (
      <SettingsPanelInput
        name='Pixel Select'
        type='checkbox'
        value={this.getToolSetting('pixelDropper')}
        onChange={() => this.setToolSetting('pixelDropper', !this.getToolSetting('pixelDropper'))}/>
    )
  }

  renderFontFamily = () => {
    return (
      <SettingsPanelInput
        name='Font Family'
        type='dropdown'
        value={this.getToolSetting('fontFamily')}
        onChange={(val) => this.setToolSetting('fontFamily', val)}/>
    )
  }

  renderBrushSize = () => {
    return (
      <SettingsPanelInput
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

export default SettingsPanel
