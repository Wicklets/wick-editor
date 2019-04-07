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

import './_projectsettings.scss';

class ProjectSettings extends Component {
  constructor(props) {
    super(props);

    this.defaultName = "New Project";

    this.state = {
      name: this.props.project.name,
      width: this.props.project.width,
      height: this.props.project.height,
      framerate: this.props.project.framerate,
      backgroundColor: this.props.project.backgroundColor,
    }

    // Set minimums for project settings.
    // TODO: Add this to the engine.
    this.projectMinWidth = 1;
    this.projectMinHeight = 1;
    this.projectMinFramerate = 1;
  }

  changeProjectName = (proposedName) => {
    this.setState({
      name: proposedName,
    });
  }

  changeProjectWidth = (widthAsNumber) => {
    let cleanWidthAsNumber = (!widthAsNumber) ? this.projectMinWidth : Math.max(this.projectMinWidth, widthAsNumber);
    this.setState({
      width: cleanWidthAsNumber,
    });
  }

  changeProjectHeight = (heightAsNumber) => {
    let cleanHeightAsNumber = (!heightAsNumber) ? this.projectMinHeight : Math.max(this.projectMinHeight, heightAsNumber);
    this.setState({
      height: cleanHeightAsNumber,
    });
  }

  changeProjectFramerate = (framerateAsNumber) => {
    let cleanFramerateAsNumber = (!framerateAsNumber) ? this.projectMinFramerate : Math.max(this.projectMinFramerate, framerateAsNumber);
    this.setState({
      framerate: cleanFramerateAsNumber
    });
  }

  changeProjectBackgroundColor = (color) => {
    this.props.project.backgroundColor = color.hex;
    this.setState({
      backgroundColor: color.hex
    });
  }

  acceptProjectSettings = () => {
    let newSettings = {
      name: this.state.name === '' ? this.defaultName : this.state.name,
      width: this.state.width,
      height: this.state.height,
      backgroundColor: this.state.backgroundColor,
      framerate: this.state.framerate,
    }

    this.props.updateProjectSettings(newSettings);
    this.props.toggle();
  }

  render() {
    return (
      <WickModal 
      open={this.props.open} 
      toggle={this.props.toggle} 
      className="project-settings-modal-body"
      overlayClassName="project-settings-modal-overlay">
        <div id="project-settings-interior-content">
          <div id="project-settings-modal-title">Project Settings</div>
          <div className="project-setting-container" id="project-name-setting-container">
            <div className="project-settings-property-label">
              Project Name
            </div>
            <WickInput
                id="projectName"
                type="text"
                value={this.props.project.name}
                placeholder={this.defaultName}
                onChange={this.changeProjectName}
              />
          </div>

          <div className="project-setting-container" id="project-size-setting-container">
            <div className="project-settings-property-label">
              Project Size (W x H)
            </div>
            <div className="project-settings-size-input-container">
              <WickInput
                id="projectWidth"
                type="numeric"
                min={this.projectMinWidth}
                value={this.state.width}
                onChange = {this.changeProjectWidth}
                className="project-settings-size-input" />
              <div className="project-settings-split">x</div>
              <WickInput
                id="projectHeight"
                type="numeric"
                min={this.projectMinHeight}
                value={this.state.height}
                onChange={this.changeProjectHeight} 
                className="project-settings-size-input" /> 
            </div>
          </div>

          <div className="project-setting-container" id="project-framerate-setting-container">
            <div className="project-settings-property-label">
              Framerate (FPS)
            </div>
            <WickInput
            id="projectFramerate"
            type="numeric"
            min={this.projectMinFramerate}
            value={this.state.framerate}
            onChange={this.changeProjectFramerate} />
          </div>

          <div className="project-setting-container" id="project-background-color-setting-container">
            <div className="project-settings-property-label">
              Background Color
            </div>
            <div className="project-setting-property-container">
              <WickInput
                type="color"
                id="project-background-color-picker"
                disableAlpha={true}
                placement={'bottom'}
                color={this.state.backgroundColor}
                onChangeComplete={this.changeProjectBackgroundColor} />
            </div>
          </div>

          {/* Footer */}
          <div id="project-settings-modal-footer">
            <div id="project-settings-modal-cancel">
                <ActionButton 
                  className="project-settings-modal-button"
                  color='gray'
                  action={this.props.toggle}
                  text="Cancel"
                  />
              </div>
              <div id="autosave-modal-accept">
                <ActionButton 
                  className="autosave-modal-button"
                  color='green'
                  action={this.acceptProjectSettings}
                  text="Save"
                  />
              </div>
          </div>
        </div>
      </WickModal>
    );
  }
}

export default ProjectSettings