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
import capitalize from 'Editor/Util/DataFunctions/capitalize';

let classNames = require('classnames');

class AddScriptPanel extends Component {



  render() {
    return (
      <div className="add-script-container">

        <div className="add-script-tabs">
          <button 
          className={classNames("add-script-tab", "we-event", "Mouse", {selected: "Mouse" === this.props.addScriptTab})} 
          onClick={() => this.props.changeTab('Mouse')}>Mouse</button>
          <button 
          className={classNames("add-script-tab", "we-event", "Keyboard", {selected: "Keyboard" === this.props.addScriptTab})}  
          onClick={() => this.props.changeTab('Keyboard')}>Keyboard</button>
          <button 
          className={classNames("add-script-tab", "we-event", "Timeline", {selected: "Timeline" === this.props.addScriptTab})}  
          onClick={() => this.props.changeTab('Timeline')}>Timeline</button>
        </div>

        <div className="add-script-buttons">
          {this.props.scripts.map((script, i) => {
            return <button
              className={classNames("add-script-button", script.type)}
              key={'add-script-button-' + i}
              disabled={this.props.availableScripts && this.props.availableScripts.indexOf(script.name) === -1}
              onClick={() => this.props.addScript && this.props.addScript(script.name)}
            >
              <div className="add-script-button-title">{capitalize(script.name)}</div>
              <div className="add-script-button-description"> {script.description}</div>

            </button>
          })}
        </div>
      </div>
    )
  }
}

export default AddScriptPanel