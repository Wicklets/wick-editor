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
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import WickModal from 'Editor/Modals/WickModal/WickModal';
import WickInput from 'Editor/Util/WickInput/WickInput';
import ObjectInfo from '../Util/ObjectInfo/ObjectInfo';
import TabbedInterface from 'Editor/Util/TabbedInterface/TabbedInterface';

import './_exportoptions.scss';

class ExportOptions extends Component {
  constructor (props) {
    super(props);
    this.placeholderName = 'Filename';
    this.state = {
      name: this.props.projectName || '',
      subTab: 'Animation',
    }
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.projectName !== this.props.projectName) {
      this.setState({
          name: this.props.projectName,
        });
    }
  }

  /**
   * Creates an item of type and toggles the modal.
   * @param {string} type Either 'GIF', 'VIDEO', 'ZIP', or 'HTML'.
   */
  createAndToggle = (type) => {
    let name = this.state.name !== "" ? this.state.name : (type);

    if (type === 'GIF') {
      this.props.exportProjectAsGif(name);
    } else if (type === 'VIDEO') {
      this.props.exportProjectAsVideo(name);
    } else if (type === 'ZIP') {
      this.props.exportProjectAsStandaloneZip(name);
      this.props.toggle();
    } else if (type === 'HTML') {
      this.props.exportProjectAsStandaloneHTML(name);
      this.props.toggle();
    } else if (type === 'IMAGE_SEQUENCE') {
      this.props.exportProjectAsImageSequence(name);
      this.props.toggle();
    }
  }

  // Updates the clip name in the state.
  updateExportName = (newName) => {
    this.setState({
      name: newName,
    });
  }

  setSubTab = (name) => {
    this.setState({
      subTab: name,
    });
  }

  // Renders the body of the "Animation" tab.
  renderAnimatedInfo = () => {
    return (
      <div className="export-info-container">
        <div className="export-info-item">
          <ObjectInfo
            className="export-object-info"
            title="Animated GIF"
            rows={[
              {
                text: "Creates a .gif file",
                icon: "check"
              },
              {
                text: "No Sound",
                icon: "cancel",
              },
              {
                text: "No Code is Run",
                icon: "cancel"
              },
            ]} />
          <div className="export-modal-button-container">
          <ActionButton
            color='gray-green'
            action={() => { this.createAndToggle("GIF") }}
            text="Export GIF"
            />
          </div>
        </div>
        <div className="export-info-item">
          <ObjectInfo
            className="export-object-info"
            title="Video (Beta)"
            rows={[
              {
                text: "Creates an .mp4 file",
                icon: "check"
              },
              {
                text: "Has Sound",
                icon: "check",
              },
              {
                text: "No code is run",
                icon: "cancel"
              },
            ]}/>
          <div className="export-modal-button-container">
          <ActionButton
            color='gray-green'
            action={() => { this.createAndToggle("VIDEO") }}
            text="Export Video (Beta)"
            />
          </div>
        </div>
      </div>
    );
  }

  // Renders the body of the "Interactive" tab.
  renderInteractiveInfo = () => {
    return (
      <div className="export-info-container">
        <div className="export-info-item">
          <ObjectInfo
            className="export-object-info"
            title="ZIP Archive"
            rows={[
              {
                text: "Fully Interactive",
                icon: "check"
              },
              {
                text: "Works on other sites",
                icon: "check"
              },
              {
                text: "Exports a .zip file",
                icon: "check",
              }
            ]}>
          </ObjectInfo>
          <div className="export-modal-button-container">
            <ActionButton
            color='gray-green'
            action={() => { this.createAndToggle("ZIP") }}
            text="Export ZIP"
            />
          </div>
        </div>
        <div className="export-info-item">
          <ObjectInfo
            className="export-object-info"
            title="HTML"
            rows={[
              {
                text: "1-Click open",
                icon: "check"
              },
              {
                text: "Easily share projects",
                icon: "check"
              },
              {
                text: "Exports a .html file",
                icon: "check",
              }
            ]}>
          </ObjectInfo>
          <div className="export-modal-button-container">
            <ActionButton
              color='gray-green'
              action={() => { this.createAndToggle("HTML") }}
              text="Export HTML"
            />
          </div>
        </div>
      </div>
    );
  }

    // Renders the body of the "Animation" tab.
    renderImageInfo = () => {
      return (
        <div className="export-info-container">
          <div className="wide-export-info-item">
            <ObjectInfo
              className="export-object-info"
              title="Image Sequence"
              rows={[
                {
                  text: "Creates a .zip file of images",
                  icon: "check"
                },
                {
                  text: "Exports an .png image of each frame",
                  icon: "check",
                },
                {
                  text: "No Code is Run",
                  icon: "cancel"
                },
              ]} />
            <div className="export-modal-button-container">
            <ActionButton
              color='gray-green'
              action={() => { this.createAndToggle('IMAGE_SEQUENCE') }}
              text="Export Image Sequence"
              />
            </div>
          </div>
        </div>
      );
    }

  render() {
    return (
      <WickModal
      open={this.props.open}
      toggle={this.props.toggle}
      className="export-modal-body"
      overlayClassName="export-modal-overlay">
        <div id="export-modal-interior-content">
          <div id="export-modal-title">Export</div>
          <div id="export-modal-name-input">
            <WickInput
              type="text"
              value={this.state.name}
              onChange={this.updateExportName}
              placeholder={this.placeholderName} />
          </div>
          <TabbedInterface tabNames={["Animation", "Interactive", "Images"]}>
            {this.renderAnimatedInfo()}
            {this.renderInteractiveInfo()}
            {this.renderImageInfo()}
          </TabbedInterface>
        </div>
      </WickModal>
    );
  }
}

export default ExportOptions
