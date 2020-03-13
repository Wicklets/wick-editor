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
    this.attachProjectToComponent(this.props.project);

    this.updateCanvas(this.props.project);

    this.props.onRef(this);
  }

  componentDidUpdate () {
    this.updateCanvas(this.props.project);
  }

  attachProjectToComponent = (project) => {
    if(this.currentAttachedProject === project) return;
    this.currentAttachedProject = project;

    project.view.canvasBGColor = styles.editorCanvasBorder;
    project.view.canvasContainer = this.canvasContainer.current;
    project.view.resize();

    project.view.on('canvasModified', (e) => {
      this.props.projectDidChange();
    });

    project.view.on('eyedropperPickedColor', (e) => {
      this.props.onEyedropperPickedColor(e);
    });
  }

  updateCanvas = (project) => {
    this.attachProjectToComponent(project);
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
    if(draggedItem.files && draggedItem.files.length > 0) {
      // Dropped a file from native filesystem
      if(draggedItem.files[0].name.endsWith('.wick')) {
        // Wick Project (.wick file)
        var file = draggedItem.files[0];
        props.importProjectAsWickFile(file);
      } else {
        // Assets (images, sounds, etc)
        props.createAssets(draggedItem.files, []);
      }
    } else {
      // Dropped an asset from the asset library
      props.createImageFromAsset(draggedItem.uuid, dropLocation.x, dropLocation.y);
    }
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

export default DropTarget(DragDropTypes.CANVAS, canvasTarget, collect)(Canvas);
