import React, { Component } from 'react';
import './_timeline.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

class Timeline extends Component {
  constructor(props) {
    super(props);
    this.sendStateToTimelineView = this.sendStateToTimelineView.bind(this);
  }

  componentDidMount () {
    var self = this;
    window.AnimationTimeline.setup(this.refs.container, function () {
      self.sendStateToTimelineView();
    });

    window.AnimationTimeline.onChange(e => {
      var nextProject = this.props.project.clone();
      if(e.playhead) {
        nextProject.focus.timeline.playheadPosition = e.playhead;
      }
      this.props.updateProject(nextProject);
    });

    window.AnimationTimeline.onSoftChange(e => {

    });
  }

  componentDidUpdate () {
    this.sendStateToTimelineView();
  }

  sendStateToTimelineView () {
    var focus = this.props.project.focus;
    window.AnimationTimeline.setData({
      layers: focus.timeline.layers.map(layer => {
        return {
          label: layer.title,
          locked: layer.locked,
          hidden: layer.hidden,
          frames: layer.frames.map(frame => {
            return {
              label: frame.identifier,
              start: frame.start,
              end: frame.end,
              tweens: frame.tweens.map(tween => {
                return {
                  playheadPosition: tween.playheadPosition,
                }
              })
            }
          }),
        }
      }),
      playheadPosition: focus.timeline.playheadPosition,
      activeLayerIndex: focus.timeline.layersPosition,
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
