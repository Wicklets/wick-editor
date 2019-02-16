import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import PlayButton from 'Editor/Util/PlayButton/PlayButton';
import './_canvastransforms.scss';

var classNames = require('classnames');

class CanvasTransforms extends Component {
  renderTransformButton(action, name, tooltip, className) {
    return (
      <ActionButton
        color="tool"
        isActive={ () => this.props.activeTool === name }
        id={"canvas-transform-button-" + name}
        tooltip={tooltip}
        action={action}
        tooltipPlace={"top"}
        icon={name}
        className={classNames("canvas-transform-button", className)}/>
    )
  }

  renderTransformations = () => {
    return (
      <div className='transforms-container'>
        {this.renderTransformButton(() => {this.props.setActiveTool('pan')}, 'pan', 'Pan')}
        {this.renderTransformButton(() => {this.props.zoomIn()}, 'zoomin', 'Zoom In', 'thin-transform-button')}
        {this.renderTransformButton(() => {this.props.setActiveTool('zoom')}, 'zoom', 'Zoom')}
        {this.renderTransformButton(() => {this.props.zoomOut()}, 'zoomout', 'Zoom Out', 'thin-transform-button')}
        {this.renderTransformButton(() => {this.props.recenterCanvas()}, 'recenter', 'Recenter')}
        {this.renderTransformButton(() => {this.props.toggleOnionSkin()}, 'onionskinning', 'Onion Skinning')}
      </div>
    );
  }

  render () {
    return (
      <div className="canvas-transforms-widget">
        {!this.props.hideTransformations && this.renderTransformations()}
        <div className="play-button-container">
          <PlayButton
            className="play-button canvas-transform-button"
            playing={this.props.previewPlaying}
            onClick={this.props.togglePreviewPlaying}/>
        </div>
      </div>
    );
  }
}

export default CanvasTransforms
