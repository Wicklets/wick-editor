import React, { Component } from 'react'

import { ColorWrap, } from 'react-color';
import  ActionButton  from 'Editor/Util/ActionButton/ActionButton';

import './_wickcolorpicker.scss';
import { CustomPicker, SwatchesPicker } from 'react-color';

var { Saturation, Hue, Alpha, Checkboard, Swatches, Swatch } = require('react-color/lib/components/common');

class WickColorPicker extends Component {
    constructor (props) {
        super(props);
    }

    renderSwatches = () => {
        return (
            <SwatchesPicker {...this.props} />
        );
    }

    renderHeader () {
        return (
            <div className="wick-color-picker-header">
                <ActionButton action={() => {this.props.changeColorPickerType("swatches")}} text="S" />
                <ActionButton action={() => {this.props.changeColorPickerType("spectrum")}} text="Sp" />
                <div className="color-picker-control-div">
                    <div id="btn-color-picker-close">
                        <ActionButton icon="closemodal" action={this.props.toggle}/>
                    </div>
                </div>
            </div>
        );
    }

    renderSpectrum = () => {
        let rgb = this.props.rgb;

        let styles = {
            activeColor: {
                width: "100%",
                height: "100%",
                borderRadius: '2px',
                backgroundColor: this.props.hex,
            }
        }

        return (
            <div className="wick-color-picker">
                {this.renderHeader()}
                <div className="wick-color-picker-saturation">
                    <Saturation {...this.props}/>
                </div>
                <div className="wick-color-picker-control-body">
                    <div id="btn-color-picker-dropper">
                        <ActionButton icon="eyedropper"/>
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
                <div className="wick-color-picker-swatches-container">
                    <Swatch 
                        onChangeComplete={this.props.onChangeComplete} 
                        color='#D0021B'
                        onClick={(evt) => {console.log(evt)}}  />
                    {/* <Swatches {...this.props} colors={[
                        ['#D0021B', '#F5A623', '#F8E71C'], 
                        ['#8B572A', '#7ED321', '#417505'],
                        ['#BD10E0', '#9013FE', '#4A90E2'], 
                        ['#50E3C2', '#B8E986', '#000000'],
                        ['#4A4A4A', '#9B9B9B', '#FFFFFF']
                    ]} /> */}
                </div>
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