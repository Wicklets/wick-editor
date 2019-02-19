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
import { throttle } from 'underscore';

import './_canvas.scss';
import styles from './_canvas.scss';

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

    this.canvasContainer = React.createRef();
  }

  componentDidMount() {
    let canvasContainerElem = this.canvasContainer.current;

    window.paper.selection = new window.paper.Selection();

    this.props.project.view.setCanvasContainer(canvasContainerElem);
    this.props.project.view.resize();

    canvasContainerElem.children[0].setAttribute('tabindex', 0);
    canvasContainerElem.children[0].onclick = (e) => {
      canvasContainerElem.children[0].focus();
    }

    window.paper.drawingTools.setup();
    window.paper.drawingTools.onCanvasModified(this.onCanvasModified);
    window.paper.drawingTools.onSelectionChanged(this.onSelectionChanged);
    window.paper.drawingTools.onCanvasViewChanged(this.onCanvasViewChanged);
    window.paper.drawingTools.onSelectionTransformed(this.onSelectionTransformed);

    this.updateCanvas();
    //this.props.project.view.recenter();
  }

  componentDidUpdate () {
    this.updateCanvas();
  }

  onCanvasModified = (e) => {
    console.log('onCanvasModified')
    this.props.project.view.applyChanges();
    this.props.projectDidChange();
  }

  onSelectionTransformed = (e) => {
    console.log('onSelectionTransformed')
    this.props.projectDidChange(true);
  }

  onSelectionChanged = (e) => {
    console.log('onSelectionChanged')

    let paper = this.props.paper;
    let project = this.props.project;

    project.selection.clear();
    e.items.forEach(item => {
      let object = project.getChildByUUID(item.data.wickUUID);
      project.selection.select(object);
    });

    this.props.projectDidChange();
  }

  onCanvasViewChanged = (e) => {
    this.props.project.zoom = window.paper.view.zoom;
    this.props.project.pan.x = window.paper.view.center.x;
    this.props.project.pan.y = window.paper.view.center.y;
  }

  updateCanvas = () => {
    let project = this.props.project;
    let paper = this.props.paper;
    let activeTool = this.props.activeTool;
    let toolSettings = this.props.toolSettings;
    let previewPlaying = this.props.previewPlaying;
    let canvasContainerElem = this.canvasContainer.current;

    // Render wick project
    project.view.canvasBGColor = styles.editorCanvasBorder;
    if(project.view.setCanvasContainer(canvasContainerElem)) {
      //project.view.recenter();
    }
    project.view.render();

    // update the paper.js active tool based on the editor active tool state.
    let tool = paper.drawingTools[activeTool];
    tool.activate();
    Object.keys(toolSettings).forEach(key => {
      tool[key] = toolSettings[key];
    });

    // if there is no layer/frame to draw on, activate the 'none' tool.
    if(!project.activeFrame ||
       project.activeLayer.locked ||
       project.activeLayer.hidden) {
      paper.drawingTools.none.activate();
    }

    // if preview playing, use the Interact tool
    if(previewPlaying) {
      project.view.interactTool.activate();
    }
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
