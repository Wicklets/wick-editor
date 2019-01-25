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
import './_createsymbol.scss';
import WickInput from 'Editor/Util/WickInput/WickInput';

class CreateSymbol extends Component {
  constructor (props) {
    super(props);

    this.state = {
      symbolType: 'Clip',
      symbolName: 'New Symbol',
    }
  }

  render () {
    return (
      <Modal isOpen={this.props.open} toggle={this.props.toggle} className={this.props.className}>
        <ModalHeader toggle={this.props.toggle}>Convert To Symbol</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="symbolName">Name</Label>
            <WickInput type="text" onChange={this.updateSymbolName} placeholder="New Symbol" />
          </FormGroup>
          <FormGroup id="create-symbol-modal-symbol-type-selection">
            <WickInput
              type="radio"
              name="symbol_type"
              value={'Clip'}
              checked={this.state.symbolType === 'Clip'}
              onChange={() => this.updateSymbolType('Clip')}
            />Clip
            <br />
            <WickInput
              type="radio"
              name="symbol_type"
              value={'Button'}
              checked={this.state.symbolType === 'Button'}
              onChange={() => this.updateSymbolType('Button')}
            />Button
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="wick-warning" onClick={this.props.toggle}>Cancel</Button>
          <Button color="wick-accept" onClick={this.createSymbolFromSelection}>Create</Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }

  updateSymbolType = (newSymbolType) => {
    this.setState({
      ...this.state,
      symbolType: newSymbolType
    });
  }

  updateSymbolName = (newSymbolName) => {
    this.setState({
      ...this.state,
      symbolName: newSymbolName
    });
  }

  createSymbolFromSelection = () => {
    this.props.createSymbolFromSelection(this.state.symbolName, this.state.symbolType);
    this.props.toggle();
  }
}

export default CreateSymbol
