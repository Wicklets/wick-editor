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

import Breadcrumbs from './Breadcrumbs/Breadcrumbs';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import { DropTarget } from 'react-dnd';
import DragDropTypes from 'Editor/DragDropTypes.js';

import './_timeline.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

class Timeline extends Component {
  constructor (props) {
    super(props);

    this.canvasContainer = React.createRef();
  }

  componentDidMount () {
    let canvasContainerElem = this.canvasContainer.current;

    this.props.project.guiElement.canvasContainer = canvasContainerElem;
    this.props.project.guiElement.resize();
    this.props.project.guiElement.build();
  }

  componentDidUpdate () {
    var project = this.props.project;

    if(project !== this.currentAttachedProject) {
      project.guiElement.on('projectModified', (e) => {
        this.props.projectDidChange();
      });
      project.guiElement.on('projectSoftModified', (e) => {

      });
      project.guiElement.on('doubleClick', (e) => {
        console.log('doubleClick event fired');
        console.log(e);
      });
      project.guiElement.on('rightClick', (e) => {
        console.log('rightClick event fired');
        console.log(e);
      });
      this.currentAttachedProject = project;
    }

    project.guiElement.canvasContainer = this.canvasContainer.current;
    project.guiElement.build();
  }

  render() {
    const { connectDropTarget, isOver } = this.props;

    return connectDropTarget (
      <div id="animation-timeline-container">
        <Breadcrumbs
          project={this.props.project}
          setFocusObject={this.props.setFocusObject}
        />
        { isOver && <div className="drag-drop-overlay" /> }
        <div id="animation-timeline" ref={this.canvasContainer} />
        <div className="animation-timeline-add-keyframe-button">
          <ActionButton
            color="tool"
            id={"add-keyframe-button"}
            tooltip={"Add Tween"}
            action={this.props.addTweenKeyframe}
            tooltipPlace={"top"}
            icon={'tween'}
          />
        </div>
      </div>

    )
  }
}

// react-dnd drag and drop target params
const timelineTarget = {
  drop(props, monitor) {
    const dropLocation = monitor.getClientOffset();
    let draggedItem = monitor.getItem();
    props.dropSoundOntoTimeline(draggedItem.uuid, dropLocation.x, dropLocation.y);
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

export default DropTarget(DragDropTypes.TIMELINE, timelineTarget, collect)(Timeline)
