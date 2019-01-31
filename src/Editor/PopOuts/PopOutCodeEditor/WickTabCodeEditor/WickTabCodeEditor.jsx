import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import WickAceEditor from './WickAceEditor/WickAceEditor';

import './_wicktabcodeeditor.scss';
import './_wicktabcodeeditortabstyling.scss';
import '../_popoutcodeditor.scss';

// Import default tab style

class WickTabCodeEditor extends Component {

  renderNewAceEditor = () => {
    return (
      <WickAceEditor
        addNewEditor={this.props.addNewEditor}
        updateProjectInState={this.props.updateProjectInState}
        getSelectedClips={this.props.getSelectedClips}
        getSelectedFrames={this.props.getSelectedFrames}
        getSelectionType={this.props.getSelectionType} />
    )
  }

  render () {
    return (
      <div className='code-editor-tab-code-editor'>
        <Tabs>
          <TabList>
            <Tab>Code</Tab>
            <Tab>Other</Tab>
          </TabList>
          <TabPanel>
            {this.renderNewAceEditor()}
          </TabPanel>
          <TabPanel>
            <h2>Any content 2</h2>
          </TabPanel>
        </Tabs>
      </div>
    );
  }

}

export default WickTabCodeEditor;
