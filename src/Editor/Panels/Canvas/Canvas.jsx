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
      console.log(e);
    });
  }

  componentDidUpdate () {
    console.log(this.props.selectionBox);
    this.sendStateToCanvasView();
  }

  sendStateToCanvasView () {
    var projectView = new window.Wick.ProjectView(this.props.project);
    projectView.updateViewUsingModel(this.props.project);

    var removeLayers = [];
    window.paper.project.layers.forEach(layer => {
      if(layer.name.startsWith('frame_'))
        removeLayers.push(layer);
    });
    removeLayers.forEach(layer => {
      layer.remove();
    });

    projectView._layers.forEach(layer => {
      window.paper.project.addLayer(layer);
    });
    if(window.paper.project.layers['cursorGUILayer']) {
      window.paper.project.layers['cursorGUILayer'].bringToFront();
    }
  }

  render() {
    return (
      <div className="paper-canvas-container">
        <canvas className="paper-canvas" ref="canvas" resize="true" />
      </div>
    );
  }
}

export default Canvas
