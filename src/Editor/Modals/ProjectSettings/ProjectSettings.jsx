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
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label } from 'reactstrap';
import WickInput from 'Editor/Util/WickInput/WickInput';
import './_projectsettings.scss';

class ProjectSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: this.props.project.name,
      width: this.props.project.width,
      height: this.props.project.height,
      framerate: this.props.project.framerate,
      backgroundColor: this.props.project.backgroundColor,
    }

    // Set minimums for project settings.
    this.projectMinWidth = 1;
    this.projectMinHeight = 1;
    this.projectMinFramerate = 1;

    this.changeProjectName = this.changeProjectName.bind(this);
    this.changeProjectWidth = this.changeProjectWidth.bind(this);
    this.changeProjectHeight = this.changeProjectHeight.bind(this);
    this.changeProjectFramerate = this.changeProjectFramerate.bind(this);
    this.changeProjectBackgroundColor = this.changeProjectBackgroundColor.bind(this);

    this.updateProjectSettings = this.updateProjectSettings.bind(this);
  }

  componentWillMount () {

  }

  changeProjectName (event) {
    let proposedName = event.target.value;
    let cleanProjectName = (!proposedName) ? "New Project" : proposedName;
    this.setState({
      name: cleanProjectName,
    });
  }

  changeProjectWidth (widthAsNumber) {
    let cleanWidthAsNumber = (!widthAsNumber) ? this.projectMinWidth : Math.max(this.projectMinWidth, widthAsNumber);
    this.setState({
      width: cleanWidthAsNumber,
    });
  }

  changeProjectHeight (heightAsNumber) {
    let cleanHeightAsNumber = (!heightAsNumber) ? this.projectMinHeight : Math.max(this.projectMinHeight, heightAsNumber);
    this.setState({
      height: cleanHeightAsNumber,
    });
  }

  changeProjectFramerate (framerateAsNumber) {
    let cleanFramerateAsNumber = (!framerateAsNumber) ? this.projectMinFramerate : Math.max(this.projectMinFramerate, framerateAsNumber);
    this.setState({
      framerate: cleanFramerateAsNumber
    });
  }

  changeProjectBackgroundColor (color) {
    this.setState({
      backgroundColor: color.hex
    });
  }

  updateProjectSettings () {
    var nextProject = this.props.project.clone();
    console.log("before", nextProject);
    console.log("before state", this.state);
    nextProject.name = this.state.name;
    nextProject.width = this.state.width;
    nextProject.height = this.state.height;
    nextProject.framerate = this.state.framerate;
    nextProject.backgroundColor = this.state.backgroundColor;
    console.log("after", nextProject);
    this.props.updateEditorState({project:nextProject});
    this.props.toggle();
  }

  render() {
    return (
      <Modal isOpen={this.props.open} toggle={this.props.toggle} className={this.props.className}>
        <ModalHeader toggle={this.props.toggle}>Project Settings</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label className="project-property-label" for="projectName">Project name</Label>
            <WickInput
              id="projectName"
              type="text"
              placeholder="New Project"
              defaultValue={this.props.project.name}
              onChange={this.changeProjectName}
            />
          <Label className="project-property-label" for="projectWidth">Width</Label>
            <WickInput
              id="projectWidth"
              type="numeric"
              min={this.projectMinWidth}
              defaultValue={this.props.project.width}
              onChange = {this.changeProjectWidth}
            />
          <Label className="project-property-label" for="projectHeight">Height</Label>
            <WickInput
              id="projectHeight"
              type="numeric"
              min={this.projectMinHeight}
              defaultValue={this.props.project.height}
              onChange={this.changeProjectHeight}
            />
          <Label className="project-property-label" for="projectFramerate">Framerate (FPS)</Label>
            <WickInput
              id="projectFramerate"
              type="numeric"
              min={this.projectMinFramerate}
              defaultValue={this.props.project.framerate}
              onChange={this.changeProjectFramerate}
            />
          <Label className="project-property-label" for="projectBackgroundColor">Background Color</Label>
          <div id="background-color-picker-container" style={{width:"100%", height:"30px", backgroundColor:this.state.backgroundColor, borderRadius:"6px"}}>
            <WickInput
              type="color"
              id="project-background-color-picker"
              disableAlpha={true}
              placement={'bottom'}
              color={this.state.backgroundColor}
              onChangeComplete={this.changeProjectBackgroundColor}
              />
          </div>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="wick-warning" onClick={this.props.toggle}>Cancel</Button>
          <Button color="wick-accept" onClick={this.updateProjectSettings}>Save Settings</Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }
}

export default ProjectSettings
