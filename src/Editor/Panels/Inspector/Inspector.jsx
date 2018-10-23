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
      dummyColor: "#FFAABB"
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
  }

  handleChange(val) {
    console.log("EYY");
    this.setState(
      {dummySize: val}
    )
  }

  handleColorChange(val) {
    console.log("Color Change");
    this.setState(
      {dummyColor: val}
    )
  }

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
      this.renderNumericSlider({icon:"brushsize",
                                 val: args.val,
                                 onChange: args.onChange})
          )
  }

  renderSmoothness(args) {
    return(
        this.renderNumericSlider({icon:"brushsmoothness",
                                   val: args.val,
                                   onChange: args.onChange})
          )
  }

  renderStrokeSize(args) {
    return(
      this.renderNumericSlider({icon:"strokewidth",
                                val: args.val,
                                onChange: args.onChange})
    )
  }

  renderFillColor(args) {
    return(
        this.renderColorPicker({icon:"fillcolor",
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

  renderCursor() {
    return (
      <InspectorTitle type={"cursor"} title={"Cursor"}/>
    )
  }

  renderBrush() {
    console.log(this.state.dummySize);
    return (
      <div>
        <InspectorTitle type={"brush"} title={"Brush"} />
        <div className="inspector-content">
          {this.renderBrushSize({val:this.state.dummySize, onChange:this.handleChange})}
          {this.renderStrokeSize({val:this.state.dummySize, onChange:this.handleChange})}
          {this.renderSmoothness({val:this.state.dummySize, onChange:this.handleChange})}
          {this.renderFillColor({val:this.state.dummyColor, onChange:this.handleColorChange, id:"inspector-brush-fill-color-picker"})}
          {this.renderStrokeColor({val:this.state.dummyColor, onChange:this.handleColorChange, id:"inspector-brush-stroke-color-picker"})}
        </div>
      </div>
    )
  }

  renderEraser() {
    return (
      <div>
        <InspectorTitle type={"brush"} title={"Brush"} />
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
