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

import MakeInteractive from '../MakeInteractive/MakeInteractive';
import AutosaveWarning from '../AutosaveWarning/AutosaveWarning';
import WelcomeMessage from '../WelcomeMessage/WelcomeMessage';
import MakeAnimated from '../MakeAnimated/MakeAnimated';
import ExportOptions from '../Export/ExportOptions/ExportOptions';
import GeneralWarning from '../GeneralWarning/GeneralWarning';
import ExportMedia from '../ExportMedia/ExportMedia';
import SettingsModal from '../SettingsModal/SettingsModal';
import BuiltinLibrary from '../BuiltinLibrary/BuiltinLibrary';
import EditorInfo from '../EditorInfo/EditorInfo';
import OpenSourceNotices from '../OpenSourceNotices/OpenSourceNotices';
import MobileMenu from '../MobileMenu/MobileMenu';
import SavedProjects from '../SavedProjects/SavedProjects';
import SimpleProjectSettings from '../SimpleProjectSettings/SimpleProjectSettings';
import SupportUs from '../SupportUs/SupportUs';
import ChooseExport from '../ChooseExport/ChooseExport';
import ExportAnimation from '../Export/ExportAnimation';
import ExportInteractive from '../Export/ExportInteractive';

export default function ModalHandler (props) {
  let isMobile = props.getRenderSize() === "small";

  const standardModalOptions = {
    isMobile,
    openModal: props.openModal,
    toggle: props.closeActiveModal,
  }

  return (
      <div>
        <MakeAnimated
          {...standardModalOptions}
            open={props.activeModalName === 'MakeAnimated'}
            createClipFromSelection={props.createClipFromSelection}
          />
        <MakeInteractive
           {...standardModalOptions}
            open={props.activeModalName === 'MakeInteractive'}
            createClipFromSelection={props.createClipFromSelection}
            createButtonFromSelection={props.createButtonFromSelection}
          />
        <AutosaveWarning
          {...standardModalOptions}
            open={props.activeModalName === 'AutosaveWarning'}
            loadAutosavedProject={props.loadAutosavedProject}
            clearAutoSavedProject={props.clearAutoSavedProject}
        />
        <WelcomeMessage
          {...standardModalOptions}
          open={props.activeModalName === 'WelcomeMessage'}
          editorVersion={props.editorVersion}
        />
        <ExportOptions
          {...standardModalOptions}
          closeActiveModal={props.closeActiveModal}
          queueModal={props.queueModal}
          exportProjectAsGif={props.exportProjectAsGif}
          exportProjectAsStandaloneZip={props.exportProjectAsStandaloneZip}
          exportProjectAsStandaloneHTML={props.exportProjectAsStandaloneHTML}
          exportProjectAsVideo={props.exportProjectAsVideo}
          exportProjectAsImageSequence={props.exportProjectAsImageSequence}
          exportProjectAsAudioTrack={props.exportProjectAsAudioTrack}
          exportProjectAsImageSVG={props.exportProjectAsImageSVG}
          open={props.activeModalName === 'ExportOptions'}
          projectName={props.project.name}
          project={props.project}
          />
        <GeneralWarning
          {...standardModalOptions}
          open={props.activeModalName === 'GeneralWarning'}
          info={props.warningModalInfo}
        />
        <ExportMedia
          {...standardModalOptions}
          exportProjectAsVideo={props.exportProjectAsVideo}
          open={props.activeModalName === 'ExportMedia'}
          renderProgress={props.renderProgress}
          renderType={props.renderType}
          renderStatusMessage={props.renderStatusMessage}
          project={props.project}
        />
        <SettingsModal
          {...standardModalOptions}
          open={props.activeModalName === 'SettingsModal'}
          project={props.project}
          updateProjectSettings={props.updateProjectSettings}
          addCustomHotKeys={props.addCustomHotKeys}
          resetCustomHotKeys={props.resetCustomHotKeys}
          keyMap={props.keyMap}
          keyMapGroups={props.keyMapGroups}
          customHotKeys={props.customHotKeys}
          colorPickerType={props.colorPickerType}
          changeColorPickerType={props.changeColorPickerType}
          updateLastColors={props.updateLastColors}
          lastColorsUsed={props.lastColorsUsed}
          toast={props.toast}
          createCombinedHotKeyMap={props.createCombinedHotKeyMap}
          getToolSetting={props.getToolSetting}
          setToolSetting={props.setToolSetting}
          getToolSettingRestrictions={props.getToolSettingRestrictions}
        />
        <BuiltinLibrary
          {...standardModalOptions}
          open={props.activeModalName === 'BuiltinLibrary'}
          project={props.project}
          importFileAsAsset={props.importFileAsAsset}
          builtinPreviews={props.builtinPreviews}
          addFileToBuiltinPreviews={props.addFileToBuiltinPreviews}
          isAssetInLibrary={props.isAssetInLibrary}
        />
        <EditorInfo
          {...standardModalOptions}
          open={props.activeModalName === 'EditorInfo'}
          editorVersion={props.editorVersion}
        />
        <OpenSourceNotices
          {...standardModalOptions}
          open={props.activeModalName === 'OpenSourceNotices'}
          />
        <MobileMenu
          openProjectFileDialog={props.openProjectFileDialog}
          openNewProjectConfirmation={props.openNewProjectConfirmation}
          {...standardModalOptions}
          open={props.activeModalName === 'MobileMenuModal'}
        />
        <SavedProjects
          {...standardModalOptions}
          open={props.activeModalName === 'SavedProjects'}
          localSavedFiles={props.localSavedFiles}
          loadLocalWickFile={props.loadLocalWickFile}
          deleteLocalWickFile={props.deleteLocalWickFile}
          reloadSavedWickFiles={props.reloadSavedWickFiles}
          openWarningModal={props.openWarningModal}
          />
        <SimpleProjectSettings 
          updateProjectSettings={props.updateProjectSettings}
          project={props.project}
          {...standardModalOptions}
          open={props.activeModalName === 'SimpleProjectSettings'}/>

        <SupportUs
          {...standardModalOptions}
          open={props.activeModalName === 'SupportUs'}
          />

        <ChooseExport
          {...standardModalOptions}
          open={props.activeModalName === 'ChooseExport'}
          />  

        <ExportAnimation 
         exportProjectAsGif={props.exportProjectAsGif}
         exportProjectAsVideo={props.exportProjectAsVideo}
         project={props.project}

         {...standardModalOptions}
         open={props.activeModalName === 'ExportAnimation'}
         />

        <ExportInteractive
          exportProjectAsStandaloneHTML={props.exportProjectAsStandaloneHTML}
          exportProjectAsStandaloneZip={props.exportProjectAsStandaloneZip}
          project={props.project}
          
          open={props.activeModalName === 'ExportInteractive'} 
          {...standardModalOptions}
          />
      </div>
  )
}