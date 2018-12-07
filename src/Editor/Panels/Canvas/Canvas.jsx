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
    alert("Dropped Asset:" + draggedItem.name + " on the canvas at X:" + x + " Y:" + y);
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

    this.updateCanvas = this.updateCanvas.bind(this);
    this.updateActiveTool = this.updateActiveTool.bind(this);
    this.onCanvasModified = this.onCanvasModified.bind(this);
    this.onSelectionChanged = this.onSelectionChanged.bind(this);

    this.canvasContainer = React.createRef();
  }

  componentDidMount() {
    this.wickCanvas = new window.WickCanvas();
    window.WickCanvas.setup(this.canvasContainer.current);
    window.WickCanvas.resize();

    // This will go somewhere else later
    window.paper.view.zoom = 1;
    window.paper.view.center = new window.paper.Point(
      this.props.project.width/2,
      this.props.project.height/2);

    window.paper.drawingTools.onCanvasModified(this.onCanvasModified);
    window.paper.drawingTools.onSelectionChanged(this.onSelectionChanged);

    this.updateCanvas();
    this.updateActiveTool();
  }

  componentDidUpdate () {
    this.wickCanvas.render(this.props.project);

    this.updateCanvas();
    this.updateActiveTool();
  }

  updateCanvas () {
    this.wickCanvas.render(this.props.project, {
      onionSkinEnabled: this.props.onionSkinEnabled,
      onionSkinSeekBackwards: this.props.onionSkinSeekBackwards,
      onionSkinSeekForwards: this.props.onionSkinSeekForwards,
    });
    window.paper.project.selection.clear();
    this.props.selectionProperties.canvasUUIDs.forEach(uuid => {
      window.paper.project.selection.addItemByName(uuid);
    });
    window.paper.project.selection.updateGUI();
    window.paper.project.addLayer(window.paper.project.selection.guiLayer);
  }

  updateActiveTool () {
    let tool = window.paper.drawingTools[this.props.activeTool];
    tool.activate();
    Object.keys(this.props.toolSettings).forEach(key => {
      tool[key] = this.props.toolSettings[key];
    });

    if(!this.props.project.focus.timeline.activeLayer.activeFrame ||
       this.props.project.focus.timeline.activeLayer.locked) {
      window.paper.drawingTools.none.activate();
    }
  }

  onCanvasModified (e) {
    this.wickCanvas.applyChanges(this.props.project, e.layers);
    this.props.updateProject(this.props.project);
  }

  onSelectionChanged (e) {
    var selectedItems = window.paper.project.selection.items;

    let types = selectedItems.map(item => {
      if(item.className === 'Path' || item.className === 'CompoundPath') {
        return 'Path';
      } else if (item.className === 'Group') {
        return 'Group';
      }
      return null;
    });

    let content = null;
    if(types.indexOf('Path') !== -1 && types.indexOf('Group') !== -1) {
      content = 'multimixed';
    } else if(types.indexOf('Path') !== -1) {
      content = selectedItems.length > 1 ? 'multipath' : 'path'
    } else if(types.indexOf('Group') !== -1) {
      content = selectedItems.length > 1 ? 'multigroup' : 'group'
    }

    var newSelectionProperties = {
      canvasUUIDs: selectedItems.map(item => {
        return item.name;
      }),
      content: content,
    };

    if(window.paper.project.selection.items.length > 0) {
      newSelectionProperties.x = window.paper.project.selection.bounds.left;
      newSelectionProperties.y = window.paper.project.selection.bounds.top;
      newSelectionProperties.width = window.paper.project.selection.bounds.width;
      newSelectionProperties.height = window.paper.project.selection.bounds.height;
    }

    this.props.updateSelectionProperties(newSelectionProperties);
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
