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
import WickModal from 'Editor/Modals/WickModal/WickModal'; 
import { getApplicationKeyMap } from 'react-hotkeys';

import './_keyboardshortcuts.scss';

class KeyboardShortcuts extends Component {
  render() {
    const keyMap = getApplicationKeyMap();

    return (
      <WickModal 
      open={this.props.open} 
      toggle={this.props.toggle} 
      className="keyboard-shortcuts-modal-body"
      overlayClassName="keyboard-shortcuts-modal-overlay">
        <div className="keyboard-shortcuts-container">
        { 
          Object.keys(keyMap).map( (actionName) => {
              let { sequences, name, category } = keyMap[actionName];
              console.log(category);
              return (
                <div className="keyboard-shortcuts-modal-row" key={name || actionName}>
                  <div className="keyboard-shortcuts-modal-cell keyboard-shortcuts-modal-name-cell">
                    { name || actionName}
                  </div>
                  <div className="keyboard-shortcuts-modal-cell keyboard-shortcuts-modal-key-cell">
                    { sequences.map(({sequence}) => <span key={sequence}>{sequence}</span>) }
                  </div>
                </div>
              );
          })
        }
        </div>
      </WickModal>
    );
  }
}

export default KeyboardShortcuts