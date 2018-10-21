import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, ModalHeader, ModalBody, FormGroup, Label, Input } from 'reactstrap';

class ProjectSettings extends Component {
  constructor(props) {
    super(props);

    //this.toggle = this.toggle.bind(this);
  }

  /*setProjectName (event) {
    event.persist();
    this.setState(prevState => ({
      project: {
          ...prevState.project,
          name: event.target.value,
      }
    }));
  }*/

  toggle () {
    this.props.openModal(null);
  }

  render() {
    return (
      <Modal isOpen={this.props.open} toggle={this.toggle.bind(this)} className={this.props.className}>
        <ModalHeader toggle={this.toggle.bind(this)}>Project Settings</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="projectName">Email</Label>
            <Input id="projectName"
                   placeholder="New Project" />
          </FormGroup>
        </ModalBody>
      </Modal>
    );
  }
}

export default ProjectSettings
