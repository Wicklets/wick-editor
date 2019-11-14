import React, { Component } from 'react'

import { ColorWrap, } from 'react-color';
import  ActionButton  from 'Editor/Util/ActionButton/ActionButton';

import './_wickcolorpicker.scss';
import { CustomPicker } from 'react-color';

var { Saturation, Hue, Alpha, Checkboard} = require('react-color/lib/components/common');

class WickColorPicker extends Component {
    constructor (props) {
        super(props);
    }

    render () {
        let rgb = this.props.rgb;

        console.log(rgb);
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
                <div className="wick-color-picker-header">
                    <div className="color-picker-control-div">
                        <div id="btn-color-picker-close">
                            <ActionButton icon="closemodal" action={this.props.toggle}/>
                        </div>
                    </div>
                </div>
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
                            <Alpha width{...this.props} />
                        </div>
                    </div>
                    <div className="wick-color-picker-color-block-container">
                        <Checkboard />
                        <div style={styles.activeColor} />
                    </div>             
                </div>
            </div>
        );
    }
}

export default CustomPicker(WickColorPicker);