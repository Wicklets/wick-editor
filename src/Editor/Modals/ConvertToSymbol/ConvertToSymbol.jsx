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
    this.convertSelectionToSymbol = this.convertSelectionToSymbol.bind(this);
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
          <Button color="wick-accept" onClick={this.convertSelectionToSymbol}>Create</Button>{' '}
        </ModalFooter>
      </Modal>
    );
  }

  convertSelectionToSymbol () {
    let svg = window.paper.project.selection.exportSVG();
    let clips = [] // get groups

    let clip = new window.Wick.Clip();
    clip.timeline.addLayer(new window.Wick.Layer());
    clip.timeline.layers[0].addFrame(new window.Wick.Frame());
    clip.timeline.layers[0].frames[0].svg = svg;
    clips.forEach(clip => {
      clip.timeline.layers[0].frames[0].addClip(clip);
    });
    clip.x = window.paper.project.selection.bounds.center.x;
    clip.y = window.paper.project.selection.bounds.center.y;

    window.paper.drawingTools.cursor.deleteSelectedItems();

    this.props.project.focus.timeline.activeLayer.activeFrame.addClip(clip);
    this.props.updateEditorState({project:this.props.project});

    this.props.toggle();
  }
}

export default ConvertToSymbol
