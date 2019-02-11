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
    return "v4"
  }
  render() {
    return (
      <Modal id="alpha-modal" isOpen={this.props.open} toggle={this.props.toggle} className={this.props.className}>
        <ModalHeader toggle={this.props.toggle} className="alpha-warning-header">Wick Editor 1.0 Alpha {this.getVersion()}</ModalHeader>
        <ModalBody>
          <h4>This is an alpha test of version 1.0 of the Wick Editor.</h4>
          <h5>Wick Editor Alpha {this.getVersion()} Includes:</h5>
          <ul>
            <li>New Undo/Redo Interactions</li>
            <li>Autosaving / Autoloading</li>
            <li>New Event Based Scripting System</li>
            <li>Mouse, Key and On Load Events</li>
            <li>Timeline scripts (gotoAndPlay, gotoAndStop)</li>
            <li>Syntax Error Handling</li>
            <li>Runtime Error Handling</li>
            <li>Many, many, bugfixes...</li>
          </ul>
          <a target="_blank" rel="noopener noreferrer" href="https://forum.wickeditor.com">Report all bugs on the forums as an "Alpha Bug!"</a>
        </ModalBody>
        <ModalFooter>
          <Button className="alpha-warning-modal-button" color="wick-warning" onClick={() => window.location.href="http://www.wickeditor.com"}>No Thanks...</Button>
          <Button className="alpha-warning-modal-button" color="wick-accept" onClick={this.props.toggle}>Try the Alpha</Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }
}

export default AlphaWarning
