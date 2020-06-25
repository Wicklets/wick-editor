/*
 * Copyright 2020 WICKLETS LLC
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

import InspectorInput from 'Editor/Panels/Inspector/InspectorRow/InspectorInput/InspectorInput';

import '../_inspectorrow.scss';

class InspectorColorNumericInput extends Component {
  render() {
    return(
      <div className="inspector-row">
      {/* Identifier1 */} 
      <label htmlFor={this.props.tooltip1 + " input"} className="inspector-row-identifier">
        {this.props.tooltip1}
      </label>

      {/* Input1 */}
      <div className="inspector-small-input-container">
        <InspectorInput 
          inputProps={{id: this.props.tooltip1 + " input"}}
          input={
            {
              type: "color",
              color: this.props.val1,
              onChange: this.props.onChange1,
              id: this.props.id,
              stroke: !this.props.stroke ? false : this.props.stroke,
              placement: "left",
              colorPickerType: this.props.colorPickerType,
              changeColorPickerType:this.props.changeColorPickerType,
              updateLastColors:this.props.updateLastColors,
              lastColorsUsed:this.props.lastColorsUsed,
            }
          }
        />
      </div>

      {/* Identifier2 */}
      <label htmlFor={this.props.tooltip2 + " input"} className="inspector-row-identifier">
        {this.props.tooltip2}
      </label>

      {/* Input2 */}
      <div className="inspector-small-input-container">
        <InspectorInput 
          inputProps={{id: this.props.tooltip2 + " input"}}
          input={
            {type: "numeric",
            value: this.props.val2,
            onChange: this.props.onChange2}
          } />
      </div>
    </div>
    );
  }
}

export default InspectorColorNumericInput
