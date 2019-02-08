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

import ToolButton from 'Editor/Util/ToolButton/ToolButton';
import PlayButton from 'Editor/Util/PlayButton/PlayButton';
import WickInput from 'Editor/Util/WickInput/WickInput';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import { Scrollbars } from 'react-custom-scrollbars';

class Toolbox extends Component {
  constructor (props) {
    super(props);

    this.iconProps = {
      toolIsActive: this.toolIsActive.bind(this),
      setActiveTool: this.props.setActiveTool,
    };
  }

  toolIsActive (toolName) {
    return toolName === this.props.getActiveTool();
  }

  render() {
    return(
      <div className="tool-box">
        <ToolButton
          name="cursor"
          tooltip="Cursor"
          {...this.iconProps}
        />
        <ToolButton
          name="brush"
          tooltip="Brush"
          {...this.iconProps}
        />
        <ToolButton
          name="pencil"
          tooltip="Pencil"
          {...this.iconProps}
        />
        <ToolButton
          name="eraser"
          tooltip="Eraser"
          {...this.iconProps}
        />
        <ToolButton
          name="rectangle"
          tooltip="Rectangle"
          {...this.iconProps}
        />
        <ToolButton
          name="ellipse"
          tooltip="Ellipse"
          {...this.iconProps}
        />
        <ToolButton
          name="line"
          tooltip="Line"
          {...this.iconProps}
        />
        <ToolButton
          name="text"
          tooltip="Text"
          {...this.iconProps}
        />
        {/*<ToolButton
          name="eyedropper"
          tooltip="Eyedropper"
          {...this.iconProps}
        />*/}
        <ToolButton
          name="pan"
          tooltip="Pan"
          {...this.iconProps}
        />
        <ToolButton
          name="zoom"
          tooltip="Zoom"
          {...this.iconProps}
        />
        <ToolButton
          name="fillbucket"
          tooltip="Fill Bucket"
          {...this.iconProps}
        />
        {/*<ToolButton
          name="text"
          {...this.iconProps}
        />*/}

      <div className="color-container" id="fill-color-picker-container">
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
        <div className="color-container" id="stroke-color-picker-container">
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

        <div className="toolbox-actions-right">
          <div className="toolbox-action-button">
            <ActionButton
              id='toolbox-undo-button'
              icon='undo'
              color='tool'
              action={this.props.undoAction}
              tooltip='undo'
              tooltipPlace='bottom'/>
          </div>
          <div className="toolbox-action-button">
            <ActionButton
              id='toolbox-redo-button'
              icon='redo'
              color='tool'
              action={this.props.redoAction}
              tooltip='redo'
              tooltipPlace='bottom'/>
          </div>
          <div className="toolbox-action-button">
            <PlayButton
              className="play-button"
              playing={this.props.previewPlaying}
              onClick={this.props.togglePreviewPlaying}/>
          </div>
        </div>
      </div>
    )
  }
}

export default Toolbox
