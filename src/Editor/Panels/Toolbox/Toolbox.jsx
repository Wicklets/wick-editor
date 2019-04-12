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
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
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
      setToolSettings: this.props.setToolSettings,
      className: 'toolbox-item',
    }

    // List of callbacks to call on Scroll.
    this.scrollFns = [];
  }

  onComponentUpdate = () => {
    this.toolButtonProps.activeTool = this.props.activeTool;
  }

  renderAction = (action, i) => {
    if (action === 'break') {
      return (
        <ToolboxBreak className="toolbox-item"/>
      );
    }
    return(
      <ToolButton
        activeTool={this.props.activeTool}
        toolSettings={this.props.toolSettings}
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
      action={action.action}  
      name={action.icon} 
      tooltip={action.toolTip} />
    );
  }

  render() {
    return(
      <div
        className="tool-box">
        <ToolButton activeTool={this.props.activeTool} toolSettings={this.props.toolSettings} {...this.toolButtonProps} name='cursor' tooltip="Cursor" />
        <ToolButton activeTool={this.props.activeTool} toolSettings={this.props.toolSettings} {...this.toolButtonProps} name='brush' tooltip="Brush" />
        <ToolButton activeTool={this.props.activeTool} toolSettings={this.props.toolSettings} {...this.toolButtonProps} name='pencil' tooltip="Pencil" />
        <ToolButton activeTool={this.props.activeTool} toolSettings={this.props.toolSettings} {...this.toolButtonProps} name='eraser' tooltip="Eraser" />
        <ToolButton activeTool={this.props.activeTool} toolSettings={this.props.toolSettings} {...this.toolButtonProps} name='rectangle' tooltip="Rectangle" />
        <ToolButton activeTool={this.props.activeTool} toolSettings={this.props.toolSettings} {...this.toolButtonProps} name='ellipse' tooltip="Ellipse" />
        <ToolButton activeTool={this.props.activeTool} toolSettings={this.props.toolSettings} {...this.toolButtonProps} name='line' tooltip="Line" />
        <ToolButton activeTool={this.props.activeTool} toolSettings={this.props.toolSettings} {...this.toolButtonProps} name='text' tooltip="Text" />
        <ToolButton activeTool={this.props.activeTool} toolSettings={this.props.toolSettings} {...this.toolButtonProps} name='fillbucket' tooltip="Fill Bucket" />

        <ToolboxBreak className="toolbox-item"/>

        <div className="color-container toolbox-item" id="fill-color-picker-container">
            <WickInput
              type="color"
              color= {this.props.toolSettings.fillColor}
              onChangeComplete={(color) => {
                this.props.setToolSettings({fillColor: color.hex})
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
              color= {this.props.toolSettings.strokeColor}
              onChangeComplete={(color) => {
                this.props.setToolSettings({strokeColor: color.hex})
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
            activeTool={this.props.activeTool}
            toolSettings={this.props.toolSettings}
            setToolSettings={this.props.setToolSettings}
            toolRestrictions={this.props.toolRestrictions} />

      <div className="toolbox-actions-right-container"> 
        <div className="toolbox-actions-right">
          {this.renderToolButtonFromAction(this.props.editorActions.sendToBack)}
          {this.renderToolButtonFromAction(this.props.editorActions.sendBackward)}
          {this.renderToolButtonFromAction(this.props.editorActions.sendToFront)}
          {this.renderToolButtonFromAction(this.props.editorActions.sendForward)}
        </div>

        <ToolboxBreak className="toolbox-item"/>
        
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
