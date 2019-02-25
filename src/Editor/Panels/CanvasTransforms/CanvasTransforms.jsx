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
        isActive={ options.isActive ? options.isActive : () => this.props.activeTool === options.name }
        id={"canvas-transform-button-" + options.name}
        tooltip={options.tooltip}
        action={options.action}
        tooltipPlace={"top"}
        icon={options.name}
        className={classNames("canvas-transform-button", options.className)}/>
    )
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    return this.props.onionSkinEnabled !== nextProps.onionSkinEnabled ||
    this.props.activeTool !== nextProps.activeTool;
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
        {this.renderZoomOptions()}
        {this.renderTransformButton({
          action: (() => this.props.setActiveTool('pan')),
          name: 'pan',
          tooltip: 'Pan',
          className:'canvas-transform-item'
        })}
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
        {/* Zooom Tool / NumericInput*/}
        {this.renderTransformButton({
          action: (() => this.props.setActiveTool('zoom')),
          name: 'zoom',
          tooltip: 'Zoom',
          className: 'zoom-tool'
        })}
      </div>
    )
  }

  renderZoomOptions = () => {
    return (
      <div id="canvas-zoom-options-container" className="canvas-transform-item">
        {/* Zoom In */}
        {this.renderTransformButton({
          action: () => this.props.zoomIn(),
          name: 'zoomin',
          tooltip: 'Zoom In',
          className: 'thin-transform-button',
        })}

        {this.renderZoomTool()}

        {/* Zoom Out */}
        {this.renderTransformButton({
          action: () => this.props.zoomOut(),
          name: 'zoomout',
          tooltip: 'Zoom Out',
          className: 'thin-transform-button',
        })}
      </div>
    )
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
