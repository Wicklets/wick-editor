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
import ActionButton from 'Editor/Util/ActionButton/ActionButton'; 
import WickModal from 'Editor/Modals/WickModal/WickModal'; 
import WickInput from 'Editor/Util/WickInput/WickInput';
import ObjectInfo from '../Util/ObjectInfo/ObjectInfo'; 

import './_makeinteractive.scss';

class MakeInteractive extends Component {
  constructor (props) {
    super(props);
    this.placeholderName = "Item_Name"
    this.state = {
      name: "",
      makeAsset: true,
    }
  }


  /**
   * Creates an item of type and toggles the modal.
   * @param {string} type Either 'Button' or 'Clip'
   */
  createAndToggle = (type) => {
    let name = this.state.name !== "" ? this.state.name : (type); 
    if (type === 'Clip') {
      this.props.createClipFromSelection(name)
    } else if (type === 'Button') {
      this.props.createButtonFromSelection(name);
    }

    this.props.toggle()
  }

  // Updates the clip name in the state.
  updateClipName = (newName) => {
    this.setState({
      name: newName,
    }); 
  }

  // Updates state value responsible for creating asset.
  updateAssetCheckbox = (val) => {
    this.setState({
      makeAsset: val,
    }); 
  }

  render() {
    return (
      <WickModal 
      open={this.props.open} 
      toggle={this.props.toggle} 
      className="make-interactive-modal-body"
      overlayClassName="make-interactive-modal-overlay">
        <div id="make-interactive-modal-interior-content">
          <div id="make-interactive-modal-title">Make Interactive</div>
          <div id="make-interactive-modal-name-input">
            <WickInput
              type="text"
              value={this.state.name}
              onChange={this.updateClipName}
              placeholder={this.placeholderName} />
          </div>
          <div className="make-interactive-object-info-container">
            <ObjectInfo 
              title="CLIP" 
              rows={[
              {
                text: "Can add any code",
                icon: "check"
              },
              {
                text: "Has its own timeline",
                icon: "check"
              }, 
              {
                text: "Can control timeline with code",
                icon: "check", 
              }
            ]}/>
            <ObjectInfo 
              title="BUTTON" 
              rows={[
              {
                text: "Can add any code",
                icon: "check"
              },
              {
                text: "Only has 3 frames",
                icon: "check"
              }, 
              {
                text: "Frames controlled by mouse interactions",
                icon: "check", 
              }
            ]}/>
          </div>
        </div>
        <div id="make-interactive-modal-footer">
          <ActionButton 
            className="make-interactive-modal-button"
            color='gray-green'
            action={() => { this.createAndToggle("Clip") }}
            text="Convert to Clip"
            />
          <ActionButton 
            className="make-interactive-modal-button"
            color='gray-green'
            action={() => { this.createAndToggle("Button") }}
            text="Convert to Button"
            />
        </div>
        <div id="make-interactive-asset-checkbox-container">
            {/* <WickInput
              type="checkbox"
              containerclassname="make-interactive-asset-checkbox-input-container"
              className="make-interactive-asset-checkbox-input"
              onChange={this.updateAssetCheckbox}
              defaultChecked={this.state.makeAsset}
            />
            <div id="make-interactive-asset-checkbox-message">
              Add to asset library
            </div> */}
          </div>
      </WickModal>
    );
  }
}

export default MakeInteractive