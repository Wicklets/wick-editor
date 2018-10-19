import React, { Component } from 'react';
import './Canvas.css';

class Canvas extends Component {
  componentDidMount() {
    console.log(window.paper);
    window.paper.setup(this.refs.canvas);
  }

  render() {
    return (
      <canvas ref="canvas" width={300} height={300}/>
    );
  }
}

export default Canvas
