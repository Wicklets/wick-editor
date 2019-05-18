import React, { Component } from 'react';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import './_wickcodereference.scss';

var classNames = require('classnames');

class WickCodeDetailsPanel extends Component {
  constructor (props) {
    super(props); 

    this.state = {
      openElements : [],
    }

    this.referenceItems = this.props.scriptInfoInterface.referenceItems;
  }

  toggleTab = (tabName) => {
    let oldElements = [].concat(this.state.openElements);

    let index = oldElements.indexOf(tabName);

    // Not open yet, add to the open elements list.
    if (index === -1) {
      oldElements.push(tabName)
      this.setState( prevState => { return (
        {openElements: oldElements}
      )});  

      return;  
    }

    // Already open, remove from the open elements tab.
    oldElements.splice(index, 1);
    this.setState( prevState => { return (
      {openElements: oldElements }
    )});  

    return; 
  }

  renderFunctions = (tabName) => {
    let functions = this.referenceItems[tabName];

    return functions.map((f, i) => {
      return <div className="tab-element" key={i}>
        <ActionButton
          id={"reference-tab-element-" + tabName + "-" + f.name}
          tooltip={f.description}
          tooltipPlace="left"
          color="reference" 
          text={f.name}
          action={() => {this.props.addCodeToTab(f.snippet)}} />
        </div>
    });
  }

  renderReferenceTab = (tabName, i) => {

    let tabOpen = this.state.openElements.indexOf(tabName) > -1;

    return (
      <div key={i} className="reference-tab-container">
        <div className="reference-tab-title" onClick={() => this.toggleTab(tabName)}>{tabName}</div>
        <div className={classNames("reference-tab-elements", {"tab-closed" : !tabOpen})}>
          {this.renderFunctions(tabName)}
        </div>
      </div>
    )
  }

  renderReference = () => {
    let mainTabs = Object.keys(this.referenceItems); 

    return mainTabs.map(this.renderReferenceTab); 
  }

  render() {
    return (
      <div id="code-editor-reference">
        <div id="code-editor-reference-title-text">
          Reference
        </div>
        <div id="code-editor-reference-body">
          {this.renderReference()}
        </div>
      </div>
    );
  }
}

export default WickCodeDetailsPanel
