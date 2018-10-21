import React, { Component } from 'react';
import './_canvas.scss';

class Canvas extends Component {
  componentDidMount() {
    window.paper.setup(this.refs.canvas);
    var p = new window.paper.Path.Circle(new window.paper.Point(30,30), 50);
    p.fillColor = 'blue';
    p.strokeColor = 'red';
    p.strokeWidth = 5;
    window.onresize = function () {
      var widthDiff = window.paper.view.viewSize.width - window.$('.paper-canvas-container').width();
      var heightDiff = window.paper.view.viewSize.height - window.$('.paper-canvas-container').height();
      window.paper.view.viewSize.width = window.$('.paper-canvas-container').width();
      window.paper.view.viewSize.height = window.$('.paper-canvas-container').height();
      window.paper.view.center = window.paper.view.center.add(new window.paper.Point(widthDiff/2/window.paper.view.zoom, heightDiff/2/window.paper.view.zoom))
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
