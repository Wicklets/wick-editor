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

class Toolbox extends Component {
  renderToolButton = (name, tooltip) => {
    return (
      <ActionButton
        color="tool"
        isActive={ () => this.props.getActiveTool() === name }
        id={"tool-button-" + name}
        tooltip={tooltip}
        action={ () => this.props.setActiveTool(name) }
        tooltipPlace="bottom"
        icon={name}
        className="tool-button toolbox-item"/>
    )
  }

  render() {
    return(
      <div className="tool-box">
        {this.renderToolButton('cursor', "Cursor")}
        {this.renderToolButton('brush', "Brush")}
        {this.renderToolButton('pencil', "Pencil")}
        {this.renderToolButton('eraser', "Eraser")}
        {this.renderToolButton('rectangle', "Rectangle")}
        {this.renderToolButton('ellipse', "Ellipse")}
        {this.renderToolButton('line', "Line")}
        {this.renderToolButton('text', "Text")}
        {/*{this.renderToolButton('eyedropper', "Eyedropper")}*/}
        {this.renderToolButton('pan', "Pan")}
        {this.renderToolButton('zoom', "Zoom")}
        {this.renderToolButton('fillbucket', "Fill Bucket")}

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

        <ToolboxBreak />

        <div className="toolbox-actions-center">
          <div className="toolbox-action-button toolbox-item">
            <ActionButton
              id='toolbox-undo-button'
              icon='undo'
              color='tool'
              action={this.props.undoAction}
              tooltip='undo'
              tooltipPlace='bottom'
              className='tool-button'/>
          </div>
          <div className="toolbox-action-button toolbox-item">
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
        <div className="toolbox-actions-right">
          <div className="toolbox-action-button toolbox-item">
            <PlayButton
              className="play-button tool-button"
              playing={this.props.previewPlaying}
              onClick={this.props.togglePreviewPlaying}/>
          </div>
        </div>
      </div>
    )
  }
}

export default Toolbox
