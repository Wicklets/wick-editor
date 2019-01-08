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

import ProjectSettings from '../ProjectSettings/ProjectSettings';
import AlphaWarning from '../AlphaWarning/AlphaWarning';
import ConvertToSymbol from '../ConvertToSymbol/ConvertToSymbol';

class ModalHandler extends Component {
  render() {
    return (
      <div>
        <ProjectSettings
          project={this.props.project}
          updateEditorState={this.props.updateEditorState}
          openModal={this.props.openModal}
          open={this.props.activeModalName === 'ProjectSettings'}
          toggle={this.props.closeActiveModal}
        />
        <AlphaWarning
          className="alpha-warning"
          openModal={this.props.openModal}
          open={this.props.activeModalName === 'AlphaWarning'}
          toggle={this.props.closeActiveModal}
        />
      <ConvertToSymbol
          project={this.props.project}
          updateEditorState={this.props.updateEditorState}
          selectionProperties={this.props.selectionProperties}
          openModal={this.props.openModal}
          open={this.props.activeModalName === 'ConvertToSymbol'}
          toggle={this.props.closeActiveModal}
        />
      </div>
    );
  }
}

export default ModalHandler
