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
// import Draggable from 'react-draggable';
// import { Resizable, ResizableBox } from 'react-resizable';
import { Rnd } from "react-rnd";

import './_popoutcodeditor.scss';

class PopOutCodeEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 300,
      height: 300,
    }

  }

  render() {
    return (
      <Rnd
        id="code-editor-resizeable"
        bounds="window"
        dragHandleClassName="code-editor-drag-handle"
        default={{
          x: 0,
          y: 0,
          width: 320,
          height: 200
        }}
      >
        <div
          className="code-editor-drag-handle"/>
      </Rnd>
    );
  }
}

export default PopOutCodeEditor;

/*
        <Draggable
          handle="strong">
          <ResizableBox
            id="code-editor-resizeable"
            classname="code-editor-resizer"
            width={this.state.width}
            height={this.state.height}
            onResize={this.onResize}
            handleSize={[20,20]}>
          <div
            className="code-editor-resizer"
            style={
              {
                width: this.state.width + 'px',
                height: this.state.height + 'px'
              }}>
            <strong>
              <div
                className="code-editor-drag-handle">Drag here</div>
            </strong>
            <div>You must click my handle to drag me</div>
          </div>
        </ResizableBox>
      </Draggable>
      */
