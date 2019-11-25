import React, { Component } from 'react'

import  ActionButton  from 'Editor/Util/ActionButton/ActionButton';

import './_wickcolorpicker.scss';
import { CustomPicker } from 'react-color';
import WickSwatch from 'Editor/Util/ColorPicker/WickSwatch/WickSwatch'

var { Saturation, Hue, Alpha, Checkboard, Swatch } = require('react-color/lib/components/common');
var { SketchFields } = require('react-color/lib/components/sketch/SketchFields');

class WickColorPicker extends Component {
    renderSwatchColumn = (colorList, i) => {
        return (
            <div key={"swatch-color-column-" + i} className="wick-swatch-picker-column">
                {colorList.map((color,i) => {
                    return (
                        <WickSwatch
                            color={color}
                            onChangeComplete={this.props.onChangeComplete}
                            selectedColor={this.props.color}
                            key={"swatch-color-"+color+"-"+i} />
                    );
                })}
            </div>
        );
    }

    renderSwatchbook = (colors) => {
        return (
            <div className="wick-swatch-picker-book">
                {colors.map((colorList, i) => {
                    return (this.renderSwatchColumn(colorList, i));
                })}
            </div>
        );
    }

    renderSwatches = () => {
        let colors = [
            ["#ff0000","#ffcccc","#ff9999","#ff4d4d","#cc0000","#800000"],
            ["#ff8000","#ffe6cc","#ffcc99","#ffa64d","#cc6600","#804000"],
            ["#ffff00","#ffffcc","#ffff99","#ffff4d","#cccc00","#808000"],
            ["#00ff00","#ccffcc","#99ff99","#4dff4d","#00cc00","#008000"],
            ["#00ff80","#ccffe6","#99ffcc","#4dffa6","#00cc66","#008040"],
            ["#00ffff","#ccffff","#99ffff","#4dffff","#00cccc","#008080"],
            ["#0080ff","#cce6ff","#99ccff","#4da6ff","#0066cc","#004080"],
            ["#0000ff","#ccccff","#9999ff","#4d4dff","#0000cc","#000080"],
            ["#8000ff","#e6ccff","#cc99ff","#a64dff","#6600cc","#400080"],
            ["#ff00ff","#ffccff","#ff99ff","#ff4dff","#cc00cc","#800080"],
            ["#ff0080","#ffcce6","#ff99cc","#ff4da6","#cc0066","#800040"],
            ["#000000","#ffffff","#cccccc","#999999","#666666","#333333"]
        ]

        return (
            <div className="wick-color-picker">
                {this.renderHeader()}
                <div className="wick-swatch-color-picker-body">
                    {this.renderSwatchbook(colors)}
                </div>
            </div>
        );
    }



    renderHeader () {
        return (
            <div className="wick-color-picker-header">
                <div className="wick-color-picker-action-button">
                    <ActionButton
                        color="tool"
                        id="color-picker-swatches-button"
                        tooltip="Swatches"
                        action={() => {this.props.changeColorPickerType("swatches")}}
                        isActive={ () => this.props.colorPickerType === "swatches" }
                        icon="swatches" />
                </div>
                <div className="wick-color-picker-action-button spacer">
                    <ActionButton
                        color="tool"
                        id="color-picker-spectrum-button"
                        tooltip="Spectrum"
                        action={() => {this.props.changeColorPickerType("spectrum")}}
                        isActive={ () => this.props.colorPickerType === "spectrum" }
                        icon="spectrum" />
                </div>
                <div className="color-picker-control-div">
                    <div id="btn-color-picker-close">
                        <ActionButton color="tool" icon="closemodal" action={this.props.toggle}/>
                    </div>
                </div>
            </div>
        );
    }


    renderSwatchContainer = (colors) => {
        return (
            <div className="wick-color-picker-swatches-container">
                {colors.map((color, i) => {
                    return (
                        <div
                            key={"color-swatch-" + color + "-" + i}
                            className="wick-color-picker-small-swatch">
                            <Swatch
                                color={color}
                                onClick={(color) => {this.props.onChangeComplete(color)}}  />
                        </div>
                    );
                })}
            </div>
        );
    }

    renderSpectrum = () => {
        let styles = {
            activeColor: {
                position:'absolute',
                width: "100%",
                height: "100%",
                backgroundColor: this.props.color,
            }
        }

        let colors = ['#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF', '#FFFFFF00']
        let lastUsedColorsDefaults = ["#000000","#000000","#000000","#000000","#000000","#000000","#000000","#000000"]
        let lastColors = this.props.lastColorsUsed || lastUsedColorsDefaults;
        return (
            <div className="wick-color-picker">
                {this.renderHeader()}
                <div className="wick-color-picker-saturation">
                    <Saturation {...this.props}/>
                </div>
                <div className="wick-color-picker-control-body">
                    <div id="btn-color-picker-dropper">
                        <ActionButton
                            icon="eyedropper"
                            id="color-picker-eyedropper"
                            tooltip="Eyedropper"
                            color="tool"
                            action={this.openEyedropper}/>
                    </div>
                    <div id="wick-color-picker-bar-container">
                        <div className="wick-color-picker-control-bar">
                            <Hue {...this.props} height={11}/>
                        </div>
                        <div className="wick-color-picker-control-bar">
                            <Alpha {...this.props} />
                        </div>
                    </div>
                    <div className="wick-color-picker-color-block-container">
                        <Checkboard />
                        <div style={styles.activeColor} />
                    </div>
                </div>
                <SketchFields {...this.props} />
                {this.renderSwatchContainer(colors)}
                {this.renderSwatchContainer(lastColors)}
            </div>
        );
    }

    render () {
        if (this.props.colorPickerType === "swatches" || !this.props.colorPickerType) {
            return this.renderSwatches();
        } else if (this.props.colorPickerType === "spectrum") {
            return this.renderSpectrum();
        };
    }

    openEyedropper = () => {
        window.editor.setActiveTool('eyedropper');
        window.editor._onEyedropperPickedColor = this.props.onChange;
    }
}

export default CustomPicker(WickColorPicker);
