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
import '../_inspectorrow.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

import WickInput from 'Editor/Util/WickInput/WickInput';

// Quick documentation...
// input1: object: input information, all props passed to child
// input2: object: input information, all props passed to child
// icon: image reference
// divider: boolean: show x or don't show x, default to show x.

class InspectorInput extends Component {

  renderSingleComponent() {
    return (
      <div  className="single-input-element inspector-input-element">
        <WickInput {...this.props.input1}/>
      </div>
    )
  }

  renderDoubleComponent() {
    let divider = (this.props.divider || this.props.divider === undefined) ? "x" : "";

    return (
        <div className="double-input">
          {/* Left Element */}
          <div className="double-input-element inspector-input-element">
            <WickInput  {...this.props.input1}/>
          </div>
          {/* Divider */}
          <div className="input-divider inspector-input-element">{divider}</div>
          {/* Right Element */}
          <div className="double-input-element inspector-input-element">
            <WickInput {...this.props.input2}/>
          </div>
        </div>
    )
  }

  render() {
    if (this.props.input2 === undefined) {
      return(this.renderSingleComponent());
    } else {
      return(this.renderDoubleComponent());
    }
  }
}

export default InspectorInput
