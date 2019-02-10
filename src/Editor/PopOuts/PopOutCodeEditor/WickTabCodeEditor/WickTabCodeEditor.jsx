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
import AddScriptButton from './AddScriptButton/AddScriptButton';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';

import './_wicktabcodeeditor.scss';
import './_wicktabcodeeditortabstyling.scss';
import '../_popoutcodeditor.scss';

// Import default tab style

class WickTabCodeEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tabIndex: 0,
    }

    this.focusError = null;
  }

  componentDidUpdate = () => {
    if (this.props.errors && this.props.errors instanceof Array && this.props.errors !== []) {
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
        key={i}>{s.name}</Tab>
    )
  }

  renderAddScriptTab = () => {
    return (
      <Tab>+</Tab>
    )
  }

  renderAddScriptButton = (scriptName, i) => {
    return (
        <AddScriptButton
          key={i}
          text={scriptName}
          pickColor={this.pickColor}
          action={() => this.addScript(scriptName)} />
      )
  }

  addScript = (scriptName) => {
    this.props.script.addScript(scriptName);
    this.props.rerenderCodeEditor();
  }

  renderAddScriptTabPanel = () => {
    let availableScripts = this.props.script.getAvailableScripts();
    return (
      <TabPanel>
        <div id="add-scripts-panel-container">
          {availableScripts.map(this.renderAddScriptButton)}
        </div>
      </TabPanel>
    );
  }

  renderDeleteTabButton = () => {
    return (
      <div className='code-tab-delete'>
        <ActionButton
          icon="delete"
          color="red"
          action={this.removeSelectedTab} />
      </div>
    )
  }

  removeSelectedTab = () => {
    let scripts = this.props.script.scripts;

    if (this.state.tabIndex < 0 || this.state.tabIndex >= scripts.length) {
      return
    }
    let script = scripts[this.state.tabIndex];

    this.props.script.removeScript(script.name);
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
            {/* Add In Delete Button */}
            {this.renderDeleteTabButton()}
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
