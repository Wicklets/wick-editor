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
import CreateSymbol from '../CreateSymbol/CreateSymbol';
import AutosaveWarning from '../AutosaveWarning/AutosaveWarning';
import WelcomeMessage from '../WelcomeMessage/WelcomeMessage'; 
import MakeAnimated from '../MakeAnimated/MakeAnimated'; 

class ModalHandler extends Component {
  render() {
    return (
      <div>
        <ProjectSettings
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          project={this.props.project}
          open={this.props.activeModalName === 'ProjectSettings'}
          updateProjectSettings={this.props.updateProjectSettings}
        />
      <MakeAnimated
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          open={this.props.activeModalName === 'MakeAnimated'}
          createClipFromSelection={this.props.createClipFromSelection}
        />
      <CreateSymbol
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          open={this.props.activeModalName === 'MakeInteractive'}
          createSymbolFromSelection={this.props.createSymbolFromSelection}
        />
      <AutosaveWarning
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          open={this.props.activeModalName === 'AutosaveWarning'}
          loadAutosavedProject={this.props.loadAutosavedProject}
        />
        <WelcomeMessage
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          open={this.props.activeModalName === 'WelcomeMessage'}
        />
      </div>
    );
  }
}

export default ModalHandler
