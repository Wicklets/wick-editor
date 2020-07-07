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

import React from 'react';
import ErrorBoundary from './Util/ErrorBoundary';
import { Slide } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { GlobalHotKeys } from 'react-hotkeys';
import ErrorPage from './Util/ErrorPage';
import ModalHandler from './Modals/ModalHandler/ModalHandler';

/**
 * EditorWrapper
 * This component is designed to wrap the editor and provide all necessary global interactions.
 */
 class EditorWrapper extends React.Component {

    render () {
        return (
            <ErrorBoundary
                fallback={ErrorPage}
                processError={(error, errorInfo) => {this.props.editor.autoSaveProject(() => {"Project Autosaved"})} }
                >
                <ToastContainer
                    transition={Slide}
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnVisibilityChange
                    draggable
                    pauseOnHover />
                <GlobalHotKeys
                    allowChanges={true}
                    keyMap={this.props.editor.getKeyMap()}
                    handlers={this.props.editor.getKeyHandlers()}/>
                <div id="editor">
                    <input type='file' accept={window.Wick.FileAsset.getValidExtensions().join(', ')} style={{display: 'none'}} ref={this.props.editor.importAssetRef} onChange={this.props.editor.handleAssetFileImport} multiple="multiple" />
                    <input type='file' accept='.zip, .wick' style={{display: 'none'}} ref={this.props.editor.openFileRef} onChange={this.props.editor.handleWickFileLoad} />
                    <ModalHandler
                        getRenderSize={this.props.editor.getRenderSize}
                        activeModalName={this.props.editor.state.activeModalName}
                        openModal={this.props.editor.openModal}
                        closeActiveModal={this.props.editor.closeActiveModal}
                        queueModal={this.props.editor.queueModal}
                        project={this.props.editor.project}
                        createClipFromSelection={this.props.editor.createClipFromSelection}
                        createButtonFromSelection={this.props.editor.createButtonFromSelection}
                        updateProjectSettings={this.props.editor.updateProjectSettings}
                        exportProjectAsGif={this.props.editor.exportProjectAsAnimatedGIF}
                        exportProjectAsVideo={this.props.editor.exportProjectAsVideo}
                        exportProjectAsStandaloneZip={this.props.editor.exportProjectAsStandaloneZip}
                        exportProjectAsStandaloneHTML={this.props.editor.exportProjectAsStandaloneHTML}
                        exportProjectAsImageSequence={this.props.editor.exportProjectAsImageSequence}
                        exportProjectAsAudioTrack={this.props.editor.exportProjectAsAudioTrack}
                        warningModalInfo={this.props.editor.state.warningModalInfo}
                        loadAutosavedProject={this.props.editor.loadAutosavedProject}
                        clearAutoSavedProject={this.props.editor.clearAutoSavedProject}
                        renderProgress={this.props.editor.state.renderProgress}
                        renderStatusMessage={this.props.editor.state.renderStatusMessage}
                        renderType={this.props.editor.state.renderType}
                        addCustomHotKeys={this.props.editor.addCustomHotKeys}
                        resetCustomHotKeys={this.props.editor.resetCustomHotKeys}
                        customHotKeys={this.props.editor.state.customHotKeys}
                        keyMap={this.props.editor.getKeyMap(true)}
                        keyMapGroups={this.props.editor.hotKeyInterface.createHandlerGroups()}
                        importFileAsAsset={this.props.editor.importFileAsAsset}
                        colorPickerType={this.props.editor.state.colorPickerType}
                        changeColorPickerType={this.props.editor.changeColorPickerType}
                        updateLastColors={this.props.editor.updateLastColors}
                        lastColorsUsed={this.props.editor.state.lastColorsUsed}
                        editorVersion={this.props.editor.editorVersion}
                        toast={this.props.editor.toast}
                        createCombinedHotKeyMap={this.props.editor.createCombinedHotKeyMap}
                        getToolSetting={this.props.editor.getToolSetting}
                        setToolSetting={this.props.editor.setToolSetting}
                        getToolSettingRestrictions={this.props.editor.getToolSettingRestrictions}
                        exportProjectAsImageSVG={this.props.editor.exportProjectAsImageSVG}
                        openProjectFileDialog={this.props.editor.openProjectFileDialog}
                        openNewProjectConfirmation={this.props.editor.openNewProjectConfirmation}
                        />
                {this.props.children}
                </div>
            </ErrorBoundary>
        )
    }
 }

 export default EditorWrapper
