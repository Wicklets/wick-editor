import React, { Component } from 'react';

import {OutlinerObject} from './OutlinerObject/OutlinerObject'
import OutlinerTitle from './OutlinerTitle/OutlinerTitle'
import OutlinerDisplay from './OutlinerRow/OutlinerRowTypes/OutlinerDisplay'

import './_outliner.scss';

var classNames = require('classnames');

class Outliner extends Component {
  constructor(props) {
    super(props);

    this.state = {
        dragging: false,
        highlighted: null,
        display: {path: true, button: true, clip: true, text: true, image: true},
        collapsedUUIDs: {},
    }

    this.maxDepth = 3;
  }
  
  getDepth = (object) => {
      let depth = 0;
      while (object.parent !== null) {
          object = object.parent;
          depth ++;
      }
      return depth;
  }

  getCommonAncestorIndices = (ob1, ob2) => {
    let d1 = this.getDepth(ob1);
    let d2 = this.getDepth(ob2);
    let indices1 = [];
    let indices2 = [];
    let d_diff = Math.abs(d1 - d2);
    let temp;
    if (d1 > d2) {
      for (let i = 0; i < d_diff; i++) {
        temp = ob1;
        ob1 = ob1.parent;
        if (ob1.classname === 'Frame') {
            indices1.unshift(ob1.getChildren().length - 1 - ob1.getChildren().indexOf(temp));
        }
        else {
            indices1.unshift(ob1.getChildren().indexOf(temp));
        }
      }
    }
    else if (d2 > d1) {
      for (let i = 0; i < d_diff; i++) {
        temp = ob2;
        ob2 = ob2.parent;
        if (ob2.classname === 'Frame') {
            indices2.unshift(ob2.getChildren().length - 1 - ob2.getChildren().indexOf(temp));
        }
        else {
            indices2.unshift(ob2.getChildren().indexOf(temp));
        }
      }
    }

    while (ob1 !== ob2) {
      temp = ob1;
      ob1 = ob1.parent;
      if (ob1.classname === 'Frame') {
        indices1.unshift(ob1.getChildren().length - 1 - ob1.getChildren().indexOf(temp));
      }
      else {
        indices1.unshift(ob1.getChildren().indexOf(temp));
      }

      temp = ob2;
      ob2 = ob2.parent;
      if (ob2.classname === 'Frame') {
        indices2.unshift(ob2.getChildren().length - 1 - ob2.getChildren().indexOf(temp));
      }
      else {
        indices2.unshift(ob2.getChildren().indexOf(temp));
      }
    }
    return {ancestor: ob1, indices1: indices1, indices2: indices2};
  }

  //returns the object at indices[0:length] relative to ancestor
  //null if invalid indices
  getObjectAtIndices = (ancestor, indices, length) => {
    let object = ancestor;
    for (let j = 0; j < length; j++) {
        let index = indices[j];
        let children = object.getChildren();

        if (0 <= index && index < children.length) {
            if (object.classname === 'Frame') {
                index = children.length - index - 1;
            }
            object = children[index];
        }
        else {
            //bad indices
            return null;
        }
    }
    return object;
  }

  indicesEqual = (a, b) => {
      if (a.length !== b.length) {
          return false;
      }
      for (let i = a.length - 1; i >= 0; i--) {
          if (a[i] !== b[i]) {
              return false;
          }
      }
      return true;
  }

  isActive = (object) => {
    if (object === null || object === undefined) {
        return false;
    }
    if (object.classname === 'Layer') {
        return true;
    }
    else if (object.classname === 'Frame') {
        return object.start <= this.props.project.activeTimeline.playheadPosition &&
               this.props.project.activeTimeline.playheadPosition <= object.end;
    }
    else if (object.classname === 'Path') {
        return this.state.display[object.pathType];
    }
    else {
        return this.state.display[object.classname.toLowerCase()];
    }
  }

  select = (e, indices) => {
    if (indices === undefined || indices.length === 0) {return;}
    
    let object = this.getObjectAtIndices(this.props.project.activeTimeline, indices, indices.length);
    if (object === null) {
        //bad indices
        return;
    }

    let is_same_depth = this.state.highlighted !== null &&
        this.getDepth(this.state.highlighted) === this.getDepth(object);

    if (e.shiftKey && is_same_depth) {
        let {ancestor, indices1, indices2} = this.getCommonAncestorIndices(this.state.highlighted, object);
        if (indices1[0] > indices2[0]) {
            let temp = indices1;
            indices1 = indices2;
            indices2 = temp;
        }
        //traverse the timeline's items at depth=getDepth(object) from indices1 to indices2
        //and select each item
        let keep_going = true;
        let to_select = [];
        while (keep_going) {
            keep_going = !this.indicesEqual(indices1, indices2);

            //get item at indices1
            let item = this.getObjectAtIndices(ancestor, indices1, indices1.length);

            //select item if it's active
            if (this.isActive(item)) {
                to_select.push(item);
            }

            //increment indices1
            indices1[indices1.length-1] ++;
            for (let i = indices1.length - 1; i >= 0; i--) {
                item = this.getObjectAtIndices(ancestor, indices1, i);
                let length = item === null ? 0 : item.getChildren().length;
                if (indices1[i] >= length) {
                    indices1[i] = 0;
                    indices1[i - 1]++;
                }
                else {
                    break;
                }
            }
        } 

        this.props.selectObjects(to_select);
        this.setState({highlighted: object});
        if (object.classname === 'Layer') {
          this.props.setActiveLayerIndex(object.index);
        }
        else {
          this.props.setActiveLayerIndex(object.parentLayer.index);
        }
    }
    else if (e.ctrlKey && is_same_depth) {
        if (object.isSelected) {
            this.props.deselectObjects([object]);
        }
        else {
            this.props.selectObjects([object]);
            if (object.classname === 'Layer') {
              this.props.setActiveLayerIndex(object.index);
            }
            else {
              this.props.setActiveLayerIndex(object.parentLayer.index);
            }
        }
        this.setState({highlighted: object});
    }
    else {
        this.props.clearSelection();
        this.props.selectObjects([object]);
        this.setState({highlighted: object});
        if (object.classname === 'Layer') {
            this.props.setActiveLayerIndex(object.index);
        }
        else {
            this.props.setActiveLayerIndex(object.parentLayer.index);
        }
    }
  }

  toggleDropdown = (e, indices) => {
    let object = this.getObjectAtIndices(this.props.project.activeTimeline, indices, indices.length);
    let newCollapsedUUIDs = {...this.state.collapsedUUIDs};
    if (this.state.collapsedUUIDs[object.uuid]) {
      delete newCollapsedUUIDs[object.uuid];
    }
    else {
      newCollapsedUUIDs[object.uuid] = true;
    }
    this.setState({collapsedUUIDs: newCollapsedUUIDs});
  }

  render() {
      var timelineHierarchy = [this.props.project.activeTimeline];
      while (timelineHierarchy[0].parentTimeline !== null) {
          timelineHierarchy.unshift(timelineHierarchy[0].parentTimeline);
      }

      return (
      <div className={classNames("docked-pane outliner", this.props.className)}>
          <div className="outliner-title-container">
            <OutlinerTitle/>
          </div>

          <div className="outliner-body">

            <div className="outliner-item">
                <OutlinerDisplay
                tooltip="Display"
                display={this.state.display}
                onChange={(val) => {this.setState({"display": val});}}
                />
            </div>

            <div className="outliner-item">
            {this.props.project.activeTimeline.getChildren().map((layer, i) => {
                return (
                <OutlinerObject
                key={layer.uuid}
                clearSelection={this.props.clearSelection}
                selectObjects={this.props.selectObjects}
                editScript={this.props.editScript}
                playhead={this.props.project.activeTimeline.playheadPosition}
                depth={1}
                maxDepth={this.maxDepth}
                display={this.state.display}
                highlighted={this.state.highlighted}
                toggle={(e, indices, property) => {
                    indices.unshift(i);
                    if (property === 'select') {
                        this.select(e, indices);
                    }
                    else if (property === 'dropdown') {
                        this.toggleDropdown(e, indices);
                    }
                    else if (property === 'locked') {
                        let layer = this.getObjectAtIndices(this.props.project.activeTimeline, indices, indices.length);
                        this.props.toggleLocked(layer);
                    }
                    else if (property === 'hidden') {
                        let layer = this.getObjectAtIndices(this.props.project.activeTimeline, indices, indices.length);
                        this.props.toggleHidden(layer);
                    }
                }}
                data={layer}
                isActive={this.isActive}
                collapsedUUIDs={this.state.collapsedUUIDs}
                dragging={this.state.dragging}
                setDragging={(d) => {this.setState({dragging: d})}}
                setFocusObject={this.props.setFocusObject}
                setActiveLayerIndex={this.props.setActiveLayerIndex}
                moveSelection={this.props.moveSelection}
                />
                )
            })}
            </div>
          </div>
      </div>);
  }
}

export default Outliner