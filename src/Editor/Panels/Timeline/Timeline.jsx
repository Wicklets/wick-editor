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

import './_timeline.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

class Timeline extends Component {
  componentDidMount () {
    let AnimationTimeline = window.AnimationTimeline;
    let self = this;

    this.onChange = this.onChange.bind(this);
    this.onSoftChange = this.onSoftChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);

    AnimationTimeline.setup(this.refs.container, function () {
      self.props.updateTimeline();
      AnimationTimeline.resize();
      AnimationTimeline.repaint();
    });

    AnimationTimeline.onChange(this.onChange);
    AnimationTimeline.onSoftChange(this.onSoftChange);
    AnimationTimeline.onSelectionChange(this.onSelectionChange);
  }

  componentDidUpdate () {
    this.props.updateTimeline();
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

    this.props.setOnionSkinOptions({
      onionSkinEnabled: e.onionSkinEnabled,
      onionSkinSeekBackwards: e.onionSkinSeekBackwards,
      onionSkinSeekForwards: e.onionSkinSeekForwards,
    });
    this.props.updateProjectInState();
  }

  onSoftChange = (e) => {

  }

  onSelectionChange = (e) => {
    let self = this;
    this.props.selectObjects(e.frames.map(frame => {
      return self.props.project.getChildByUUID(frame.id);
    }));
  }

  render() {
    return(
      <div id="animationtimeline" ref="container"></div>
    )
  }
}

export default Timeline
