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

import MobileInspectorInput from '../MobileInspectorInput/MobileInspectorInput';

import '../_mobileinspectorrow.scss';

class InspectorCheckbox extends Component {
  render() {
    let idLabel = this.props.tooltip.replace(/\s+/g, '-').toLowerCase();
    return(
      <div className="mobile-inspector-row">
        {/* Identifier */} 
        <label htmlFor={idLabel + "-input-mobile"} className="mobile-inspector-row-identifier">
          {this.props.tooltip}
        </label>

        {/* Checkbox */}
        <div className="mobile-inspector-small-input-container">
          <MobileInspectorInput 
            inputProps={{id: idLabel + "-input-mobile"}}
            input={
              {
                type: "checkbox",
                checked: this.props.checked,
                onChange: this.props.onChange
              }
            }
          />
        </div>
      </div>
    );
  }
}

export default InspectorCheckbox
