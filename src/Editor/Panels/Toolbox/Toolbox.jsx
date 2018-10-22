import React, { Component } from 'react';
import './_toolbox.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import ColorPicker from 'Editor/Util/ColorPicker/ColorPicker';
import ToolButton from 'Editor/Util/ToolButton/ToolButton';

class Toolbox extends Component {
  constructor (props) {
    super(props);

    this.iconProps = {
      toolIsActive: this.toolIsActive.bind(this),
      activateTool: this.props.activateTool,
    };
  }

  toolIsActive (toolName) {
    return toolName === this.props.activeTool;
  }

  render() {
    return(
      <div className="docked-pane tool-box">
        <ToolButton
          name="croquisBrush"
          {...this.iconProps}
        />
        <ToolButton
          name="cursor"
          {...this.iconProps}
        />
        <ToolButton
          name="ellipse"
          {...this.iconProps}
        />
        <ToolButton
          name="eraser"
          {...this.iconProps}
        />
        <ToolButton
          name="eyedropper"
          {...this.iconProps}
        />
        <ToolButton
          name="fillBucket"
          {...this.iconProps}
        />
        <ToolButton
          name="line"
          {...this.iconProps}
        />
        <ToolButton
          name="pan"
          {...this.iconProps}
        />
        <ToolButton
          name="pencil"
          {...this.iconProps}
        />
        <ToolButton
          name="potraceBrush"
          {...this.iconProps}
        />
        <ToolButton
          name="rectangle"
          {...this.iconProps}
        />
        <ToolButton
          name="text"
          {...this.iconProps}
        />
        <ToolButton
          name="zoom"
          {...this.iconProps}
        />
        <ColorPicker
          id="fill-color-picker"
          placement={'right'}
          color={this.props.fillColor}
          onColorChange={(color) => {
            console.log(color);
          }}
        />
        <ColorPicker
          id="stroke-color-picker"
          placement={'right'}
          color={this.props.strokeColor}
          onColorChange={(color) => {
            console.log(color);
          }}
        />
      </div>
    )
  }
}

export default Toolbox
