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
import './_toolbox.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import WickInput from 'Editor/Util/WickInput/WickInput';
import ToolboxBreak from './ToolboxBreak/ToolboxBreak';
import ToolButton from './ToolButton/ToolButton';
import ToolSettings from './ToolSettings/ToolSettings';

class Toolbox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openSettings: null,
      popover: null,
    }

    this.toolButtonProps = {
      setActiveTool: this.props.setActiveTool,
      className: 'toolbox-item',
      getActiveToolName: this.props.getActiveToolName,
    }

    // List of callbacks to call on Scroll.
    this.scrollFns = [];
  }

  renderAction = (action, i) => {
    if (action === 'break') {
      return (
        <ToolboxBreak className="toolbox-item"/>
      );
    }
    return(
      <ToolButton
        {...this.toolButtonProps}
        activeTool={this.props.activeToolName}
        action={action.action}
        className='toolbox-item'
        name={action.icon}
        key={i}
        tooltip={action.tooltip} />
    );
  }

  renderToolButtonFromAction = (action) => {
    return (
      <ToolButton
      {...this.toolButtonProps}
      action={action.action}
      name={action.icon}
      tooltip={action.tooltip} />
    );
  }

  render() {
    return(
      <div
        className="tool-box">
        <ToolButton {...this.toolButtonProps} name='cursor' tooltip="Cursor (C)" />
        <ToolButton {...this.toolButtonProps} name='brush' tooltip="Brush (B)" />
        <ToolButton {...this.toolButtonProps} name='pencil' tooltip="Pencil (P)" />
        <ToolButton {...this.toolButtonProps} name='eraser' tooltip="Eraser (E)" />
        <ToolButton {...this.toolButtonProps} name='rectangle' tooltip="Rectangle (R)" />
        <ToolButton {...this.toolButtonProps} name='ellipse' tooltip="Ellipse (O)" />
        <ToolButton {...this.toolButtonProps} name='line' tooltip="Line (L)" />
        <ToolButton {...this.toolButtonProps} name='text' tooltip="Text (T)" />
        <ToolButton {...this.toolButtonProps} name='fillbucket' tooltip="Fill Bucket (F)" />

        <ToolboxBreak className="toolbox-item"/>

        <div className="color-container toolbox-item" id="fill-color-picker-container">
            <WickInput
              type="color"
              color={this.props.getToolSetting('fillColor').toCSS()}
              onChange={(color) => {
                this.props.setToolSetting('fillColor', color);
              }}
              id="tool-box-fill-color"
              tooltipID="tool-box-fill-color"
              tooltip="Fill Color"
              placement="bottom"
              />
          </div>
          <div className="color-container toolbox-item" id="stroke-color-picker-container">
            <WickInput
              type="color"
              color= {this.props.getToolSetting('strokeColor').toCSS()}
              onChange={(color) => {
                this.props.setToolSetting('strokeColor', color);
              }}
              id="tool-box-stroke-color"
              tooltipID="tool-box-stroke-color"
              tooltip="Stroke Color"
              placement="bottom"
              stroke={true}
              />
          </div>

          <ToolboxBreak className="toolbox-item"/>

          <ToolSettings
            activeTool={this.props.activeToolName}
            getToolSetting={this.props.getToolSetting}
            setToolSetting={this.props.setToolSetting}
            getToolSettingRestrictions={this.props.getToolSettingRestrictions} />

      <div className="toolbox-actions-right-container">
        <div className="toolbox-actions-right">
          {this.renderToolButtonFromAction(this.props.editorActions.delete)}
          {this.renderToolButtonFromAction(this.props.editorActions.copy)}
          {this.renderToolButtonFromAction(this.props.editorActions.paste)}
          {this.renderToolButtonFromAction(this.props.editorActions.undo)}
          {this.renderToolButtonFromAction(this.props.editorActions.redo)}
        </div>
      </div>
    </div>
    )
  }
}

export default Toolbox
