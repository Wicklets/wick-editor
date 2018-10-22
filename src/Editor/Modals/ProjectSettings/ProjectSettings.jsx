import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from 'reactstrap';
import ColorPicker from 'Editor/Util/ColorPicker/ColorPicker';

class ProjectSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: null,
      width: null,
      height: null,
      framerate: null,
      backgroundColor: null,
    }

    this.changeProjectName = this.changeProjectName.bind(this);
    this.changeProjectWidth = this.changeProjectWidth.bind(this);
    this.changeProjectHeight = this.changeProjectHeight.bind(this);
    this.changeProjectFramerate = this.changeProjectFramerate.bind(this);
    this.changeProjectBackgroundColor = this.changeProjectBackgroundColor.bind(this);

    this.updateProjectSettings = this.updateProjectSettings.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentWillMount () {
    this.setState({
      name: this.props.project.name,
      width: this.props.project.width,
      height: this.props.project.height,
      framerate: this.props.project.framerate,
      backgroundColor: this.props.project.backgroundColor,
    });
  }

  changeProjectName (event) {
    this.setState({
      name: event.target.value
    });
  }

  changeProjectWidth (event) {
    this.setState({
      width: event.target.value
    });
  }

  changeProjectHeight (event) {
    this.setState({
      height: event.target.value
    });
  }

  changeProjectFramerate (event) {
    this.setState({
      framerate: event.target.value
    });
  }

  changeProjectBackgroundColor (color) {
    console.log(color)
    this.setState({
      backgroundColor: color.hex
    });
  }

  updateProjectSettings () {
    this.props.updateProjectSettings(this.state);
    this.toggle();
  }

  toggle () {
    this.props.openModal(null);
  }

  render() {
    return (
      <Modal isOpen={this.props.open} toggle={this.toggle} className={this.props.className}>
        <ModalHeader toggle={this.toggle}>Project Settings</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="projectName">Project name</Label>
            <Input id="projectName"
                   placeholder="New Project"
                   defaultValue={this.props.project.name}
                   onChange={this.changeProjectName}
            />
          <Label for="projectWidth">Width</Label>
            <Input id="projectWidth"
                   defaultValue={this.props.project.width}
                   onChange={this.changeProjectWidth}
            />
          <Label for="projectHeight">Width</Label>
            <Input id="projectHeight"
                   defaultValue={this.props.project.height}
                   onChange={this.changeProjectHeight}
            />
          <Label for="projectFramerate">Framerate (FPS)</Label>
            <Input id="projectFramerate"
                   defaultValue={this.props.project.framerate}
                   onChange={this.changeProjectFramerate}
            />
          <Label for="projectBackgroundColor">Background Color</Label>
            <ColorPicker
              disableAlpha={true}
              placement={'bottom'}
              color={this.state.backgroundColor}
              onColorChange={this.changeProjectBackgroundColor}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.updateProjectSettings}>Done</Button>{' '}
          <Button color="secondary" onClick={this.toggle}>Cancel</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default ProjectSettings
