import React, { Component } from 'react';

import './_wickcodereference.scss';

var classNames = require('classnames');

class WickCodeDetailsPanel extends Component {
  constructor (props) {
    super(props); 

    this.state = {
      openElements : [],
    }

    this.referenceItems = {
      'Timeline' : ['play', 'stop', 'gotoAndPlay', 'gotoAndStop', 'gotoNextFrame', 'gotoPrevFrame'],
      'Object' : ['x', 'y', 'width', 'height', 'scaleX', 'scaleY', 'rotation', 'opacity', 'hitTest'],
      'Input' : ['mouseX', 'mouseY', ],
    }
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

    console.log("splics", oldElements)

    return; 
  }

  renderFunctions = (tabName) => {
    let functions = this.referenceItems[tabName];

    return functions.map((f, i) => {
      return <div className="tab-element" key={i}>{f}</div>
    });
  }

  renderReferenceTab = (tabName) => {

    let tabOpen = this.state.openElements.indexOf(tabName) > -1;

    return (
      <div className="reference-tab-container">
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
