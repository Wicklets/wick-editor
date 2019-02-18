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

import PlayButton from 'Editor/Util/PlayButton/PlayButton';
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

    console.log("ACTIVE", this.props.activeTool);

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

  renderToolboxActions = () => {
    let actionGroups = this.props.getToolboxActions();
    let actions = [];

    actionGroups.forEach(
      (actionList) => {
        if (actionList == []) return;
        actionList.forEach(
          (action) => {
            actions.push(action);
          }
        );
        actions.push("break");
      }
    );

    return (
      actions.map(this.renderAction)
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

        <ToolboxBreak className="toolbox-item"/>

      <div className="toolbox-actions-right">
        {this.renderToolboxActions()}
        <div className="toolbox-item">
          <ActionButton
            id='toolbox-undo-button'
            icon='undo'
            color='tool'
            action={this.props.undoAction}
            tooltip='undo'
            tooltipPlace='bottom'
            className='tool-button'/>
        </div>
        <div className="toolbox-item">
          <ActionButton
            id='toolbox-redo-button'
            icon='redo'
            color='tool'
            action={this.props.redoAction}
            tooltip='redo'
            tooltipPlace='bottom'
            className='tool-button'/>
        </div>
      </div>
    </div>
    )
  }
}

export default Toolbox
