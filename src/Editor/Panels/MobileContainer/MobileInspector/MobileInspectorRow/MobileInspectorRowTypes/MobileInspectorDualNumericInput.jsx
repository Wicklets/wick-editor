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

//import InspectorRow from '../InspectorRow';
import MobileInspectorInput from '../MobileInspectorInput/MobileInspectorInput';

import '../_mobileinspectorrow.scss';

class MobileInspectorDualNumericInput extends Component {
  render() {
    let idLabel1 = this.props.tooltip1.replace(/\s+/g, '-').toLowerCase();
    let idLabel2 = this.props.tooltip2.replace(/\s+/g, '-').toLowerCase();

    let render1Identifier = (this.props.icon1) ? <img src={this.props.icon1} alt={this.props.iconAlt1} className="mobile-inspector-row-icon"></img>
                                              : <label htmlFor={idLabel1 + "-input-mobile"} className="mobile-inspector-row-identifier">
                                                  {this.props.tooltip1}
                                                </label>
    let render2Identifier = (this.props.icon2) ? <img src={this.props.icon2} alt={this.props.iconAlt2} className="mobile-inspector-row-icon"></img>
    : [<label htmlFor={idLabel2 + "-input-mobile"} className="mobile-inspector-row-identifier">
        {this.props.tooltip2}
      </label>]

    return(
      <div className="mobile-inspector-row">
        {/* Identifier1 */} 
        {render1Identifier}

        {/* Input1 */}
        <div className="mobile-inspector-small-input-container">
          <MobileInspectorInput 
            inputProps={{id: idLabel1 + "-input-mobile"}}
            input={
              {type: "numeric",
              value: this.props.val1,
              onChange: this.props.onChange1}
            } />
        </div>

        {/* Identifier2 */}
        {render2Identifier}
        
        {/* Input2 */}
        <div className="mobile-inspector-small-input-container">
          <MobileInspectorInput 
            inputProps={{id: idLabel2 + "-input-mobile"}}
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

export default MobileInspectorDualNumericInput
