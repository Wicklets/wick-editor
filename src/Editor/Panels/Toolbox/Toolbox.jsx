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

class Toolbox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openSettings: null,
    }

    this.toolButtonProps = {
      getActiveTool: this.props.getActiveTool,
      setActiveTool: this.props.setActiveTool,
      onScroll: this.addScrollFunction,
      className: 'toolbox-item',
    }

    // List of callbacks to call on Scroll.
    this.scrollFns = [];
  }

  /**
   * Adds a callback function to a list of callback functions to be called on
   * scroll.
   * @param {Function} fn function to be called when this component is scrolled.
   */
  addScrollFunction = (fn) => {
    this.scrollFns.push(fn);
  }

  /**
   * Calls all callback functions for child components if they exists when
   * scrolled.
   * @param  {DOM Event} e Scroll event.
   */
  onScroll = (e) => {
    this.scrollFns.forEach(fn => {
      fn();
    });
  }

  render() {
    return(
      <div
        className="tool-box"
        onScroll={this.onScroll}>
        <ToolButton {...this.toolButtonProps} name='cursor' tooltip="Cursor" />
        <ToolButton {...this.toolButtonProps} name='brush' tooltip="Brush" />
        <ToolButton {...this.toolButtonProps} name='pencil' tooltip="Pencil" />
        <ToolButton {...this.toolButtonProps} name='eraser' tooltip="Eraser" />
        <ToolButton {...this.toolButtonProps} name='rectangle' tooltip="Rectangle" />
        <ToolButton {...this.toolButtonProps} name='ellipse' tooltip="Ellipse" />
        <ToolButton {...this.toolButtonProps} name='line' tooltip="Line" />
        <ToolButton {...this.toolButtonProps} name='text' tooltip="Text" />
        <ToolButton {...this.toolButtonProps} name='pan' tooltip="Pan" />
        <ToolButton {...this.toolButtonProps} name='zoom' tooltip="Zoom" />
        <ToolButton {...this.toolButtonProps} name='fillbucket' tooltip="Fill Bucket" />

      <div className="color-container toolbox-item" id="fill-color-picker-container">
          <WickInput
            type="color"
            color= {this.props.getToolSettings().fillColor}
            onChangeComplete={(color) => {
              this.props.setToolSettings({fillColor: color.hex})
            }}
            id="tool-box-fill-color"
            placement="bottom"
            />
        </div>
        <div className="color-container toolbox-item" id="stroke-color-picker-container">
          <WickInput
            type="color"
            color= {this.props.getToolSettings().strokeColor}
            onChangeComplete={(color) => {
              this.props.setToolSettings({strokeColor: color.hex})
            }}
            id="tool-box-stroke-color"
            placement="bottom"
            stroke={true}
            />
        </div>

        <ToolboxBreak className="toolbox-item"/>

        <div className="toolbox-actions-center toolbox-item">
          <ActionButton
            id='toolbox-undo-button'
            icon='undo'
            color='tool'
            action={this.props.undoAction}
            tooltip='undo'
            tooltipPlace='bottom'
            className='tool-button'/>
        </div>
        <div className="toolbox-actions-center toolbox-item">
          <ActionButton
            id='toolbox-redo-button'
            icon='redo'
            color='tool'
            action={this.props.redoAction}
            tooltip='redo'
            tooltipPlace='bottom'
            className='tool-button'/>
        </div>

        <div className="toolbox-actions-right toolbox-item">
          <PlayButton
            className="play-button tool-button"
            playing={this.props.previewPlaying}
            onClick={this.props.togglePreviewPlaying}/>
        </div>

      </div>
    )
  }
}

export default Toolbox
