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
  }

  renderNewAceEditor = (script) => {
    return (
      <WickAceEditor
        addNewEditor={this.props.addNewEditor}
        onUpdate={(src) => {this.props.script.updateScript(script.name, src)} }
        script={script.src}
        name={script.name} />
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
        {availableScripts.map(this.renderAddScriptButton)}
      </TabPanel>
    );
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
            <div className='code-tab-delete'>
              <ActionButton
                icon="delete"
                color="red"
                action={this.removeSelectedTab} />
            </div>
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
