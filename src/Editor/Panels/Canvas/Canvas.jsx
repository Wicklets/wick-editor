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
import styles from './_canvas.scss';

class Canvas extends Component {
  constructor (props) {
    super(props);

    this.canvasContainer = React.createRef();
  }

  componentDidMount() {
    let canvasContainerElem = this.canvasContainer.current;
    let paper = window.paper;

    paper.selection = new window.paper.Selection();

    this.props.project.view.canvasContainer = canvasContainerElem;
    this.props.project.view.resize();

    // Listen to drawing tool events
    paper.drawingTools.setup();
    paper.drawingTools.onCanvasModified(this.onCanvasModified);
    paper.drawingTools.onSelectionChanged(this.onSelectionChanged);
    paper.drawingTools.onCanvasViewChanged(this.onCanvasViewChanged);
    paper.drawingTools.onSelectionTransformed(this.onSelectionTransformed);

    // Add some toaster warnings so there's some feedback when you try to draw somewhere that you can't.
    paper.drawingTools.none.onMouseDown = () => {
      if(!this.props.project.activeFrame) {
        this.props.toast('There is no frame to draw onto.', 'warning');
      } else if (this.props.project.activeLayer.locked) {
        this.props.toast('The layer you are trying to draw onto is locked.', 'warning');
      } else if (this.props.project.activeLayer.hidden) {
        this.props.toast('The layer you are trying to draw onto is hidden.', 'warning');
      }
    }

    // Add some toaster warnings for common fill bucket issues
    paper.drawingTools.fillbucket.onError = (message) => {
      if(message === 'OUT_OF_BOUNDS' || message === 'LEAKY_HOLE') {
        this.props.toast('The shape you are trying to fill has a gap.', 'warning');
      } else if (message === 'NO_PATHS') {
        this.props.toast('There is no hole to fill.', 'warning');
      } else {
        this.props.toast('There was an error while filling a hole.', 'error');
        console.error(message);
      }
    }

    this.updateCanvas(this.props.project);

    this.props.onRef(this);
  }

  componentDidUpdate () {
    this.updateCanvas(this.props.project);
  }

  onCanvasModified = (e) => {
    this.props.project.view.applyChanges();
    this.props.projectDidChange();
  }

  onSelectionTransformed = (e) => {
    this.props.projectDidChange(true);
  }

  onSelectionChanged = (e) => {
    let project = this.props.project;

    project.view.applyChanges();
    project.selection.clear();
    e.items.forEach(item => {
      let object = project.getChildByUUID(item.data.wickUUID);
      project.selection.select(object);
    });

    project.view.applyChanges();
    this.props.projectDidChange();
  }

  onCanvasViewChanged = (e) => {
    this.props.project.zoom = window.paper.view.zoom;
    this.props.project.pan.x = window.paper.view.center.x;
    this.props.project.pan.y = window.paper.view.center.y;
  }

  updateCanvas = (project) => {
    let paper = this.props.paper;
    let activeTool = this.props.activeTool;
    let toolSettings = this.props.toolSettings;
    let previewPlaying = this.props.previewPlaying;
    let canvasContainerElem = this.canvasContainer.current;

    // Render wick project
    project.view.canvasBGColor = styles.editorCanvasBorder;
    project.view.canvasContainer = canvasContainerElem;
    project.view.render();

    // update the paper.js active tool based on the editor active tool state.
    let tool = paper.drawingTools[activeTool];
    tool.activate();
    Object.keys(toolSettings).forEach(key => {
      tool[key] = toolSettings[key];
    });

    // If the active frame is on a locked/hidden layer, or there is no active frame, disable all tools.
    if(!project.activeFrame ||
       project.activeLayer.locked ||
       project.activeLayer.hidden) {
      paper.drawingTools.none.activate();
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

// react-dnd drag and drop target params
const canvasTarget = {
  drop(props, monitor, component) {
    const dropLocation = monitor.getClientOffset();
    let draggedItem = monitor.getItem();
    props.createImageFromAsset(draggedItem.uuid, dropLocation.x, dropLocation.y);
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

export default DropTarget(DragDropTypes.CANVAS, canvasTarget, collect)(Canvas);
