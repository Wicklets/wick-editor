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
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, } from 'reactstrap';

import './_autosavewarning.scss';

class AutosaveWarning extends Component {
  loadAndToggle = () => {
    this.props.loadAutosavedProject()
    this.props.toggle()
  }

  render() {
    return (
      <Modal
      id="autosave-warning-modal"
      isOpen={this.props.open}
      toggle={this.props.toggle}
      className={this.props.className}>
        <ModalHeader
        toggle={this.props.toggle}
        className="autosave-warning-header">An autosave was found.</ModalHeader>
        <ModalBody>
          The Wick Editor found an autosaved project. Would you like to load it?
        </ModalBody>
        <ModalFooter>
          <Button
          className="autosave-warning-modal-button"
          color="wick-warning"
          onClick={this.props.toggle}>Delete Project</Button>
          <Button
          className="autosave-warning-modal-button"
          color="wick-accept"
          onClick={this.loadAndToggle}>Load Project</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default AutosaveWarning
