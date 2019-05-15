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
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import WickAceEditor from './WickAceEditor/WickAceEditor';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import SelectSubTabButton from 'Editor/Util/SelectSubTabButton/SelectSubTabButton';
import AddScriptPanel from './AddScriptPanel/AddScriptPanel'; 

import './_wicktabcodeeditor.scss';
import './_wicktabcodeeditortabstyling.scss';
import '../_popoutcodeditor.scss';
import ToolIcon from '../../../Util/ToolIcon/ToolIcon';

// https://flaviocopes.com/how-to-uppercase-first-letter-javascript/
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

class WickTabCodeEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,
      scriptSubTab: 'Timeline',
    }

    this.scriptsByType = this.props.scriptInfoInterface.scriptsByType;

    this.scriptDescriptions = this.props.scriptInfoInterface.scriptDescriptions;

    this.focusError = null;
  }

  componentDidUpdate = () => {
    if (this.props.errors && this.props.errors instanceof Array && this.props.errors.length > 0) {
      this.focusError = this.props.errors[0];
    }
  }

  pickColor = (text) => {
    if (text.includes('mouse')) {
      return 'green';
    } else if (text.includes('key')) {
      return 'yellow';
    } else {
      return 'sky';
    }
  }

  renderNewAceEditor = (script) => {
    let wrappedUpdate = (src) => {
      this.props.script.updateScript(script.name, src);
      this.props.onMinorScriptUpdate(src);
    }

    return (
      <WickAceEditor
        addNewEditor={this.props.addNewEditor}
        onUpdate={wrappedUpdate}
        script={script.src}
        name={script.name}
        errors={this.props.errors.filter(error => {return error.name === script.name})}/>
    )
  }

  renderNewCodePanel = (script, i) => {
    return  (
      <TabPanel
        key={i}>{this.renderNewAceEditor(script)}</TabPanel>

    )
  }

  renderNewCodeTab = (s, i) => {
    return (
      <Tab
        className={"react-tabs__tab react-tab-" + this.pickColor(s.name)}
        key={i}>{capitalize(s.name)}
        <div className="delete-tab-container">
          <ActionButton 
            icon="closetab" 
            color="error"
            action={() => this.removeTabByName(s.name)}
            /> 
        </div>
      </Tab>
    )
  }

  renderAddScriptTab = () => {
    return (
      <Tab>
        <div id="code-editor-add-script-tab">
          <ToolIcon name="add" /> 
        </div>
      </Tab>
    )
  }

  setSubTab = (name) => {
    this.setState({
      scriptSubTab: name, 
    }); 
  }

  /**
   * Returns the scripts which can be added based on the currently selected sub tab. 
   * @returns {object[]} Scripts returned in the form of an object with name, used, and description properties.
   */
  getAddableScripts = () => {
    let addable = this.scriptsByType[this.state.scriptSubTab]; 
    let availableScripts = this.props.script.getAvailableScripts();

    let final = []

    addable.forEach(key => {
        let scriptObject = {
          name: key,
          used: availableScripts.indexOf(key) === -1, 
          description: this.scriptDescriptions[key], 
        }
        final.push(scriptObject)
      }
    ); 

    return final;
  }

  addScript = (scriptName) => {
    this.props.script.addScript(scriptName);
    this.props.rerenderCodeEditor();
  }

  renderAddScriptTabPanel = () => {
    return (
      <TabPanel>
        <div id="add-scripts-panel-container">
          <div id="select-sub-tab-list">
            <SelectSubTabButton selected={this.state.scriptSubTab} name="Timeline" action={this.setSubTab}/>
            <SelectSubTabButton selected={this.state.scriptSubTab} name="Mouse" action={this.setSubTab}/>
            <SelectSubTabButton selected={this.state.scriptSubTab} name="Keyboard" action={this.setSubTab}/>
          </div>
          <AddScriptPanel 
            scripts={this.getAddableScripts()}
            addScript={this.addScript} />
        </div>
      </TabPanel>
    );
  }

  removeTabByName = (name) => {
    this.props.deleteScript(this.props.script, name);
    this.props.rerenderCodeEditor(); 
  }

  render () {
    let scripts = this.props.script.scripts;
    return (
      <div className='code-editor-tab-code-editor'>
        <Tabs
          selectedIndex={this.state.tabIndex}
          onSelect={tabIndex => this.setState({ tabIndex })}>
          <TabList>
            {/* Add In Script Tabs */}
            {scripts.map(this.renderNewCodeTab) }
            {/* Render "Add Script" button */}
            {this.renderAddScriptTab()}
          </TabList>
          {scripts.map(this.renderNewCodePanel) }
          {this.renderAddScriptTabPanel()}
        </Tabs>
      </div>
    );
  }

}

export default WickTabCodeEditor;
