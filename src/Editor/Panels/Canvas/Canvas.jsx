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

import './_canvas.scss';

class Canvas extends Component {
  constructor (props) {
    super(props);

    this.onResize = this.onResize.bind(this);
    this.sendPropsToCanvas = this.sendPropsToCanvas.bind(this);
  }

  componentDidMount() {
    window.paper.setup(this.refs.canvas);
    window.paper.drawingTools.croquisBrush.activate();
    window.paper.view.center = new window.paper.Point(
      this.props.project.width/2,
      this.props.project.height/2
    );

    window.paper.drawingTools.cursor.onSelectionChanged(function (e) {
      console.log('onSelectionChanged fired');
    });

    var self = this;
    window.paper.drawingTools.onCanvasModified(function (e) {
      console.log('onCanvasModified fired.');
      self.props.updateProject(self.props.project);
    });

    this.sendPropsToCanvas();
  }

  componentDidUpdate () {
    this.sendPropsToCanvas();
  }

  onResize (width, height) {
    /*var widthDiff = window.paper.view.bounds.width - width;
    var heightDiff = window.paper.view.bounds.height - height;
    window.paper.view.viewSize.width = width;
    window.paper.view.viewSize.height = height;
    window.paper.view.center = window.paper.view.center.add(new window.paper.Point(
      widthDiff/2/window.paper.view.zoom,
      heightDiff/2/window.paper.view.zoom
    ));*/
  }

  sendPropsToCanvas () {

    // Update all tool settings
    Object.keys(this.props.toolSettings).forEach(
      (key) => window.paper.drawingTools[this.props.activeTool][key] = this.props.toolSettings[key]
    );

    let removeLayers = window.paper.project.layers.filter(layer => {
      return true;
    });
    removeLayers.forEach(layer => {
      layer.remove();
    });

    let bg = new window.paper.Layer();
    bg.locked = true;
    var bgRect = new window.paper.Path.Rectangle(
      new window.paper.Point(0,0),
      new window.paper.Point(this.props.project.width, this.props.project.height),
    );
    bgRect.remove();
    bgRect.fillColor = this.props.project.backgroundColor;
    bg.addChild(bgRect);
    window.paper.project.addLayer(bg);

    if(this.props.activeTool === 'cursor') {
      window.paper.project.addLayer(window.paper.drawingTools.cursor.getGUILayer());
      window.paper.project.layers['cursorGUILayer'].bringToFront();
    }

    this.props.project.focus.timeline.activeFrames.forEach(frame => {
      window.paper.project.addLayer(frame.svg);
      if(frame === this.props.project.focus.timeline.activeLayer.activeFrame) {
        frame.svg.activate();
      }
    });
  }

  render() {
    console.log("Rendering Canvas"); 
    return (
      <ReactResizeDetector handleWidth handleHeight onResize={this.onResize}>
        <div className="paper-canvas-container">
          <canvas className="paper-canvas" ref="canvas" resize="true" />
        </div>
      </ReactResizeDetector>
    );
  }
}

export default Canvas
