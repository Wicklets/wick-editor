import React, { Component } from 'react';
import './Canvas.css';

class Canvas extends Component {
  componentDidMount() {
    console.log(window.paper);
    window.paper.setup(this.refs.canvas);
    var p = new window.paper.Path.Circle(new window.paper.Point(30,30), 50);
    p.fillColor = 'blue';
    p.strokeColor = 'red';
    p.strokeWidth = 5;
  }

  render() {
    return (
      <canvas ref="canvas" width={300} height={300}/>
    );
  }
}

export default Canvas
