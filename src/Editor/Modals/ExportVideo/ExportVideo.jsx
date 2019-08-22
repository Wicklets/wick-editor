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
import WickModal from 'Editor/Modals/WickModal/WickModal';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import { Progress } from 'reactstrap';

import './_exportvideo.scss';

class ExportVideo extends Component {
  constructor (props) {
    super(props);
    this.state = {
      renderStatusMessage: '',
      renderProgress: 0,
    };
  }

  componentDidUpdate = (prevProps) => {

  }

  exportVideo = () => {
    this.props.exportProjectAsVideo(
      (message, progress) => {
        console.log(message, progress);
        this.setState({
          renderStatusMessage: message,
          renderProgress: progress
        });
      },
      () => {

      }
    );
  }

  render() {
    return (
      <WickModal
        open={this.props.open}
        toggle={this.props.toggle}
        className="video-export-modal-body"
        overlayClassName="video-export-modal-overlay"
      >
        <div className="video-export-modal-content">
          <Progress animated value={this.state.renderProgress} />
          <div>{this.state.renderStatusMessage}</div>
        </div>
        <ActionButton
          color='gray-green'
          action={this.exportVideo}
          text="Export"
        />
      </WickModal>
    );
  }
}

export default ExportVideo
