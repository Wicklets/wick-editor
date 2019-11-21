/*
 * Copyright 2018 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import { Popover } from 'reactstrap';
import WickColorPicker  from 'Editor/Util/ColorPicker/WickColorPicker';

import './_colorpicker.scss';

class ColorPicker extends Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
      color: this.props.color === undefined ? new window.Wick.Color("#FFFFFF") : this.props.color,
    }

    this.toggle = this.toggle.bind(this);
    this.getStyle = this.getStyle.bind(this);
  }

  toggle () {
    this.setState({
      open: !this.state.open
    });
  }

  getStyle() {
    let style = this.props.stroke
      ? {borderColor: this.props.color}
      : {backgroundColor: this.props.color};
    return style;
  }

  render() {
    let itemID = this.props.id + '-button';
    return(
      <div
        className={"btn-color-picker"}
        id={itemID}
        onClick={this.toggle}
        style={this.getStyle()}>
        <Popover
          placement={this.props.placement}
          isOpen={this.state.open}
          toggle={this.toggle}
          target={itemID}
          boundariesElement={'viewport'}>
          <WickColorPicker
            toggle={this.toggle}
            onChange={this.props.onChange}
            colorPickerType={this.props.colorPickerType}
            changeColorPickerType={this.props.changeColorPickerType}
            disableAlpha={ this.props.disableAlpha }
            color={this.props.color !== null ? this.props.color : 'transparent'}
            onChangeComplete={ this.props.onChangeComplete }
            lastColorsUsed={this.props.lastColorsUsed}
          />
        </Popover>
      </div>
    )
  }
}


export default ColorPicker
