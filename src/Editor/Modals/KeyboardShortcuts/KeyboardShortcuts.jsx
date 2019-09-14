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
  makeKey = (sequence) => {
    if (sequence === undefined) {
      sequence = '';
    } else if (typeof sequence === 'object') {
      // Swap text for icons.
      let key = this.replaceKeys(sequence['sequence']);
      let action = sequence['action'] ? '+' + sequence['action'] : '';
      sequence = key + action;
    }

    let sequenceItems = sequence.split('+');

    // Adds plus signs to keys that are not the last key...
    return (
      <span className="keyboard-shortcut-key">
        {sequenceItems.map((key,i) => {
          return (
            <span className="keyboard-shortcuts-key-icon-container">
              <kbd key={"keyboard-commands-" + key + i}>{key}</kbd> 
              {sequenceItems.length > i+1 && ' + '}
            </span>
          );
        })}
      </span>
    );
  } 

  replaceKeys = (str) => {
    const keys = [
      ['shift', '⇪'],
      ['left', '⇦'],
      ['right', '⇨'],
      ['up', '⇧'],
      ['down', '⇩'],
      ['command', '⌘'],
    ]

    let newStr = str;

    keys.forEach(swap => {
      newStr = newStr.replace(swap[0], swap[1]); 
    });

    return newStr;
  }

  createRow = ({name, sequence1, sequence2}) => {
    return (
      <div className="keyboard-shortcuts-modal-row" key={name}>
        <div className="keyboard-shortcuts-modal-name-cell">
          { name }
        </div>
        <div className="keyboard-shortcuts-modal-key-cell">
          { this.makeKey(sequence1) }
        </div>
        <div className="keyboard-shortcuts-modal-key-cell">
          { this.makeKey(sequence2) } 
        </div>
      </div>
    );
  }

  render() {
    const keyMap = getApplicationKeyMap();

    return (
      <WickModal 
      open={this.props.open} 
      toggle={this.props.toggle} 
      className="keyboard-shortcuts-modal-body"
      overlayClassName="keyboard-shortcuts-modal-overlay">
        <div id="keyboard-shortcuts-modal-title">Hotkeys</div>
        {this.createRow({
          name: 'Action', 
          sequence1: {sequence: 'hotkey 1'}, 
          sequence2: {sequence: 'hotkey 2'},
        })}
        <div className="keyboard-shortcuts-container">
        { 
          Object.keys(keyMap).map( (actionName) => {
              let { sequences, name } = keyMap[actionName];
              return this.createRow(
                {
                  name: name || actionName,
                  sequence1: sequences[0],
                  sequence2: sequences.length > 1 ? sequences[1] : undefined, 
                });
          })
        }
        </div>
      </WickModal>
    );
  }
}

export default KeyboardShortcuts