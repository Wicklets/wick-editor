import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';

class ProjectSettings extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
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
            <Label for="projectName">Email</Label>
            <Input id="projectName"
                   placeholder="New Project"
                   defaultValue={this.props.project.name}
                   onChange={(event) => {
                     this.props.updateProjectSettings({name:event.target.value})
                   }} />
          </FormGroup>
        </ModalBody>
      </Modal>
    );
  }
}

export default ProjectSettings
