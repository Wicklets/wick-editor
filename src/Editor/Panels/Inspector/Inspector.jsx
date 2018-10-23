import React, { Component } from 'react';
import './_inspector.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import DockedTitle from 'Editor/Util/DockedTitle/DockedTitle';
import InspectorTitle from './InspectorTitle/InspectorTitle';
import InspectorRow from './InspectorRow/InspectorRow';

class Inspector extends Component {
  constructor () {
    super();
    this.state = {
      type: "brush",
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
  renderNumericSlider(args) {
    return(
      <div className="inspector-row">
        <InspectorRow icon={args.icon}
                      input1={
                        {type: "numeric",
                        value: args.val,
                        onChange: args.onChange}
                      }
                      input2={
                        {type: "slider",
                         value: args.val,
                         onChange: args.onChange}
                       }
                       divider={false}/>
      </div>
    )
  }

  renderTextInput(args) {
    return (
      <div className="inspector-row">
        <InspectorRow
          icon={args.icon}
          input1={
            {type: "text",
             value: args.val,
             onChange: args.onChange}
          }
          />

      </div>
    )
  }

  renderNumericInput(args) {
    return(
      <div className="inspector-row">
        <InspectorRow icon={args.icon}
                      input1={
                        {type: "numeric",
                        value: args.val,
                        onChange: args.onChange}
                      }/>
      </div>
    )
  }

  renderDualNumericInput(args) {
    return (
      <div className="inspector-row">
        <InspectorRow
          icon={args.icon}
          input1={
            {
              type:"numeric",
              value: args.val1,
              onChange: args.onChange1,
            }
          }
          input2={
            {
              type:"numeric",
              value: args.val2,
              onChange: args.onChange2,
            }
          }
          divider={args.divider}
          />
      </div>
    )
  }

  renderSelector(args) {
    return(
      <div className="inspector-row">
        <InspectorRow icon={args.icon}
                      input1={
                        {type: "select",
                         defaultValue: args.value,
                         options: args.options,
                         onChange: args.onChange,
                         className: "select-inspector"}
                      }/>
      </div>
    )
  }

  renderColorPicker(args) {
    return (
      <div className="inspector-row">
        <InspectorRow icon={args.icon}
                        input1={{type: "color",
                                 color: args.val,
                                 onChangeComplete: args.onChange,
                                 id: args.id}}
                        />
      </div>
    )
  }

  renderBrushSize(args) {
    return(
      this.renderNumericSlider({
        icon:"brushsize",
        val: args.val,
        onChange: args.onChange})
    )
  }

  renderSmoothness(args) {
    return(
        this.renderNumericSlider({
          icon:"brushsmoothness",
          val: args.val,
          onChange: args.onChange})
    )
  }

  renderStrokeSize(args) {
    return(
      this.renderNumericSlider({
        icon:"strokewidth",
        val: args.val,
        onChange: args.onChange})
    )
  }

  renderFillColor(args) {
    return(
        this.renderColorPicker({
          icon:"fillcolor",
          val: args.val,
          onChange: args.onChange,
          id: args.id})
    )
  }

  renderStrokeColor(args) {
    return(
      this.renderColorPicker({
        icon:"strokecolor",
        val: args.val,
        onChange: args.onChange,
        id: args.id})
    )
  }

  renderBorderRadius(args) {
    return (
      this.renderNumericInput({
        icon:"cornerroundness",
        val: args.val,
        onChange: args.onChange,
      })
    )
  }

  renderFonts(args) {
    return (
      this.renderSelector({
        icon:"fontfamily",
        value:args.val,
        options:args.options,
        onChange: args.onChange,
      })
    )
  }

  renderFontSize(args) {
    return (
      this.renderNumericInput({
        icon:"fontsize",
        val: args.val,
        onChange: args.onChange,
      })
    )
  }

  renderName(args) {
    return (
      this.renderTextInput({
        icon:"name",
        val: args.val,
        onChange: args.onChange,
      })
    )
  }

  renderFrameLength(args) {
    return (
      this.renderNumericInput({
        icon:"framelength",
        val: args.val,
        onChange: args.onChange,
      })
    )
  }

  renderPosition(args) {
    return (
      this.renderDualNumericInput( {
        icon:"position",
        val1: args.val1,
        val2: args.val2,
        onChange1: args.onChange1,
        onChange2: args.onChange2,
        divider: true,
        }
      )
    )
  }

  renderSize(args) {
    return (
      this.renderDualNumericInput( {
        icon:"size",
        val1: args.val1,
        val2: args.val2,
        onChange1: args.onChange1,
        onChange2: args.onChange2,
        divider: true,
        }
      )
    )
  }

  renderScale(args) {
    return (
      this.renderDualNumericInput( {
        icon:"scale",
        val1: args.val1,
        val2: args.val2,
        onChange1: args.onChange1,
        onChange2: args.onChange2,
        divider: true,
        }
      )
    )
  }

  renderRotation(args) {
    return (
      this.renderNumericInput({
        icon:"rotation",
        val: args.val,
        onChange: args.onChange,
      })
    )
  }

  renderOpacity(args) {
    return (
      this.renderNumericInput({
        icon:"opacity",
        val: args.val,
        onChange: args.onChange,
      })
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
        <InspectorTitle type={"brush"} title={"Brush"} />
        <div className="inspector-content">
          {this.renderBrushSize({val:this.state.dummySize, onChange:this.handleChange})}
        </div>
      </div>
    )
  }

  renderDisplay() {
    if (this.state.type === "cursor") {
      return(this.renderCursor());
    } else if (this.state.type === "brush") {
      return(this.renderBrush());
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
