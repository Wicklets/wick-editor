import React, { Component } from 'react';
import './_toolbox.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import ColorPicker from 'Editor/Util/ColorPicker/ColorPicker';
import ToolButton from 'Editor/Util/ToolButton/ToolButton';
import WickInput from 'Editor/Util/WickInput/WickInput';

class Toolbox extends Component {
  constructor (props) {
    super(props);

    this.state = {
      fillColor: "#FF1155",
      strokeColor: "#FFAABB",
    }

    this.iconProps = {
      toolIsActive: this.toolIsActive.bind(this),
      activateTool: this.props.activateTool,
    };

    this.handleFill = this.handleFill.bind(this);
  }

  toolIsActive (toolName) {
    return toolName === this.props.activeTool;
  }

  handleFill(color) {
    console.log(color);
      this.setState(
        {
          fillColor: color.hex,
        }
      )
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
      <div className="color-container" id="fill-color-picker-container" style={{backgroundColor:this.state.fillColor}}>
          <WickInput
            type="color"
            color= {this.state.fillColor}
            onChangeComplete={(color) => this.setState({fillColor: color.hex})}
            id="tool-box-fill-color"
            placement="right"
            />
        </div>
        <div className="color-container" id="stroke-color-picker-container" style={{borderColor:this.state.strokeColor}}>
          <WickInput
            type="color"
            color= {this.state.strokeColor}
            onChangeComplete={(color) => this.setState({strokeColor: color.hex})}
            id="tool-box-stroke-color"
            placement="right"
            />
        </div>
      </div>

    )
  }
}

export default Toolbox
