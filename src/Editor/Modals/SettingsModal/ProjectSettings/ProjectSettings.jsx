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

  componentDidUpdate = (prevProps) => {
    let values = ['name', 'width', 'height', 'framerate', 'backgroundColor'];
    let different = false;
    values.forEach((value) => {
      if (prevProps.project[value] !== this.props.project[value]) {
        different = true;
      }
    });

    if (different) {
      this.setState({
          name: this.props.project.name,
          width: this.props.project.width,
          height: this.props.project.height,
          framerate: this.props.project.framerate,
          backgroundColor: this.props.project.backgroundColor,
        });
    }
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
    this.setState({
      backgroundColor: color,
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
  }

  resetAndToggle = () => {
    this.setState({
      name: this.props.project.name,
      width: this.props.project.width,
      height: this.props.project.height,
      framerate: this.props.project.framerate,
      backgroundColor: this.props.project.backgroundColor,
    });
  }

  renderNameObject = () => {
    return (
      <div className="project-setting-element">
        <div className="project-settings-property-label">
        Name
        </div>
        <WickInput
            id="projectName"
            type="text"
            value={this.state.name}
            placeholder={this.defaultName}
            onChange={this.changeProjectName}
          />
      </div>
    );
  }

  renderFramerateObject = () => {
    return (
      <div className="project-setting-element">
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
    );
  }

  renderSizeObject = () => {
    return (
      <div className="project-setting-element">
        <div className="project-settings-property-label">
          Size (W x H)
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
    );
  }

  renderBackgroundColorObject = () => {
    return (
      <div className="project-setting-element">
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
            onChange={this.changeProjectBackgroundColor} />
        </div>
      </div>
    );
  }

  render() {
    return (
        <div id="project-settings-interior-content">

          {/* Footer */}
          <div id="project-settings-modal-footer">
            <div id="project-settings-modal-cancel">
                <ActionButton 
                  className="project-settings-modal-button"
                  color='gray'
                  action={this.resetAndToggle}
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
    );
  }
}

export default ProjectSettings