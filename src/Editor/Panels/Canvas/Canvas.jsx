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
    this.wickCanvas = null;
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    this.wickCanvas = new window.WickCanvas();
    window.WickCanvas.setup(this.refs.container);

    let wickProject = new window.Wick.Project();
    wickProject.root.timeline.layers[0].frames[0].svg = '<g xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" fill-rule=\"nonzero\" stroke=\"none\" stroke-width=\"1\" stroke-linecap=\"butt\" stroke-linejoin=\"miter\" stroke-miterlimit=\"10\" stroke-dasharray=\"\" stroke-dashoffset=\"0\" font-family=\"none\" font-weight=\"none\" font-size=\"none\" text-anchor=\"none\" style=\"mix-blend-mode: normal\"><path d=\"M20,0c0,-16.56854 13.43146,-30 30,-30c16.56854,0 30,13.43146 30,30c0,16.56854 -13.43146,30 -30,30c-16.56854,0 -30,-13.43146 -30,-30z\" fill=\"#ff0000\"/><path d=\"M20,50c0,-16.56854 13.43146,-30 30,-30c16.56854,0 30,13.43146 30,30c0,16.56854 -13.43146,30 -30,30c-16.56854,0 -30,-13.43146 -30,-30z\" fill=\"#0000ff\"/><path d=\"M-30,50c0,-16.56854 13.43146,-30 30,-30c16.56854,0 30,13.43146 30,30c0,16.56854 -13.43146,30 -30,30c-16.56854,0 -30,-13.43146 -30,-30z\" fill=\"#00ff00\"/></g>';
    this.wickCanvas.render(wickProject);

    window.paper.drawingTools.cursor.onSelectionChanged(e => {

    });
    window.paper.drawingTools.onCanvasModified(e => {

    });
  }

  componentDidUpdate () {
    //wickCanvas.render(wickProject);
    window.paper.drawingTools[this.props.activeTool].activate();
  }

  onResize (width, height) {
    window.WickCanvas.resize();
  }

  render() {
    return (
      <ReactResizeDetector handleWidth handleHeight onResize={this.onResize}>
        <div id="wick-canvas-container" ref="container"></div>
      </ReactResizeDetector>
    );
  }
}

export default Canvas
