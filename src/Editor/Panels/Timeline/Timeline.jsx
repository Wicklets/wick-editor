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

import './_timeline.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

class Timeline extends Component {
  componentDidMount () {
    let AnimationTimeline = window.AnimationTimeline;

    this.onChange = this.onChange.bind(this);
    this.onSoftChange = this.onSoftChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);

    AnimationTimeline.setup(this.refs.container, function () {
      AnimationTimeline.resize();
      AnimationTimeline.repaint();
    });

    AnimationTimeline.onChange(this.onChange);
    AnimationTimeline.onSoftChange(this.onSoftChange);
    AnimationTimeline.onSelectionChange(this.onSelectionChange);

    this.updateTimeline();

    this.props.onRef(this);
  }

  componentDidUpdate () {
    this.updateTimeline();
  }

  onChange = (e) => {
    let project = this.props.project;

    if(e.playhead !== undefined) {
      project.focus.timeline.playheadPosition = e.playhead;
    }
    if(e.layerIndex !== undefined) {
      project.focus.timeline.activeLayerIndex = e.layerIndex;
    }
    if(e.layers) {
      e.layers.forEach(layer => {
        if(layer.id) {
          // Update
          let wickLayer = project.getChildByUUID(layer.id);
          project.focus.timeline.moveLayer(wickLayer, layer.getIndex());
          wickLayer.locked = layer.locked;
          wickLayer.hidden = layer.hidden;
        } else {
          // Create
          let wickLayer = new window.Wick.Layer();
          project.focus.timeline.addLayer(wickLayer);
        }
      });
    }
    if(e.frames) {
      e.frames.forEach(frame => {
        if(frame.id) {
          // Update
          let wickFrame = project.getChildByUUID(frame.id);
          wickFrame.start = frame.start;
          wickFrame.end = frame.end;
        } else {
          // Create
          let wickFrame = new window.Wick.Frame();
          wickFrame.start = frame.start;
          wickFrame.end = frame.end;
          project.focus.timeline.activeLayer.addFrame(wickFrame);
        }
      });
    }
    if(e.tweens) {
      e.tweens.forEach(tween => {
        if(tween.id) {
          // Update
          var wickTween = project.getChildByUUID(tween.id);
          wickTween.playheadPosition = tween.playheadPosition;
        } else {
          // Create
        }
      });
    }

    if(e.onionSkinEnabled !== undefined)
      project.onionSkinEnabled = e.onionSkinEnabled;
    if(e.onionSkinSeekForwards !== undefined)
      project.onionSkinSeekForwards = e.onionSkinSeekForwards;
    if(e.onionSkinSeekBackwards !== undefined)
      project.onionSkinSeekBackwards = e.onionSkinSeekBackwards;

    this.props.projectDidChange();
  }

  onSoftChange = (e) => {
    this.props.project.focus.timeline.playheadPosition = e.playhead;
    this.props.project.selection.clear();
    this.props.projectDidChange();
  }

  onSelectionChange = (e) => {
    let project = this.props.project;

    project.selection.clear();
    e.frames.forEach(frame => {
      let object = project.getChildByUUID(frame.id);
      project.selection.select(object);
    });

    this.props.projectDidChange();
  }

  updateTimeline = () => {
    let AnimationTimeline = window.AnimationTimeline;
    let timeline = this.props.project.focus.timeline;
    let selectedUUIDs = this.props.project.selection._uuids;
    let project = this.props.project;

    AnimationTimeline.setData({
      playheadPosition: timeline.playheadPosition,
      activeLayerIndex: timeline.activeLayerIndex,
      onionSkinEnabled: project.onionSkinEnabled,
      onionSkinSeekForwards: project.onionSkinSeekForwards,
      onionSkinSeekBackwards:project.onionSkinSeekBackwards,
      layers: timeline.layers.map(layer => {
        return {
          id: layer.uuid,
          label: layer.name,
          locked: layer.locked,
          hidden: layer.hidden,
          frames: layer.frames.map(frame => {
            return {
              id: frame.uuid,
              label: frame.identifier,
              start: frame.start,
              end: frame.end,
              selected: selectedUUIDs.indexOf(frame.uuid) !== -1,
              contentful: frame.contentful,
              tweens: frame.tweens.map(tween => {
                return {
                  uuid: tween.uuid,
                  selected: selectedUUIDs.indexOf(tween.uuid) !== -1,
                  playheadPosition: tween.playheadPosition,
                }
              }),
            }
          }),
        }
      })
    });
    AnimationTimeline.repaint();
  }

  render() {
    return(
      <div id="animation-timeline-container">
        <Breadcrumbs 
          project={this.props.project}
          setFocusObject={this.props.setFocusObject}
        />
        <div id="animation-timeline" ref="container" />
      </div>

    )
  }
}

export default Timeline
