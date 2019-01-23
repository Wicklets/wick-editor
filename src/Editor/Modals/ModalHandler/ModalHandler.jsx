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
    this.modalProps = {
      openModal: this.props.openModal,
      toggle: this.props.closeActiveModal
    };

    return (
      <div>
        <ProjectSettings
          {...this.modalProps}
          project={this.props.project}
          open={this.props.activeModalName === 'ProjectSettings'}
          updateProjectSettings={this.props.updateProjectSettings}
        />
        <AlphaWarning
          {...this.modalProps}
          className="alpha-warning"
          open={this.props.activeModalName === 'AlphaWarning'}
        />
      <ConvertToSymbol
          {...this.modalProps}
          open={this.props.activeModalName === 'ConvertToSymbol'}
          createClipFromSelection={this.props.createClipFromSelection}
        />
      </div>
    );
  }
}

export default ModalHandler
