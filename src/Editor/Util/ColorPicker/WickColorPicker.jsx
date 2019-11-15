import React, { Component } from 'react'

import { ColorWrap, } from 'react-color';
import  ActionButton  from 'Editor/Util/ActionButton/ActionButton';

import './_wickcolorpicker.scss';
import { CustomPicker, SwatchesPicker } from 'react-color';

var { Saturation, Hue, Alpha, Checkboard, Swatches, Swatch } = require('react-color/lib/components/common');
var { SketchFields } = require('react-color/lib/components/sketch/SketchFields');

class WickColorPicker extends Component {
    renderSwatches = () => {
        return (
            <SwatchesPicker {...this.props} />
        );
    }

    renderSwatchContainer = (colors) => {
        return (
            <div className="wick-color-picker-swatches-container">
                {colors.map((color, i) => {
                    return (
                        <div key={"color-swatch-" + color + "-" + i} className="wick-color-picker-small-swatch">
                            <Swatch  
                                color={color}
                                onClick={(color) => {this.props.onChangeComplete(color)}}  />
                        </div>
                    );
                })}
            </div>
        );
    }

    renderHeader () {
        return (
            <div className="wick-color-picker-header">
                <div className="wick-color-picker-action-button">
                    <ActionButton action={() => {this.props.changeColorPickerType("swatches")}} text="S" />
                </div>
                <div className="wick-color-picker-action-button spacer">
                    <ActionButton action={() => {this.props.changeColorPickerType("spectrum")}} text="Sp" />
                </div>
                <div className="color-picker-control-div">
                    <div id="btn-color-picker-close">
                        <ActionButton icon="closemodal" action={this.props.toggle}/>
                    </div>
                </div>
            </div>
        );
    }

    renderSpectrum = () => {
        let styles = {
            activeColor: {
                width: "100%",
                height: "100%",
                borderRadius: '2px',
                backgroundColor: this.props.hex,
            }
        }

        let colors = ['#D0021B', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF']
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
                            action={() => {console.log("Open Eyedropper")}}/>
                    </div>
                    <div id="wick-color-picker-bar-container">
                        <div className="wick-color-picker-control-bar">
                            <Hue {...this.props} />
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
}

export default CustomPicker(WickColorPicker);