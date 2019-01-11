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
    this.updateSelection = this.updateSelection.bind(this);
    this.updateActiveTool = this.updateActiveTool.bind(this);

    this.updateSelectionTransformsProps = this.updateSelectionTransformsProps.bind(this);
    this.onCanvasModified = this.onCanvasModified.bind(this);
    this.onSelectionChanged = this.onSelectionChanged.bind(this);

    this.canvasContainer = React.createRef();
  }

  componentDidMount() {
    this.props.onRef(this);

    this.wickCanvas = new window.WickCanvas();
    window.WickCanvas.setup(this.canvasContainer.current);
    window.WickCanvas.resize();

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
    this.updateSelection();
    this.updateActiveTool();
  }

  updateCanvas () {
    this.wickCanvas.render(this.props.project, {
      onionSkinEnabled: this.props.onionSkinEnabled,
      onionSkinSeekBackwards: this.props.onionSkinSeekBackwards,
      onionSkinSeekForwards: this.props.onionSkinSeekForwards,
    });
  }

  updateSelection () {
    window.paper.project.selection.clear();
    this.props.selection.selectedPaths.forEach(obj => {
      window.paper.project.selection.addItemByName(obj.name);
    });
    this.props.selection.selectedClips.forEach(obj => {
      window.paper.project.selection.addItemByName('wick_clip_'+obj.uuid);
    });
    window.paper.project.selection.updateGUI();
    if(this.props.selection.selectedCanvasObjects.length > 0) {
      this.updateSelectionAttributes();
      this.wickCanvas.applyChanges(this.props.project, window.paper.project.layers);
    }
    window.paper.project.addLayer(window.paper.project.selection.guiLayer);
  }

  updateSelectionAttributes () {
    let selection = window.paper.project.selection;
    let attributes = this.props.selection.attributes;

    console.log(attributes)
    selection.setPosition(attributes.x, attributes.y);
    selection.setWidthHeight(attributes.width, attributes.height);
    selection.setScale(attributes.scaleW, attributes.scaleH);
    selection.setRotation(attributes.rotation);
    selection.setFillColor(attributes.fillColor);
    selection.setStrokeColor(attributes.strokeColor);
    selection.setOpacity(attributes.opacity);
    selection.setStrokeWidth(attributes.strokeWidth);
  }

  updateActiveTool () {
    let tool = window.paper.drawingTools[this.props.activeTool];
    tool.activate();
    Object.keys(this.props.toolSettings).forEach(key => {
      tool[key] = this.props.toolSettings[key];
    });

    if(!this.props.project.focus.timeline.activeLayer.activeFrame ||
       this.props.project.focus.timeline.activeLayer.locked ||
       this.props.project.focus.timeline.activeLayer.hidden) {
      window.paper.drawingTools.none.activate();
    }
  }

  updateSelectionTransformsProps () {
    if(window.paper.project.selection.items.length > 0) {
      let attributes = this.props.selection.attributes;
      attributes.x = window.paper.project.selection.bounds.left;
      attributes.y = window.paper.project.selection.bounds.top;
      attributes.width = window.paper.project.selection.bounds.width;
      attributes.height = window.paper.project.selection.bounds.height;
      attributes.scaleW = 1;
      attributes.scaleH = 1;

      let firstItem = window.paper.project.selection.items[0];
      attributes.fillColor = firstItem.fillColor ? firstItem.fillColor.toCSS() : 'rgba(0,0,0,0)';
      attributes.strokeColor = firstItem.strokeColor ? firstItem.strokeColor.toCSS() : 'rgba(0,0,0,0)';
      attributes.opacity = firstItem.opacity ? firstItem.opacity : 1;
      attributes.strokeWidth = firstItem.strokeWidth ? firstItem.strokeWidth : 0;
    }
  }

  onCanvasModified (e) {
    this.wickCanvas.applyChanges(this.props.project, e.layers);

    this.updateSelectionTransformsProps();

    this.props.updateEditorState({
      project: this.props.project,
      selection: this.props.selection,
    });
  }

  onSelectionChanged (e) {
    this.props.selection.selectObjects(window.paper.project.selection.items);

    this.updateSelectionTransformsProps();

    this.props.updateEditorState({
      selection: this.props.selection,
    });
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
