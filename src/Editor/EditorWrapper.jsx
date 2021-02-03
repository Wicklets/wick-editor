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

import React, { useEffect } from 'react';
import ErrorBoundary from './Util/ErrorBoundary';
import { Slide } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { GlobalHotKeys } from 'react-hotkeys';
import ErrorPage from './Util/ErrorPage';
import ModalHandler from './Modals/ModalHandler/ModalHandler';
import { Hook, Unhook } from 'console-feed';

/**
 * EditorWrapper
 * This component is designed to wrap the editor and provide all necessary global interactions.
 */

export default function EditorWrapper(props) {

    // Run once, connect the console to the console object.
    useEffect(() => {
        Hook(window.console, log => {props.editor.setConsoleLogs([...props.editor.state.consoleLogs, log])}, false)
        return () => Unhook(window.console)
    }, [props.editor])


    return (
        <ErrorBoundary
            fallback={ErrorPage}
            processError={(error, errorInfo) => { props.editor.autoSaveProject(() => { "Project Autosaved" }) }}
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
                keyMap={props.editor.getKeyMap()}
                handlers={props.editor.getKeyHandlers()} />
            <div id="editor">
                <ModalHandler
                    getRenderSize={props.editor.getRenderSize}
                    activeModalName={props.editor.state.activeModalName}
                    openModal={props.editor.openModal}
                    closeActiveModal={props.editor.closeActiveModal}
                    queueModal={props.editor.queueModal}
                    project={props.editor.project}
                    createClipFromSelection={props.editor.createClipFromSelection}
                    createButtonFromSelection={props.editor.createButtonFromSelection}
                    updateProjectSettings={props.editor.updateProjectSettings}
                    exportProjectAsGif={props.editor.exportProjectAsAnimatedGIF}
                    exportProjectAsVideo={props.editor.exportProjectAsVideo}
                    exportProjectAsStandaloneZip={props.editor.exportProjectAsStandaloneZip}
                    exportProjectAsStandaloneHTML={props.editor.exportProjectAsStandaloneHTML}
                    exportProjectAsImageSequence={props.editor.exportProjectAsImageSequence}
                    exportProjectAsAudioTrack={props.editor.exportProjectAsAudioTrack}
                    warningModalInfo={props.editor.state.warningModalInfo}
                    loadAutosavedProject={props.editor.loadAutosavedProject}
                    clearAutoSavedProject={props.editor.clearAutoSavedProject}
                    renderProgress={props.editor.state.renderProgress}
                    renderStatusMessage={props.editor.state.renderStatusMessage}
                    renderType={props.editor.state.renderType}
                    addCustomHotKeys={props.editor.addCustomHotKeys}
                    resetCustomHotKeys={props.editor.resetCustomHotKeys}
                    customHotKeys={props.editor.state.customHotKeys}
                    keyMap={props.editor.getKeyMap(true)}
                    keyMapGroups={props.editor.hotKeyInterface.createHandlerGroups()}
                    importFileAsAsset={props.editor.importFileAsAsset}
                    colorPickerType={props.editor.state.colorPickerType}
                    changeColorPickerType={props.editor.changeColorPickerType}
                    updateLastColors={props.editor.updateLastColors}
                    lastColorsUsed={props.editor.state.lastColorsUsed}
                    editorVersion={props.editor.editorVersion}
                    toast={props.editor.toast}
                    createCombinedHotKeyMap={props.editor.createCombinedHotKeyMap}
                    getToolSetting={props.editor.getToolSetting}
                    setToolSetting={props.editor.setToolSetting}
                    getToolSettingRestrictions={props.editor.getToolSettingRestrictions}
                    exportProjectAsImageSVG={props.editor.exportProjectAsImageSVG}
                    builtinPreviews={props.editor.builtinPreviews}
                    addFileToBuiltinPreviews={props.editor.addFileToBuiltinPreviews}
                    isAssetInLibrary={props.editor.isAssetInLibrary}
                    openProjectFileDialog={props.editor.openProjectFileDialog}
                    openNewProjectConfirmation={props.editor.openNewProjectConfirmation}
                    localSavedFiles={props.editor.state.localSavedFiles}
                    loadLocalWickFile={props.editor.loadLocalWickFile}
                    deleteLocalWickFile={props.editor.deleteLocalWickFile}
                    reloadSavedWickFiles={props.editor.reloadSavedWickFiles}
                    openWarningModal={props.editor.openWarningModal}
                />
                {props.children}
            </div>
        </ErrorBoundary>
    )
}
