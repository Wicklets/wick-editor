import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import PlayButton from 'Editor/Util/PlayButton/PlayButton';
import './_canvastransforms.scss';

class CanvasTransforms extends Component {
  renderTransformButton(name, tooltip) {
    return (
      <ActionButton
        color="tool"
        isActive={ () => this.props.activeTool === name }
        id={"canvas-transform-button-" + name}
        tooltip={tooltip}
        action={ () => this.props.setActiveTool(name) }
        tooltipPlace={"top"}
        icon={name}
        className="canvas-transform-button"/>
    )
  }
  render () {
    return (
      <div className="canvas-transforms-widget">
        {this.renderTransformButton('pan', 'Pan')}
        {this.renderTransformButton('zoom', 'Zoom')}
        <PlayButton
          className="play-button canvas-transform-button"
          playing={this.props.previewPlaying}
          onClick={this.props.togglePreviewPlaying}/>
      </div>
    );
  }
}

export default CanvasTransforms
