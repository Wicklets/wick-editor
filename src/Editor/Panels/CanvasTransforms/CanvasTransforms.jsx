import React, { Component } from 'react';

import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import PlayButton from 'Editor/Util/PlayButton/PlayButton';
import './_canvastransforms.scss';

var classNames = require('classnames');

class CanvasTransforms extends Component {
  renderTransformButton(options) {
    return (
      <ActionButton
        color="tool"
        isActive={ options.isActive ? options.isActive : () => this.props.activeToolName === options.name }
        id={"canvas-transform-button-" + options.name}
        tooltip={options.tooltip}
        action={options.action}
        tooltipPlace={"top"}
        icon={options.name}
        className={classNames("canvas-transform-button", options.className)}
        buttonClassName={"canvas-transform-wick-button"}
        iconClassName="canvas-transform-icon"
        />
    );
  }

  renderTransformations = () => {
    return (
      <div className='transforms-container'>
        {this.renderTransformButton({
          action:this.props.toggleOnionSkin,
          name:'onionskinning',
          tooltip:'Onion Skinning',
          className:'canvas-transform-item onion-skin-button',
          isActive:(() => {return this.props.onionSkinEnabled}),
        })}
        {this.renderTransformButton({
          action: (() => this.props.setActiveTool('pan')),
          name: 'pan',
          tooltip: 'Pan',
          className:'canvas-transform-item'
        })}
        {this.renderZoomIn()}
        {this.renderZoomTool()}
        {this.renderZoomOut()}
        {this.renderTransformButton({
          action: (this.props.recenterCanvas),
          name: 'recenter',
          tooltip: 'Recenter',
          className:'canvas-transform-item'
        })}
      </div>
    );
  }

  renderZoomTool = () => {
    return (
      <div id='zoom-tool-container'>
        {/* Zoom Tool / NumericInput*/}
        {this.renderTransformButton({
          action: (() => this.props.setActiveTool('zoom')),
          name: 'zoom',
          tooltip: 'Zoom',
          className: 'zoom-tool'
        })}
      </div>
    )
  }

  renderZoomIn = () => {
    return this.renderTransformButton({
          action: () => this.props.zoomIn(),
          name: 'zoomin',
          tooltip: 'Zoom In',
          className: 'thin-transform-button zoom-in-button'});
  }

  renderZoomOut = () => {
    return this.renderTransformButton({
        action: () => this.props.zoomOut(),
        name: 'zoomout',
        tooltip: 'Zoom Out',
        className: 'thin-transform-button zoom-out-button',
      });
  }

  render () {
    return (
      <div className="canvas-transforms-widget">
        {!this.props.previewPlaying && this.renderTransformations()}
        <div className="play-button-container">
          <PlayButton
            className="play-button canvas-transform-button"
            playing={this.props.previewPlaying}
            action={this.props.togglePreviewPlaying}/>
        </div>
      </div>
    );
  }
}

export default CanvasTransforms
