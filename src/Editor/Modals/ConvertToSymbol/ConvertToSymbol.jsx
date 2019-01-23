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
import { Input, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label } from 'reactstrap';
import './_converttosymbol.scss';

class ConvertToSymbol extends Component {
  constructor (props) {
    super(props);
    this.createClipFromSelection = this.createClipFromSelection.bind(this);
  }

  render() {
    return (
      <Modal isOpen={this.props.open} toggle={this.props.toggle} className={this.props.className}>
        <ModalHeader toggle={this.props.toggle}>Convert To Symbol</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="symbolName">Name</Label>
            <Input type="text" name="symbolName" id="symbolName" placeholder="New Symbol" />
          </FormGroup>
          <FormGroup>
            <Input
              type="radio"
              name="symbolType"
            />
          {'Clip'}
          </FormGroup>
          <FormGroup>
            <Input
              type="radio"
              name="symbolType"
            />
          {'Button'}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="wick-warning" onClick={this.props.toggle}>Cancel</Button>
          <Button color="wick-accept" onClick={this.createClipFromSelection}>Create</Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }

  createClipFromSelection () {
    this.props.createClipFromSelection();
    this.props.toggle();
  }
}

export default ConvertToSymbol
