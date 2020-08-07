/*
 * Copyright 2020 WICKLETS LLC
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
import './_playbutton.scss'

import iconPlay from 'resources/action-icons/play.png';
import iconPause from 'resources/action-icons/pause.png';

class PlayButton extends Component {
  render() {
    return (
      <input
        data-tip
        id={this.props.id}
        data-for={this.props.id}
        type="image"
        className={"play-icon " + this.props.className}
        alt={"playing button"}
        src={(this.props.playing ? iconPause : iconPlay)}
        onClick={this.props.action}
        />
    )
  }
}

export default PlayButton
