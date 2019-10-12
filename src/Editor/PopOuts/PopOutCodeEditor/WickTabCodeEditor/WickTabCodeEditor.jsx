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
import AddScriptPanel from './AddScriptPanel/AddScriptPanel';
import TabbedInterface from 'Editor/Util/TabbedInterface/TabbedInterface';

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
      scriptSubTab: 'Mouse',
    }

    this.scriptsByType = this.props.scriptInfoInterface.scriptsByType;

    this.scriptDescriptions = this.props.scriptInfoInterface.scriptDescriptions;

    this.focusError = null;
  }

  componentDidUpdate = (prevProps, prevState) => {
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

  /**
   * Returns the tab index of the desired script. if the tab does not exist, returns index of add tab.
   * @param {string} name Name of the script.
   * @returns {number} Tab index of script by name. If script does not exist for this script owner, returns -1.
   */
  getTabIndexByName = (name) => {
    let scripts = this.props.script.scripts;
    let index = -1;

    for (let i=0; i<scripts.length; i++) {
      if (scripts[i].name === name) index = i;
    }

    // If we don't have a tab by that name, set it to the add tab index.
    if (index === -1) {
      return scripts.length;
    } else {
      return index;
    }
  }

  setTabNameByIndex = (i) => {
    let scripts = this.props.script.scripts;

    if (i < (scripts.length)) { // Select a code tab.
      this.props.editScript(scripts[i].name);
    } else if (i === scripts.length) { // select add tab
      this.props.editScript("add");
    }
    // Otherwise, ignore.

  }

  renderNewAceEditor = (script) => {
    let wrappedUpdate = (src) => {
      this.props.script.updateScript(script.name, src);
      this.props.onMinorScriptUpdate(src);
    }

    return (
      <WickAceEditor
        focus={true}
        addNewEditor={this.props.addNewEditor}
        onUpdate={wrappedUpdate}
        script={script.src}
        name={script.name}
        errors={this.props.errors.filter(error => {return error.name === script.name})}
        onCursorChange={this.props.onCursorChange}
        toggleCodeEditor={this.props.toggleCodeEditor}
      />
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
  getAddableScripts = (tab) => {
    let addable = this.scriptsByType[tab];
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
    this.props.editScript(scriptName);
    this.props.rerenderCodeEditor();
  }

  renderAddScriptPanel = (tab) => {
    return (
      <AddScriptPanel
      scripts={this.getAddableScripts(tab)}
      addScript={this.addScript} />
    )
  }

  renderAddScriptTabPanel = () => {
    let tabs = [
      {
        name: "Mouse",
        body: this.renderAddScriptPanel("Mouse")
      },
      {
        name: "Keyboard",
        body: this.renderAddScriptPanel("Keyboard")
      },
      {
        name: "Timeline",
        body: this.renderAddScriptPanel("Timeline")
      },
    ]

    return (
      <TabPanel>
        <div id="add-scripts-panel-container">
          <TabbedInterface className="pop-out-add-scripts-body" tabNames={["Mouse", "Keyboard", "Timeline"]}>
            {this.renderAddScriptPanel("Mouse")}
            {this.renderAddScriptPanel("Keyboard")}
            {this.renderAddScriptPanel("Timeline")}
          </TabbedInterface>
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
          selectedIndex={this.getTabIndexByName(this.props.scriptToEdit)}
          onSelect={tabIndex => {this.setTabNameByIndex(tabIndex)}}>
          <TabList>
            {/* Add In Script Tabs */}
            {scripts.map(this.renderNewCodeTab) }
            {/* Render "Add Script" button */}
            {this.renderAddScriptTab()}
          </TabList>
          {scripts.map(this.renderNewCodePanel)}
          {this.renderAddScriptTabPanel()}
        </Tabs>
      </div>
    );
  }

}

export default WickTabCodeEditor;
