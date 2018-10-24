import React, { Component } from 'react';
import './_inspector.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from 'Editor/Util/DockedTitle/DockedTitle';
import InspectorTitle from './InspectorTitle/InspectorTitle';

import InspectorNumericSlider from './InspectorRow/InspectorRowTypes/InspectorNumericSlider';
import InspectorTextInput from './InspectorRow/InspectorRowTypes/InspectorTextInput';
import InspectorNumericInput from './InspectorRow/InspectorRowTypes/InspectorNumericInput';
import InspectorDualNumericInput from './InspectorRow/InspectorRowTypes/InspectorDualNumericInput';
import InspectorSelector from './InspectorRow/InspectorRowTypes/InspectorSelector';
import InspectorColorPicker from './InspectorRow/InspectorRowTypes/InspectorColorPicker';

class Inspector extends Component {
  constructor () {
    super();
    this.state = {
      type: "path",
      dummySize: 10,
      dummyColor: "#FFAABB",
      dummyFonts: [
        {value:"apple",label:"Apple"},
        {value:"banana",label:"Banana"},
        {value:"strawberry",label:"Strawberry"}],
      dummySelectedFont:{value:"apple",label:"Apple"},
      dummyName:"Jiminy",
      pos1: 50,
      pos2: 38,
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleFontChange = this.handleFontChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handlePos1 = this.handlePos1.bind(this);
    this.handlePos2 = this.handlePos2.bind(this);

    this.inspectorContentRenderFunctions = {
      "cursor": this.renderCursor.bind(this),
      "brush": this.renderBrush.bind(this),
      "eraser": this.renderEraser.bind(this),
      "fillbucket": this.renderFillBucket.bind(this),
      "rectangle": this.renderRectangle.bind(this),
      "ellipse": this.renderEllipse.bind(this),
      "line": this.renderLine.bind(this),
      "eyedropper": this.renderEyeDropper.bind(this),
      "text": this.renderText.bind(this),
      "zoom": this.renderZoom.bind(this),
      "pan": this.renderPan.bind(this),
      "frame": this.renderFrame.bind(this),
      "multiframe": this.renderMultiFrame.bind(this),
      "group": this.renderGroup.bind(this),
      "clip": this.renderClip.bind(this),
      "button": this.renderButton.bind(this),
      "multigroup": this.renderMultiGroup.bind(this),
      "path": this.renderPath.bind(this),
      "multipath": this.renderMultiPath.bind(this),
    }
    this.renderDisplay = this.renderDisplay.bind(this);
    this.renderGroupContent = this.renderGroupContent.bind(this);
    this.renderPathContent = this.renderPathContent.bind(this);
  }

  handleChange(val) {
    this.setState(
      {dummySize: val}
    )
  }

  handleColorChange(val) {
    this.setState(
      {dummyColor: val}
    )
  }

  handleFontChange(val) {
    this.setState(
      {dummySelectedFont:val}
    )
  }

  handleNameChange(val) {
    this.setState(
      {dummyName:val.target.value}
    )
  }

  handlePos1(val) {
    this.setState(
      {pos1: val}
    )
  }

  handlePos2(val) {
    this.setState(
      {pos2: val}
    )
  }

  // Inspector Row Types
  renderBrushSize(args) {
    return (
      <InspectorNumericSlider icon="brushsize" val={args.val} onChange={args.onChange} divider={false}/>
    )
  }

  renderSmoothness(args) {
    return (
      <InspectorNumericSlider icon="brushsmoothness" val={args.val} onChange={args.onChange} divider={false}/>
    )
  }

  renderStrokeSize(args) {
    return (
      <InspectorNumericSlider icon="strokewidth" val={args.val} onChange={args.onChange} divider={false}/>
    )
  }

  renderFillColor(args) {
    return(
      <InspectorColorPicker icon="fillcolor" val={args.val} onChange={args.onChange} id={args.id} />
    )
  }

  renderStrokeColor(args) {
    return(
      <InspectorColorPicker icon="strokecolor" val={args.val} onChange={args.onChange} id={args.id} />
    )
  }

  renderBorderRadius(args) {
    return (
      <InspectorNumericInput icon="cornerroundness" val={args.val} onChange={args.onChange} />
    )
  }

  renderFonts(args) {
    return (
      <InspectorSelector icon="fontfamily" value={args.val} options={args.options} onChange={args.onChange} />
    )
  }

  renderFontSize(args) {
    return (
      <InspectorNumericInput icon="fontsize" val={args.val} onChange={args.onChange} />
    )
  }

  renderName(args) {
    return (
      <InspectorTextInput icon="name" val={args.val} onChange={args.onChange} />
    )
  }

  renderFrameLength(args) {
    return (
      <InspectorNumericInput icon="framelength" val={args.val} onChange={args.onChange} />
    )
  }

  renderPosition(args) {
    return (
      <InspectorDualNumericInput icon="position" val1={args.val1} val2={args.val2} onChange1={args.onChange1} onChange2={args.onChange2} divider={true} />
    )
  }

  renderSize(args) {
    return (
      <InspectorDualNumericInput icon="size" val1={args.val1} val2={args.val2} onChange1={args.onChange1} onChange2={args.onChange2} divider={true} />

    )
  }

  renderScale(args) {
    return (
      <InspectorDualNumericInput icon="scale" val1={args.val1} val2={args.val2} onChange1={args.onChange1} onChange2={args.onChange2} divider={true} />
    )
  }

  renderRotation(args) {
    return (
      <InspectorNumericInput icon="rotation" val={args.val} onChange={args.onChange} />
    )
  }

  renderOpacity(args) {
    return (
      <InspectorNumericInput icon="opacity" val={args.val} onChange={args.onChange} />
    )
  }

  // Selection contents and properties
  renderCursor() {
    return (
      <InspectorTitle type={"cursor"} title={"Cursor"}/>
    )
  }

  renderBrush() {
    return (
      <div>
        <InspectorTitle type={"brush"} title={"Brush"} />
        <div className="inspector-content">
          {this.renderBrushSize({val:this.state.dummySize, onChange:this.handleChange})}
          {this.renderSmoothness({val:this.state.dummySize, onChange:this.handleChange})}
          {this.renderFillColor({val:this.state.dummyColor, onChange:this.handleColorChange, id:"inspector-brush-fill-color-picker"})}
        </div>
      </div>
    )
  }

  renderEraser() {
    return (
      <div>
        <InspectorTitle type={"eraser"} title={"Eraser"} />
        <div className="inspector-content">
          {this.renderBrushSize({val:this.state.dummySize, onChange:this.handleChange})}
        </div>
      </div>
    )
  }

  renderFillBucket() {
    return (
      <div>
        <InspectorTitle type={"fillbucket"} title={"Fill Bucket"} />
        <div className="inspector-content">
          {this.renderFillColor({val:this.state.dummyColor, onChange:this.handleColorChange, id:"inspector-brush-fill-color-picker"})}
        </div>
      </div>
    )
  }

  renderRectangle() {
    return (
      <div>
        <InspectorTitle type={"rectangle"} title={"Rectangle"} />
        <div className="inspector-content">
          {this.renderStrokeSize({val:this.state.dummySize, onChange:this.handleChange})}
          {this.renderFillColor({val:this.state.dummyColor, onChange:this.handleColorChange, id:"inspector-brush-fill-color-picker"})}
          {this.renderStrokeColor({val:this.state.dummyColor, onChange:this.handleColorChange, id:"inspector-brush-fill-color-picker"})}
          {this.renderBorderRadius({val:this.state.dummySize, onChange:this.handleChange})}
        </div>
      </div>
    )
  }

  renderEllipse() {
    return (
      <div>
        <InspectorTitle type={"ellipse"} title={"Ellipse"} />
        <div className="inspector-content">
          {this.renderStrokeSize({val:this.state.dummySize, onChange:this.handleChange})}
          {this.renderFillColor({val:this.state.dummyColor, onChange:this.handleColorChange, id:"inspector-brush-fill-color-picker"})}
          {this.renderStrokeColor({val:this.state.dummyColor, onChange:this.handleColorChange, id:"inspector-brush-fill-color-picker"})}
        </div>
      </div>
    )
  }

  renderLine() {
    return (
      <div>
        <InspectorTitle type={"line"} title={"Line"} />
        <div className="inspector-content">
          {this.renderStrokeSize({val:this.state.dummySize, onChange:this.handleChange})}
          {this.renderStrokeColor({val:this.state.dummyColor, onChange:this.handleColorChange, id:"inspector-brush-fill-color-picker"})}
        </div>
      </div>
    )
  }

  renderEyeDropper() {
    return (
      <div>
        <InspectorTitle type={"eyedropper"} title={"Eye Dropper"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderText() {
    return (
      <div>
        <InspectorTitle type={"text"} title={"Text"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderZoom() {
    return (
      <div>
        <InspectorTitle type={"zoom"} title={"Zoom"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderPan() {
    return (
      <div>
        <InspectorTitle type={"pan"} title={"Pan"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderFrame() {
    return (
      <div>
        <InspectorTitle type={"frame"} title={"Frame"} />
        <div className="inspector-content">
          {this.renderName({val:this.state.dummyName, onChange:this.handleNameChange})}
          {this.renderFrameLength({val:this.state.dummySize, onChange:this.handleChange})}
        </div>
      </div>
    )
  }

  renderMultiFrame() {
    return (
      <div>
        <InspectorTitle type={"multiframe"} title={"Multiple Frames"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }
  renderGroupContent() {
    return (
      <div className="inspector-content">
        {this.renderName({val:this.state.dummyName, onChange:this.handleNameChange})}
        {this.renderPosition({val1:this.state.pos1, val2:this.state.pos2, onChange1:this.handlePos1, onChange2:this.handlePos2, divider: true})}
        {this.renderSize({val1:this.state.pos1, val2:this.state.pos2, onChange1:this.handlePos1, onChange2:this.handlePos2, divider: true})}
        {this.renderScale({val1:this.state.pos1, val2:this.state.pos2, onChange1:this.handlePos1, onChange2:this.handlePos2, divider: true})}
        {this.renderRotation({val:this.state.dummySize, onChange:this.handleChange})}
        {this.renderOpacity({val:this.state.dummySize, onChange:this.handleChange})}
      </div>
    )
  }
  renderGroup() {
    return (
      <div>
        <InspectorTitle type={"group"} title={"Group"} />
        {this.renderGroupContent()}
      </div>
    )
  }

  renderMultiGroup() {
    return (
      <div>
        <InspectorTitle type={"multigroup"} title={"Multiple Groups"} />
        {this.renderGroupContent()}
      </div>
    )
  }

  renderClip() {
    return (
      <div>
        <InspectorTitle type={"clip"} title={"Clip"} />
        {this.renderGroupContent()}
      </div>
    )
  }

  renderButton() {
    return (
      <div>
        <InspectorTitle type={"button"} title={"Button"} />
        {this.renderGroupContent()}
      </div>
    )
  }

  renderPathContent() {
    return(
      <div className="inspector-content">
        {this.renderName({val:this.state.dummyName, onChange:this.handleNameChange})}
        {this.renderPosition({val1:this.state.pos1, val2:this.state.pos2, onChange1:this.handlePos1, onChange2:this.handlePos2, divider: true})}
        {this.renderSize({val1:this.state.pos1, val2:this.state.pos2, onChange1:this.handlePos1, onChange2:this.handlePos2, divider: true})}
        {this.renderScale({val1:this.state.pos1, val2:this.state.pos2, onChange1:this.handlePos1, onChange2:this.handlePos2, divider: true})}
        {this.renderRotation({val:this.state.dummySize, onChange:this.handleChange})}
        {this.renderOpacity({val:this.state.dummySize, onChange:this.handleChange})}
        {this.renderStrokeSize({val1:this.state.pos1, val2:this.state.pos2, onChange1:this.handlePos1, onChange2:this.handlePos2, divider: true})}
        {this.renderFillColor({val:this.state.dummyColor, onChange:this.handleColorChange, id:"inspector-brush-fill-color-picker"})}
        {this.renderStrokeColor({val:this.state.dummyColor, onChange:this.handleColorChange, id:"inspector-brush-fill-color-picker"})}
      </div>
    )
  }

  renderPath() {
    return (
      <div>
        <InspectorTitle type={"path"} title={"Path"} />
        {this.renderPathContent()}
      </div>
    )
  }

  renderMultiPath() {
    return (
      <div>
        <InspectorTitle type={"multipath"} title={"Multiple Paths"} />
        {this.renderPathContent()}
      </div>
    )
  }

  renderUnknown() {
    return (
      <div>
        <InspectorTitle type={"unknown"} title={"Unknown"} />
        <div className="inspector-content">
        </div>
      </div>
    )
  }

  renderDisplay() {
    if (this.state.type in this.inspectorContentRenderFunctions){
      let renderFunction = this.inspectorContentRenderFunctions[this.state.type];
      return(renderFunction());
    } else {
      this.renderUnknown();
    }
  }

  render() {
    return(
      <div className="docked-pane inspector">
        <DockedTitle title={"Inspector"}></DockedTitle>
        {this.renderDisplay()}
      </div>
    )
  }
}

export default Inspector
