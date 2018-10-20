import React, { Component } from 'react';
import './_canvas.scss';

class Canvas extends Component {
  componentDidMount() {
    console.log(window.paper);
    /*window.paper.setup(this.refs.canvas);
    var p = new window.paper.Path.Circle(new window.paper.Point(30,30), 50);
    p.fillColor = 'blue';
    p.strokeColor = 'red';
    p.strokeWidth = 5;*/
  }

  render() {
    return (
      <div className="dummy">

      </div>
    );
  }
}

export default Canvas
