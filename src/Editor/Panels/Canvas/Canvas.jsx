import React, { Component } from 'react';
import './_canvas.scss';

class Canvas extends Component {
  componentDidMount() {
    console.log(window.paper);
    window.paper.setup(this.refs.canvas);
    var p = new window.paper.Path.Circle(new window.paper.Point(30,30), 50);
    p.fillColor = 'blue';
    p.strokeColor = 'red';
    p.strokeWidth = 5;
    window.onresize = function () {
      var widthDiff = paper.view.viewSize.width - $('.paper-canvas-container').width();
      var heightDiff = paper.view.viewSize.height - $('.paper-canvas-container').height();
      paper.view.viewSize.width = $('.paper-canvas-container').width();
      paper.view.viewSize.height = $('.paper-canvas-container').height();
      paper.view.center = paper.view.center.add(new window.paper.Point(widthDiff/2/window.paper.view.zoom, heightDiff/2/window.paper.view.zoom))
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
