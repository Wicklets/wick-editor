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
    alert("Dropped Asset:" + draggedItem.uuid + " on the canvas at X:" + x + " Y:" + y);
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

    this.wickCanvas = null;

    this.onCanvasModified = this.onCanvasModified.bind(this);
    this.onSelectionChanged = this.onSelectionChanged.bind(this);

    this.canvasContainer = React.createRef();
  }

  componentDidMount() {
    this.wickCanvas = this.props.canvas;
    window.Wick.Canvas.setup(this.canvasContainer.current);
    window.Wick.Canvas.resize();

    window.paper.view.zoom = 1;
    window.paper.view.center = new window.paper.Point(
      this.props.project.width/2,
      this.props.project.height/2
    );

    window.paper.drawingTools.onCanvasModified(this.onCanvasModified);
    window.paper.drawingTools.onSelectionChanged(this.onSelectionChanged);

    this.props.updateCanvas();
  }

  onCanvasModified (e) {
    this.wickCanvas.applyChanges(this.props.project, e.layers);
    this.props.forceUpdateProject();
  }

  onSelectionChanged (e) {
    this.props.selectObjects(window.paper.project.selection.items);
    this.props.forceUpdateProject();
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

  /*
  updateSelectionAttributes () {
    let selection = window.paper.project.selection;
    let attributes = this.props.selection.attributes;

    selection.setPosition(attributes.x, attributes.y);
    selection.setWidthHeight(attributes.width, attributes.height);
    selection.setScale(attributes.scaleW, attributes.scaleH);
    selection.setRotation(attributes.rotation);
    selection.setFillColor(attributes.fillColor);
    selection.setStrokeColor(attributes.strokeColor);
    selection.setOpacity(attributes.opacity);
    selection.setStrokeWidth(attributes.strokeWidth);
  }
  */
}

export default DropTarget(DragDropTypes.CANVAS, canvasTarget, collect)(Canvas);
