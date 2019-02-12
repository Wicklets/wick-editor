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
import { DropTarget } from 'react-dnd';
import DragDropTypes from 'Editor/DragDropTypes.js';

import './_canvas.scss';

// Specification for drag and drop
const canvasTarget = {
  // canDrop(props, monitor) {
  //   // Dragged item
  //   let draggedItem = monitor.getItem();
  // }

  drop(props, monitor, component) {
    // Drop location
    const { x, y } = monitor.getClientOffset();

    // Dragged item
    let draggedItem = monitor.getItem();
    //alert("Dropped Asset:" + draggedItem.uuid + " on the canvas at X:" + x + " Y:" + y);

    props.createImageFromAsset(draggedItem.uuid, x, y);
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

class Canvas extends Component {
  constructor (props) {
    super(props);

    this.onCanvasModified = this.onCanvasModified.bind(this);
    this.onSelectionChanged = this.onSelectionChanged.bind(this);

    this.canvasContainer = React.createRef();
  }

  componentDidMount() {
    this.canvasContainer = this.canvasContainer.current;
    this.props.project.view.setCanvasContainer(this.canvasContainer);
    this.props.project.view.resize();

    this.canvasContainer.children[0].setAttribute('tabindex', 0);
    this.canvasContainer.children[0].onclick = (e) => {
      this.canvasContainer.children[0].focus();
    }

    window.paper.view.zoom = 1;
    window.paper.view.center = new window.paper.Point(
      this.props.project.width/2,
      this.props.project.height/2
    );

    window.paper.drawingTools.onCanvasModified(this.onCanvasModified);
    window.paper.drawingTools.onSelectionChanged(this.onSelectionChanged);
  }

  onCanvasModified (e) {
    return;
    this.project.view.applyChanges();
    this.props.setState({
      project: this.props.project.serialize(),
    });
  }

  onSelectionChanged (e) {
    this.props.selectObjects(window.paper.project.selection.items.map(item => {
      let name = item.name;
      if(name.startsWith('wick_clip_')) name = name.split('wick_clip_')[1];
      return this.props.project.getChildByUUID(name);
    }));
  }

  render() {
    const { connectDropTarget, isOver } = this.props;

    return connectDropTarget (
      <div id="canvas-container-wrapper" style={{width:"100%", height:"100%"}}>
        { isOver && <div className="drag-drop-overlay" /> }
        <div id="wick-canvas-container" ref={this.canvasContainer}></div>
      </div>
    )
  }
}

export default DropTarget(DragDropTypes.CANVAS, canvasTarget, collect)(Canvas);
