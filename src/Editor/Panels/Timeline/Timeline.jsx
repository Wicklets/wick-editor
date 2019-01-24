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
  constructor (props) {
    super(props);
    this.updateAnimationTimelineData = this.updateAnimationTimelineData.bind(this);
  }

  componentDidMount () {
    let AnimationTimeline = window.AnimationTimeline;
    let self = this;

    this.onChange = this.onChange.bind(this);
    this.onSoftChange = this.onSoftChange.bind(this);
    this.onSelectionChange = this.onSelectionChange.bind(this);

    AnimationTimeline.setup(this.refs.container, function () {
      self.updateAnimationTimelineData();
      AnimationTimeline.resize();
      AnimationTimeline.repaint();
    });

    AnimationTimeline.onChange(this.onChange);
    AnimationTimeline.onSoftChange(this.onSoftChange);
    AnimationTimeline.onSelectionChange(this.onSelectionChange);
  }

  componentDidUpdate () {
    this.updateAnimationTimelineData();
  }

  updateAnimationTimelineData () {
    let AnimationTimeline = window.AnimationTimeline;
    let timeline = this.props.project.focus.timeline;
    let selectedUUIDs = this.props.getSelectedTimelineObjects().map(obj => {
      return obj.uuid;
    });
    let onionSkinOptions = this.props.getOnionSkinOptions();

    AnimationTimeline.setData({
      playheadPosition: timeline.playheadPosition,
      activeLayerIndex: timeline.activeLayerIndex,
      onionSkinEnabled: onionSkinOptions.onionSkinEnabled,
      onionSkinSeekForwards: onionSkinOptions.onionSkinSeekForwards,
      onionSkinSeekBackwards:onionSkinOptions.onionSkinSeekBackwards,
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

  onChange (e) {
    var nextProject = this.props.project;
    if(e.playhead !== undefined) {
      nextProject.focus.timeline.playheadPosition = e.playhead;
    }
    if(e.layerIndex !== undefined) {
      nextProject.focus.timeline.activeLayerIndex = e.layerIndex;
    }
    if(e.layers) {
      e.layers.forEach(layer => {
        if(layer.id) {
          // Update
          let wickLayer = nextProject.getChildByUUID(layer.id);
          nextProject.focus.timeline.moveLayer(wickLayer, layer.getIndex());
          wickLayer.locked = layer.locked;
          wickLayer.hidden = layer.hidden;
        } else {
          // Create
          let wickLayer = new window.Wick.Layer();
          nextProject.focus.timeline.addLayer(wickLayer);
        }
      });
    }
    if(e.frames) {
      e.frames.forEach(frame => {
        if(frame.id) {
          // Update
          let wickFrame = nextProject.getChildByUUID(frame.id);
          wickFrame.start = frame.start;
          wickFrame.end = frame.end;
          wickFrame.parent.removeFrame(wickFrame);
          nextProject.focus.timeline.layers[frame.layer.getIndex()].addFrame(wickFrame);
        } else {
          // Create
          let wickFrame = new window.Wick.Frame();
          wickFrame.start = frame.start;
          wickFrame.end = frame.end;
          nextProject.focus.timeline.activeLayer.addFrame(wickFrame);
        }
      });
    }
    if(e.tweens) {
      e.tweens.forEach(tween => {
        if(tween.id) {
          // Update
          var wickTween = nextProject.getChildByUUID(tween.id);
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
    this.props.updateProjectState(this.props.project.serialize());
  }

  onSoftChange (e) {

  }

  onSelectionChange (e) {
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
