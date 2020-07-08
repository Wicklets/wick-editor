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

import '../_outlinerrow.scss'

import OutlinerWidget from '../../OutlinerWidget/OutlinerWidget';

import pathIcon from 'resources/object-icons/path.svg';
import buttonIcon from 'resources/object-icons/button.svg';
import clipIcon from 'resources/object-icons/clip.svg';
import textIcon from 'resources/object-icons/text.svg';
import imageIcon from'resources/object-icons/image.svg';

class OutlinerDisplay extends Component {
  render() {
    const items = {path: pathIcon,
      button: buttonIcon,
      clip: clipIcon,
      text: textIcon,
      image: imageIcon};
    
    return(
      <div className="outliner-row">
        {/* Identifier */}
        <span className="outliner-row-identifier">
          {this.props.tooltip}
        </span>
        {/* Input */}
        <span className="outliner-input-container">
          {Object.keys(items).map((item) => {
            return (
            <OutlinerWidget
              key={item}
              onClick={() => {
                var newDisplay = {...this.props.display};
                newDisplay[item] = !newDisplay[item];
                this.props.onChange(newDisplay);
              }} 
              src={items[item]} 
              alt={item}
              on={this.props.display[item]}
            />);
          })}
        </span>
      </div>
    )
  }
}

export default OutlinerDisplay
/*
renderDisplay = () => {
  
  return (
    <div className="wick-display-container">
      {Object.keys(items).map((item) => {
        let is_displayed = this.props.display[item] ? "true" : "false";
        
        return (
          <img 
            alt={item}
            src={items[item]}
            className={"wick-display-item " + is_displayed}
            onClick={() => {
              var newDisplay = {...this.props.display};
              newDisplay[item] = !newDisplay[item];
              this.props.onChange(newDisplay);
              }
            }
          />
        );
      })}
    </div>
  );
}

.wick-display-item {
  padding-right: 2px;
  width: 17px;
}
.false {
  opacity: 0.25;
}
.true {
  opacity: 1.0;
}*/