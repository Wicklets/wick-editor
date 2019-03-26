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

import './_alphawarning.scss';

class AlphaWarning extends Component {
  getVersion() {
    return "v5"
  }
  render() {
    return (
      <Modal id="alpha-modal" isOpen={this.props.open} toggle={this.props.toggle} className={this.props.className}>
        <ModalHeader toggle={this.props.toggle} className="alpha-warning-header">Wick Editor 1.0 Alpha {this.getVersion()}</ModalHeader>
        <ModalBody>
          <h5>Wick Editor Alpha {this.getVersion()} Includes:</h5>
          <ul>
            <li>New Interface Design</li>
            <li>New Toolbar Layout, Actions and Icons</li>
            <li>Inspector Actions have been simplified and remapped</li>
            <li>ZIP, GIF, and Improved .wick export</li>
            <li>Breadcrumbs Bar has been added</li>
            <li>Added new WebGL renderer.</li>
            <li>Many, many, bugfixes...</li>
          </ul>

          <h5>This is a Test! Please report bugs on our <a target="_blank" rel="noopener noreferrer" href="https://forum.wickeditor.com">forum!</a></h5>
        </ModalBody>
        <ModalFooter>
          <Button className="alpha-warning-modal-button" color="wick-warning" onClick={() => window.location.href="http://www.wickeditor.com"}>Go Back.</Button>
          <Button className="alpha-warning-modal-button" color="wick-accept" onClick={this.props.toggle}>Try the Alpha</Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }
}

export default AlphaWarning
