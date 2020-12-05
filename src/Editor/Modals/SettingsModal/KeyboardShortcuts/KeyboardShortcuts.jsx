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
import { recordKeyCombination } from 'react-hotkeys';
import ActionButton from 'Editor/Util/ActionButton/ActionButton'; 
import HotKeyInterface from 'Editor/hotKeyMap.js';

import './_keyboardshortcuts.scss';

var classNames = require('classnames'); 

class KeyboardShortcuts extends Component {
  constructor () {
    super();
    // Instantiate default behavior.
    this.state = {
      editingAction: {name: "", actionName: "", actionIndex: 0}, 
      newActions: [],
      cancelKeyRecording: () => {},
      openTabs: [],
    }
  }

  /**
   * Toggles a tab in the hotkey interface.
   * @param {string} name - Tab to toggle.
   */
  toggleTab = (name) => {
    let tabs = this.state.openTabs.concat([]); 
    let tabIndex = tabs.indexOf(name);
    if (tabIndex > -1) { // Tab is open.
      tabs = tabs.filter(tabName => tabName !== name);
    } else { // Tab is closed.
      tabs.push(name);
    }
    this.setState({
      openTabs: tabs,
    })
  }

  // Creates the key icons to show on each row.
  makeKey = (sequence, labelledby) => {
    if (sequence === undefined) {
      sequence = '';
    } else if (typeof sequence === 'object') {
      // Swap text for icons.
      let key = HotKeyInterface.replaceKeys(sequence['sequence']);
      let action = sequence['action'] ? '+' + sequence['action'] : '';
      sequence = key + action;
    }

    let sequenceItems = sequence.split('+');

    // Adds plus signs to keys that are not the last key...
    return (
      <button aria-labelledby={labelledby+" shortcut key"} className="keyboard-shortcut-key">
        {sequenceItems.map((key,i) => {
          return (
            <span key={"keyboard-commands-" + key + i} className="keyboard-shortcuts-key-icon-container">
              <kbd>{key}</kbd>
              {sequenceItems.length > i+1 && ' + '}
            </span>
          );
        })}
      </button>
    );
  }

  // Returns the action if it is edited, undefined otherwise.
  isEdited = (actionName, index) => {
    let actions = this.state.newActions.filter(obj => obj.actionName === actionName);

    return actions.find(obj => obj.index === index);
  }

  // Returns true if the action is currently being edited.
  isEditing = (actionName, index) => {
    return actionName === this.state.editingAction.actionName && this.state.editingAction.index === index; 
  }

  createHeader = (headerInfo) => {
    let {name} = headerInfo;

    return (
      <tr 
        className="keyboard-shortcuts-modal-row" 
        key={name}
        >
        <td className="hotkey-action-column hotkey-header-column"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.which === 13) {
              this.toggleTab(name);
            }
          }}
          onClick={() => {this.toggleTab(name)}}>
          {this.state.openTabs.indexOf(name) === -1 && <i className="wick-brand-arrow arrow-right"/>} 
          {this.state.openTabs.indexOf(name) > -1 && <i className="wick-brand-arrow arrow-down"/>} 
          { name }
        </td>
      </tr>
    );

  }

  createRow = (rowInfo) => {
    let {actionName, name, sequence1, sequence2} = rowInfo;


    // Only check each column once.
    let action0 = {
      edited : this.isEdited(actionName, 0),
      editing : this.isEditing(actionName, 0)
    }

    let action1 = {
      edited : this.isEdited(actionName, 1),
      editing : this.isEditing(actionName, 1)
    }

    return (
      <tr className="keyboard-shortcuts-modal-row" key={name}>
        <td id={name} className="hotkey-action-column">
          { name }
        </td>
        <td className={classNames("hotkey-column", 
        {"edited" : action0.edited && !action0.editing},
        {"editing": action0.editing})}
            onClick={() => this.beginEdit(actionName, 0)}>
          { // Displays edited action if it exists...
            action0.edited ? 
                this.makeKey(action0.edited.sequence, name) :
                this.makeKey(sequence1, name)
          }
        </td>
        <td className={classNames("hotkey-column",
        {"edited" : action1.edited && !action1.editing},
        {"editing": action1.editing})}
            onClick={() => this.beginEdit(actionName, 1)}>
            { // Displays edited action if it exists...
              action1.edited ? 
                  this.makeKey(action1.edited.sequence, name) :
                  this.makeKey(sequence2, name)
            }
        </td>
      </tr>
    );
  }

  beginEdit = (actionName, index) => {
    // Begin recording that we are editing a key.
    var cancelKeyRecording =  recordKeyCombination(
      (sequence) => {
        if (sequence.keys[" "]) {
          sequence.id = sequence.id.replace(" ", "space");
          delete sequence.keys[" "];
          sequence.keys.space = true;
        }
        return this.changeKey(actionName, index, sequence);
      }
    );

    // Set that we are editing a key.
    this.setState({
      editingAction: {actionName: actionName, name: actionName, index: index || 0}, 
      cancelKeyRecording: cancelKeyRecording,
    });


  }

  // Initiate custom hotkey change locally.
  changeKey = (actionName, sequenceIndex, sequence) => {
    let actions = [];

    let keyCommand = sequence.id.toLowerCase();

    let newAction = {
      actionName: actionName, 
      name: actionName,
      index: sequenceIndex,
      sequence: keyCommand,
    }

    actions.push(newAction);

    // Check if we have overwritten any previous keys and make that change. Remove duplicates if they exist.
    Object.keys(this.props.keyMap).forEach(key => {
      let action = this.props.keyMap[key];

      action.sequences.forEach((seq, index) => {
        if (typeof seq === "string" && seq.toLowerCase() === keyCommand) {
          // Remove Sequence
          let act = {
            actionName: key, 
            name: key,
            index: index,
            sequence: "",
          }

          actions.push(act);
          let name = action.actionName || action.name;
          this.props.toast('Key Command Overwritten: ' + name +'. Please reset this key command.', 'warning');
        }
      });
    })

    // Check if this sequence will override a newly added sequence.
    let newActionsArray = this.state.newActions.concat([]);
    for (var i=0; i<newActionsArray.length; i++) {
      let action = newActionsArray[i];
      if (action.sequence === keyCommand) {
        newActionsArray.splice(i, 1);
        let name = action.actionName || action.name;
        this.props.toast('Key Command Overwritten: ' + name +'. Please reset this key command.', 'warning');
        break;
      }
    }
    
    this.setState({
      newActions: newActionsArray.concat(actions), 
    });

    this.stopEditingKey();
  } 

  // Stop the recording / editing process.
  stopEditingKey = () => {
    this.state.cancelKeyRecording();
    this.setState({
      editingAction: {actionName: "", name: "", actionIndex: 0}, 
      cancelKeyRecording: () => {},
    });
  }

  // Remove all potential hotkeys.
  resetAndToggle = () => {
    this.stopEditingKey();
    this.setState({
      newActions: [],
    });
    if (this.props.toggle) this.props.toggle();
  }

  // Apply all new hotkeys to the editor.
  applyNewKeys = () => {
    this.props.addCustomHotKeys(this.state.newActions); 
    this.resetNewActions();
    this.stopEditingKey();

    this.props.toggle && this.props.toggle();
  }

  resetNewActions = () => {
    // Remove existing actions as they've already been applied. 
    this.setState({
      newActions : [],
    });
  }

  resetHotkeys = () => {
    this.resetNewActions();
    this.stopEditingKey(); 
    this.props.resetCustomHotKeys(); 
  }

  getGroupedRows = () => {
    let keyGroups = Object.keys(this.props.keyMapGroups);

    let groupedRows = [];
    keyGroups.forEach(groupName => {
      groupedRows.push({name:groupName, type:"header"});
      if (this.state.openTabs.indexOf(groupName) > -1) {
        let groupMembers = this.props.keyMapGroups[groupName];
        groupMembers.forEach(member => {
          groupedRows.push({name:member, type:"member"})
        })
      }
    });
    return groupedRows;
  }

  render() {
    let keyMap = this.props.keyMap || {};
    let groupedRows = this.getGroupedRows();
    return (
        <div id="keyboard-shortcuts-body">
          <table className="tableSection">
            <thead>
              <tr>
                <th className="hotkey-action-column">Action</th>
                <th className="hotkey-column header">Hotkey 1</th>
                <th className="hotkey-column header">Hotkey 2</th>
              </tr>
            </thead>
            <tbody>
              {
                groupedRows.map( action => {
                  if (action.type === "header") {
                    return (this.createHeader(action));
                  } else {
                    let actionName = action.name; 
                    let { sequences, name } = keyMap[actionName];
                    return this.createRow(
                      {
                        actionName: actionName,
                        name: name || actionName,
                        sequence1: sequences[0],
                        sequence2: sequences[1],
                      });
                  }
                })
              }
            </tbody>
          </table>
            {/* Footer */}
            <div id="keyboard-shortcuts-modal-footer">
              <div className= "keyboard-shortcuts-footer-button-container" id="keyboard-shortcuts-modal-reset">
                <ActionButton 
                  className="keyboard-shortcuts-modal-button"
                  id="keyboard-shorcuts-reset-button"
                  color='flame'
                  action={this.resetHotkeys}
                  text="Reset"
                  tooltip="Reset hotkeys to default settings."
                  tooltipPlace="top"
                  />
              </div>
              <div className= "keyboard-shortcuts-footer-button-container" id="keyboard-shortcuts-modal-cancel">
                <ActionButton 
                  className="keyboard-shortcuts-modal-button"
                  id="keyboard-shorcuts-cancel-button"
                  color='gray'
                  action={this.resetAndToggle}
                  text="Cancel"
                  />
              </div>
              <div className= "keyboard-shortcuts-footer-button-container" id="keyboard-shortcuts-modal-accept">
                <ActionButton 
                  className="keyboard-shortcuts-modal-button"
                  id="keyboard-shorcuts-apply-button"
                  color='green'
                  action={this.applyNewKeys}
                  text="Apply"
                  />
              </div>
          </div>
        </div>
    );
  }
}

export default KeyboardShortcuts
