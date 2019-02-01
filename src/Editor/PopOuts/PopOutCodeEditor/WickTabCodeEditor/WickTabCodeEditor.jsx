import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import WickAceEditor from './WickAceEditor/WickAceEditor';

import './_wicktabcodeeditor.scss';
import './_wicktabcodeeditortabstyling.scss';
import '../_popoutcodeditor.scss';

// Import default tab style

class WickTabCodeEditor extends Component {

  renderNewAceEditor = (scriptObject) => {
    return (
      <WickAceEditor
        addNewEditor={this.props.addNewEditor}
        onUpdate={scriptObject.onUpdate}
        getSelectionType={this.props.getSelectionType}
        script={scriptObject.script}
        name={scriptObject.name} />
    )
  }

  renderNewCodePanel = (s, i) => {
    return  (
      <TabPanel
        key={i}>{this.renderNewAceEditor(s)}</TabPanel>

    )
  }

  renderNewCodeTab = (s, i) => {
    return (
      <Tab
        key={i}>{s.name}</Tab>
    )
  }

  renderAddEventTab = () => {
    return (
      <Tab>+</Tab>
    )
  }

  render () {
    let scripts = this.props.getScriptsOfSelection();
    return (
      <div className='code-editor-tab-code-editor'>
        <Tabs>
          <TabList>
            {scripts.map(this.renderNewCodeTab) }
            {this.renderAddEventTab()}
          </TabList>
          {scripts.map(this.renderNewCodePanel) }
        </Tabs>
      </div>
    );
  }

}

export default WickTabCodeEditor;
