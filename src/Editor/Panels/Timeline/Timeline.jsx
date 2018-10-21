import React, { Component } from 'react';
import './_timeline.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

class Timeline extends Component {
  componentDidMount () {
    window.AnimationTimeline.setup(this.refs.container, function () {
        window.AnimationTimeline.setData({
            playheadPosition: 1,
            activeLayerIndex: 0,
            onionSkinEnabled: false,
            onionSkinSeekForwards: 1,
            onionSkinSeekBackwards: 1,
            layers: [
                {
                    label: 'Layer 1',
                    locked: false,
                    hidden: false,
                    frames: [
                        {
                            label: 'Frame A',
                            start: 1,
                            end: 1,
                            tweens: [],
                        }
                    ]
                },
                {
                    label: 'Layer 2',
                    locked: false,
                    hidden: false,
                    frames: [
                        {
                            label: 'Frame B',
                            start: 1,
                            end: 3,
                            tweens: [],
                        },
                        {
                            label: 'Frame C',
                            start: 4,
                            end: 6,
                            tweens: [],
                        }
                    ]
                },
                {
                    label: 'Layer 3',
                    locked: false,
                    hidden: false,
                    frames: [
                        {
                            label: 'Frame D',
                            start: 1,
                            end: 10,
                            tweens: [
                                {
                                    playheadPosition: 0,
                                },
                                {
                                    playheadPosition: 4,
                                },
                                {
                                    playheadPosition: 9,
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        window.AnimationTimeline.repaint();
      });
  }

  render() {
    return(
        <div id="animationtimeline" ref="container"></div>
    )
  }
}

export default Timeline
