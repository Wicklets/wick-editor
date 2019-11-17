import React, { Component } from 'react'
var tinycolor = require("tinycolor2");
var { Swatch } = require('react-color/lib/components/common');

class WickSwatch extends Component {
    constructor (props) {
        super(props);
        this.state = {
            hovered: false,
        }
    }

    setHovered = (hoverState) => {
        this.setState({
            hovered: hoverState,
        });
    }

    render () {
        let colorInfo = tinycolor(this.props.color);
        let selectedColorInfo = tinycolor(this.props.selectedColor);
        let contrastColor = '#CCCCCC'

        let selected = this.props.color === ("#" + selectedColorInfo.toHex()); // TODO clean this check.

        if (colorInfo.isLight()) {
            contrastColor = "#333333"
        }

        let selectedStyle = {
            border: '3px solid' + contrastColor
        }

        let style = {};
        if (this.state.hovered || selected) {
            style = selectedStyle;
        }

        return (
            <div 
                onMouseEnter={() => this.setHovered(true)}
                onMouseLeave={() => this.setHovered(false)}
                className="column-swatch"
                style={style}>
                <Swatch  
                    color={this.props.color}
                    onClick={(color) => {this.props.onChangeComplete(color)}}  />
            </div>
        );
    }
}

export default WickSwatch