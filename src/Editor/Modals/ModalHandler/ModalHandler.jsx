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

import MakeInteractive from '../MakeInteractive/MakeInteractive';
import AutosaveWarning from '../AutosaveWarning/AutosaveWarning';
import WelcomeMessage from '../WelcomeMessage/WelcomeMessage';
import MakeAnimated from '../MakeAnimated/MakeAnimated';
import ExportOptions from '../ExportOptions/ExportOptions';
import GeneralWarning from '../GeneralWarning/GeneralWarning';
import ExportMedia from '../ExportMedia/ExportMedia';
import SettingsModal from '../SettingsModal/SettingsModal';
import BuiltinLibrary from '../BuiltinLibrary/BuiltinLibrary';
import EditorInfo from '../EditorInfo/EditorInfo';
import OpenSourceNotices from '../OpenSourceNotices/OpenSourceNotices';

class ModalHandler extends Component {
  render() {
    return (
      <div>
        <MakeAnimated
            openModal={this.props.openModal}
            toggle={this.props.closeActiveModal}
            open={this.props.activeModalName === 'MakeAnimated'}
            createClipFromSelection={this.props.createClipFromSelection}
          />
        <MakeInteractive
            openModal={this.props.openModal}
            toggle={this.props.closeActiveModal}
            open={this.props.activeModalName === 'MakeInteractive'}
            createClipFromSelection={this.props.createClipFromSelection}
            createButtonFromSelection={this.props.createButtonFromSelection}
          />
        <AutosaveWarning
            openModal={this.props.openModal}
            toggle={this.props.closeActiveModal}
            open={this.props.activeModalName === 'AutosaveWarning'}
            loadAutosavedProject={this.props.loadAutosavedProject}
            clearAutoSavedProject={this.props.clearAutoSavedProject}
        />
        <WelcomeMessage
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          open={this.props.activeModalName === 'WelcomeMessage'}
          editorVersion={this.props.editorVersion}
        />
        <ExportOptions
          openModal={this.props.openModal}
          closeActiveModal={this.props.closeActiveModal}
          queueModal={this.props.queueModal}
          toggle={this.props.closeActiveModal}
          exportProjectAsGif={this.props.exportProjectAsGif}
          exportProjectAsStandaloneZip={this.props.exportProjectAsStandaloneZip}
          exportProjectAsStandaloneHTML={this.props.exportProjectAsStandaloneHTML}
          exportProjectAsVideo={this.props.exportProjectAsVideo}
          exportProjectAsImageSequence={this.props.exportProjectAsImageSequence}
          open={this.props.activeModalName === 'ExportOptions'}
          projectName={this.props.project.name}
          />
        <GeneralWarning
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          open={this.props.activeModalName === 'GeneralWarning'}
          info={this.props.warningModalInfo}
        />
        <ExportMedia
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          exportProjectAsVideo={this.props.exportProjectAsVideo}
          open={this.props.activeModalName === 'ExportMedia'}
          renderProgress={this.props.renderProgress}
          renderType={this.props.renderType}
          renderStatusMessage={this.props.renderStatusMessage}
          project={this.props.project}
        />
        <SettingsModal
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          open={this.props.activeModalName === 'SettingsModal'}
          project={this.props.project}
          updateProjectSettings={this.props.updateProjectSettings}
          addCustomHotKeys={this.props.addCustomHotKeys}
          resetCustomHotKeys={this.props.resetCustomHotKeys}
          keyMap={this.props.keyMap}
          keyMapGroups={this.props.keyMapGroups}
          customHotKeys={this.props.customHotKeys}
          colorPickerType={this.props.colorPickerType}
          changeColorPickerType={this.props.changeColorPickerType}
          updateLastColors={this.props.updateLastColors}
          lastColorsUsed={this.props.lastColorsUsed}
          customOnionSkinningColors={this.props.customOnionSkinningColors}
          useCustomOnionSkinningColors={this.props.useCustomOnionSkinningColors}
          changeOnionSkinningColors={this.props.changeOnionSkinningColors}
        />
        <BuiltinLibrary
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          open={this.props.activeModalName === 'BuiltinLibrary'}
          project={this.props.project}
          importFileAsAsset={this.props.importFileAsAsset}
        />
        <EditorInfo
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          open={this.props.activeModalName === 'EditorInfo'} 
          editorVersion={this.props.editorVersion}
        />
        <OpenSourceNotices
          openModal={this.props.openModal}
          toggle={this.props.closeActiveModal}
          open={this.props.activeModalName === 'OpenSourceNotices'}
          />
      </div>
    );
  }
}

export default ModalHandler
