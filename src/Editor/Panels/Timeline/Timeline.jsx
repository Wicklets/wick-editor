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
import ReactResizeDetector from 'react-resize-detector';

import './_timeline.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount () {
    let AnimationTimeline = window.AnimationTimeline;
    AnimationTimeline.setup(this.refs.container, function () {
      AnimationTimeline.setData({
        playheadPosition: 1,
        activeLayerIndex: 0,
        onionSkinEnabled: false,
        onionSkinSeekForwards: 1,
        onionSkinSeekBackwards: 1,
        layers: [],
      });
      AnimationTimeline.repaint();
    });

    AnimationTimeline.onChange(e => {

    });

    AnimationTimeline.onSoftChange(e => {

    });

    AnimationTimeline.onSelectionChange(e => {

    });
  }

  componentDidUpdate () {

  }

  onResize (width, height) {
    window.AnimationTimeline.resize();
  }

  render() {
    return(
      <ReactResizeDetector handleWidth handleHeight onResize={this.onResize}>
        <div id="animationtimeline" ref="container"></div>
      </ReactResizeDetector>
    )
  }
}

export default Timeline
