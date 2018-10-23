import React, { Component } from 'react';
import './_canvas.scss';

class Canvas extends Component {
  constructor (props) {
    super(props);
    this.sendPropsToCanvas = this.sendPropsToCanvas.bind(this);
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

    window.paper.drawingTools.cursor.onSelectionChanged(function (e) {
      console.log('onSelectionChanged fired');
    });

    window.paper.drawingTools.onCanvasModified(function (e) {
      console.log('onCanvasModified fired.');
    });
  }

  componentDidUpdate () {
    this.sendPropsToCanvas();
  }

  sendPropsToCanvas () {
    //
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
