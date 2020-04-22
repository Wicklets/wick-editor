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

import './_makeanimated.scss';

class MakeAnimated extends Component {
  constructor (props) {
    super(props);
    this.placeholderName = "Item Name"
    this.defaultName = "Clip"
    this.state = {
      name: "",
      makeAsset: true,
    }
  }

  // Creates a clip and toggles the modal.
  createAndToggle = () => {
    let name = this.state.name !== "" ? this.state.name : this.defaultName; 
    this.props.createClipFromSelection(name)
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
      className="make-animated-modal-body"
      overlayClassName="make-animated-modal-overlay">
        <div id="make-animated-modal-interior-content">
          <div id="make-animated-modal-title">Make Animated</div>
          <div id="make-animated-modal-name-input">
            <WickInput
              type="text"
              value={this.state.name}
              onChange={this.updateClipName}
              placeholder={this.placeholderName} />
          </div>
          <ObjectInfo 
          title="CLIP" 
          rows={[
              {
                text: "Has its own timeline",
                icon: "check"
              },
              {
                text: "Can control timeline with code",
                icon: "check"
              }, 
              {
                text: "Can add any code",
                icon: "check", 
              }
            ]}/>
        </div>
        <div id="make-animated-modal-footer">
          <div id="make-animated-modal-accept">
            <ActionButton 
              className="make-animated-modal-button"
              color='gray-green'
              action={this.createAndToggle}
              text="Convert to Clip"
              />
          </div>
        </div>
        <div id="make-animated-asset-checkbox-container">
          {/* <WickInput
            type="checkbox"
            containerclassname="make-animated-asset-checkbox-input-container"
            className="make-animated-asset-checkbox-input"
            onChange={this.updateAssetCheckbox}
            defaultChecked={this.state.makeAsset}
          />
          <div id="make-animated-asset-checkbox-message">
            Add to asset library
          </div> */}
        </div>
      </WickModal>
    );
  }
}

export default MakeAnimated