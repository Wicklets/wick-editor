import React, { Component } from 'react';
import './_canvas.scss';

class Canvas extends Component {
  constructor (props) {
    super(props);

    this.sendStateToCanvasView = this.sendStateToCanvasView.bind(this);
  }

  componentDidMount() {
    window.paper.setup(this.refs.canvas);
    window.onresize = function () {
      var widthDiff = window.paper.view.viewSize.width - window.$('.paper-canvas-container').width();
      var heightDiff = window.paper.view.viewSize.height - window.$('.paper-canvas-container').height();
      window.paper.view.viewSize.width = window.$('.paper-canvas-container').width();
      window.paper.view.viewSize.height = window.$('.paper-canvas-container').height();
      window.paper.view.center = window.paper.view.center.add(new window.paper.Point(widthDiff/2/window.paper.view.zoom, heightDiff/2/window.paper.view.zoom))
    }
    window.paper.drawingTools.potraceBrush.activate();
    this.sendStateToCanvasView();

    window.paper.drawingTools.cursor.onSelectionChanged(function (e) {
      console.log('onSelectionChanged fired')
    });
    window.paper.drawingTools.onCanvasModified(function (e) {
      console.log('onCanvasModified fired.')
    });
  }

  componentDidUpdate () {
    this.sendStateToCanvasView();
  }

  shouldComponentUpdate () {
    // TODO posible optimization by doing something smart here.
    return true;
  }

  render() {
    return (
      <div className="paper-canvas-container">
        <canvas className="paper-canvas" ref="canvas" resize="true" />
      </div>
    );
  }

  sendStateToCanvasView () {
    var projectView = new window.Wick.ProjectView(this.props.project);
    projectView.updateViewUsingModel(this.props.project);

    // Remove current WickViews that are in the paper project.
    var removeLayers = [];
    window.paper.project.layers.forEach(layer => {
      removeLayers.push(layer);
    });
    removeLayers.forEach(layer => {
      layer.remove();
    });

    // Add layers of active frames from project view
    projectView._layers.forEach(layer => {
      window.paper.project.addLayer(layer);
    });

    // Make sure selection GUI is available if cursor is active tool.
    if(this.props.activeTool === 'cursor') {
      window.paper.project.addLayer(window.paper.drawingTools.cursor.getGUILayer());
      window.paper.project.layers['cursorGUILayer'].bringToFront();
    }

    // Activate paths layer of active frame so drawing tools will draw onto correct layer.
    let activeFrame = this.props.project.focus.timeline.activeLayer.activeFrame;
    if(activeFrame) {
      window.paper.project.layers['frame_paths_'+activeFrame.uuid].activate();
    }
  }
}

export default Canvas
