import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import PlayButton from 'Editor/Util/PlayButton/PlayButton';
import './_canvastransforms.scss';

class CanvasTransforms extends Component {
  renderTransformButton(action, name, tooltip) {
    return (
      <ActionButton
        color="tool"
        isActive={ () => this.props.activeTool === name }
        id={"canvas-transform-button-" + name}
        tooltip={tooltip}
        action={action}
        tooltipPlace={"top"}
        icon={name}
        className="canvas-transform-button"/>
    )
  }

  renderTransformations = () => {
    return (
      <div className='transforms-container'>
        {this.renderTransformButton(() => {this.props.setActiveTool('pan')}, 'pan', 'Pan')}
        {this.renderTransformButton(() => {this.props.setActiveTool('zoom')}, 'zoom', 'Zoom')}
        {this.renderTransformButton(() => {this.props.recenterCanvas()}, 'recenter', 'Recenter')}
      </div>
    );
  }

  render () {
    return (
      <div className="canvas-transforms-widget">
        {!this.props.hideTransformations && this.renderTransformations()}
        <PlayButton
          className="play-button canvas-transform-button"
          playing={this.props.previewPlaying}
          onClick={this.props.togglePreviewPlaying}/>
      </div>
    );
  }
}

export default CanvasTransforms
