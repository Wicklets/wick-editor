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
import { getApplicationKeyMap, recordKeyCombination } from 'react-hotkeys';

import './_keyboardshortcuts.scss';

var classNames = require('classnames'); 

class KeyboardShortcuts extends Component {
  constructor () {
    super();
    // Instantiate default behavior.
    this.state = {
      editingAction: {actionName: "", actionIndex: 0}, 
      cancelKeyRecording: () => {},
    }
  }

  // Creates the key icons to show on each row.
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
            <span key={"keyboard-commands-" + key + i} className="keyboard-shortcuts-key-icon-container">
              <kbd>{key}</kbd>
              {sequenceItems.length > i+1 && ' + '}
            </span>
          );
        })}
      </span>
    );
  }

  // Replaces keys with symbols.
  replaceKeys = (str) => {
    const keys = [
      ['shift', '⇪'],
      ['Shift', '⇪'],
      ['left', '⇦'],
      ['Left', '⇦'],
      ['right', '⇨'],
      ['Right', '⇨'],
      ['up', '⇧'],
      ['Up', '⇧'],
      ['down', '⇩'],
      ['Down', '⇩'],
      ['command', '⌘'],
      ['Command', '⌘'],
    ]

    let newStr = str;

    keys.forEach(swap => {
      newStr = newStr.replace(swap[0], swap[1]);
    });

    return newStr;
  }

  createRow = (rowInfo) => {
    let {actionName, name, sequence1, sequence2} = rowInfo;

    let editingAction = this.state.editingAction;
    return (
      <tr className="keyboard-shortcuts-modal-row" key={name}>
        <td className="hotkey-action-column">
          { name }
        </td>
        <td className={classNames("hotkey-column", {"editing": actionName === editingAction.actionName && editingAction.index === 0})} 
            onClick={() => this.beginEdit(actionName, 0)}>
          { this.makeKey(sequence1) }
        </td>
        <td className={classNames("hotkey-column", {"editing": actionName === editingAction.actionName && editingAction.index === 1})}
            onClick={() => this.beginEdit(actionName, 1)}>
          { this.makeKey(sequence2) }
        </td>
      </tr>
    );
  }

  beginEdit = (actionName, index) => {
    // Begin recording that we are editing a key.
    var cancelKeyRecording =  recordKeyCombination(
      (sequence) => this.changeKey(actionName, index, sequence)
    );

    // Set that we are editing a key.
    this.setState({
      editingAction: {actionName: actionName, index: index || 0}, 
      cancelKeyRecording: cancelKeyRecording,
    });


  }

  // Initiate custom hotkey change.
  changeKey = (actionName, sequenceIndex, sequence) => {
    this.props.addCustomHotKey({
      actionName: actionName, 
      index: sequenceIndex,
      sequence: sequence.id,
    });

    this.stopEditingKey();
  } 

  stopEditingKey = () => {
    this.state.cancelKeyRecording();
    this.setState({
      editingAction: {actionName: "", actionIndex: 0}, 
      cancelKeyRecording: () => {},
    });
  }

  render() {
    const keyMap = getApplicationKeyMap();

    return (
      <WickModal
      open={this.props.open}
      toggle={() => {
        this.stopEditingKey(); // Ensure we cancel key recording if in the process.
        this.props.toggle();
      }}
      className="keyboard-shortcuts-modal-body"
      overlayClassName="keyboard-shortcuts-modal-overlay">
        <div id="keyboard-shortcuts-modal-title">Hotkeys</div>
        <div id="keyboard-shortcuts-body">

          <table className="tableSection">
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
                        actionName: actionName,
                        name: name || actionName,
                        sequence1: sequences[0],
                        sequence2: sequences[1],
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
