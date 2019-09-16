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
      <tr className="keyboard-shortcuts-modal-row" key={name}>
        <td className="hotkey-action-column">
          { name }
        </td>
        <td className="hotkey-column">
          { this.makeKey(sequence1) }
        </td>
        <td className="hotkey-column">
          { this.makeKey(sequence2) }
        </td>
      </tr>
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
        <div id="keyboard-shortcuts-body">

          <table class="tableSection">
            <thead>
              <tr>
                <th className="hotkey-action-column">Action</th>
                <th className="hotkey-column">Hotkey 1</th>
                <th className="hotkey-column">Hotkey 2</th>
              </tr>
            </thead>
            <tbody>
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
            </tbody>
          </table>
        </div>
      </WickModal>
    );
  }
}

export default KeyboardShortcuts
