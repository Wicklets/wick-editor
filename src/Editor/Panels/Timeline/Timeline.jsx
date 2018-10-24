import React, { Component } from 'react';
import './_timeline.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.sendPropsToCanvas = this.sendPropsToCanvas.bind(this);
  }

  componentDidMount () {
    var self = this;
    window.AnimationTimeline.setup(this.refs.container, function () {
      self.sendPropsToCanvas();
    });

    window.AnimationTimeline.onChange(e => {
      var nextProject = this.props.project.clone();
      if(e.playhead !== undefined) {
        nextProject.focus.timeline.playheadPosition = e.playhead;
      }
      if(e.layerIndex !== undefined) {
        nextProject.focus.timeline.activeLayerIndex = e.layerIndex;
      }
      if(e.layers) {
        e.layers.forEach(layer => {
          if(layer.id) {
            // Update
            let wickLayer = nextProject._childByUUID(layer.id);
            nextProject.focus.timeline.moveLayer(wickLayer, layer.getIndex());
          } else {
            // Create
            let wickLayer = new window.Wick.Layer();
            nextProject.focus.timeline.addLayer(wickLayer);
          }
        });
      }
      if(e.frames) {
        e.frames.forEach(frame => {
          if(frame.id) {
            // Update
            let wickFrame = nextProject._childByUUID(frame.id);
            wickFrame.start = frame.start;
            wickFrame.end = frame.end;
            wickFrame.parent.removeFrame(wickFrame);
            nextProject.focus.timeline.activeLayer.addFrame(wickFrame);
          } else {
            // Create
            let wickFrame = new window.Wick.Frame();
            wickFrame.start = frame.start;
            wickFrame.end = frame.end;
            nextProject.focus.timeline.activeLayer.addFrame(wickFrame);
          }
        });
      }
      if(e.tweens) {
        e.tweens.forEach(tween => {
          if(tween.id) {
            // Update
            var wickTween = nextProject._childByUUID(tween.id);
            wickTween.playheadPosition = tween.playheadPosition;
          } else {
            // Create
          }
        });
      }
      this.props.updateProject(nextProject);
    });

    window.AnimationTimeline.onSoftChange(e => {
      console.log('onSoftChange');
      console.log(e);
    });

    window.AnimationTimeline.onSelectionChange(e => {
      console.log('onSelectionChange');
      console.log(e);

      let frameIDs = e.frames.map(frame => {
        return frame.id;
      });
      let tweenIDs = e.tweens.map(tween => {
        return tween.id;
      });

      this.props.updateSelection(frameIDs.concat(tweenIDs));
    })
  }

  componentDidUpdate () {
    this.sendPropsToCanvas();
  }

  sendPropsToCanvas () {
    var focus = this.props.project.focus;
    var selection = this.props.selection;
    window.AnimationTimeline.setData({
      layers: focus.timeline.layers.map(layer => {
        return {
          id: layer.uuid,
          label: layer.title,
          locked: layer.locked,
          hidden: layer.hidden,
          frames: layer.frames.map(frame => {
            return {
              id: frame.uuid,
              label: frame.identifier,
              start: frame.start,
              end: frame.end,
              selected: selection.indexOf(frame.uuid) !== -1,
              tweens: frame.tweens.map(tween => {
                return {
                  uuid: tween.uuid,
                  selected: selection.indexOf(tween.uuid) !== -1,
                  playheadPosition: tween.playheadPosition,
                }
              })
            }
          }),
        }
      }),
      playheadPosition: focus.timeline.playheadPosition,
      activeLayerIndex: focus.timeline.activeLayerIndex,
      onionSkinEnabled: focus.timeline.onionSkinEnabled,
      onionSkinSeekForwards: focus.timeline.seekFramesForwards,
      onionSkinSeekBackwards: focus.timeline.seekFramesBackwards,
    });
    window.AnimationTimeline.repaint();
  }

  render() {
    return(
        <div id="animationtimeline" ref="container"></div>
    )
  }
}

export default Timeline
