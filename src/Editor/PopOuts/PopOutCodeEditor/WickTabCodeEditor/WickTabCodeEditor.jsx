import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import WickAceEditor from './WickAceEditor/WickAceEditor';
import AddEventButton from './AddEventButton/AddEventButton';
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

  renderNewAceEditor = (event) => {
    return (
      <WickAceEditor
        addNewEditor={this.props.addNewEditor}
        onUpdate={(src) => {this.props.script.updateEvent(event.name, src)} }
        script={event.src}
        name={event.name} />
    )
  }

  renderNewCodePanel = (event, i) => {
    return  (
      <TabPanel
        key={i}>{this.renderNewAceEditor(event)}</TabPanel>

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

  renderAddEventButton = (eventName, i) => {
    return (
        <AddEventButton
          key={i}
          text={eventName}
          action={() => this.props.script.addEvent(eventName)} />
      )
  }

  renderAddEventTabPanel = () => {
    let availableEvents = this.props.script.getAvailableEvents();
    return (
      <TabPanel>
        {availableEvents.map(this.renderAddEventButton)}
      </TabPanel>
    );
  }

  removeSelectedTab = () => {
    let events = this.props.script.getEvents();

    if (this.state.tabIndex < 0 || this.state.tabIndex >= events.length) {
      return
    }

    let event = events[this.state.tabIndex];
    this.props.script.removeEvent(event.name);
  }

  render () {
    let events = this.props.script.getEvents();
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
            {/* Add In Event Tabs */}
            {events.map(this.renderNewCodeTab) }
            {/* Render "Add Event" button */}
            {this.renderAddEventTab()}
          </TabList>
          {events.map(this.renderNewCodePanel) }
          {this.renderAddEventTabPanel()}
        </Tabs>
      </div>
    );
  }

}

export default WickTabCodeEditor;
