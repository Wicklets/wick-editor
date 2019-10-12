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

import React from 'react';
import ReactGA from 'react-ga';

import './_editor.scss';

import 'bootstrap/dist/css/bootstrap.min.css';
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from "react-dnd";
import 'react-reflex/styles.css'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import { throttle } from 'underscore';
import { GlobalHotKeys, getApplicationKeyMap} from 'react-hotkeys';
import localForage from 'localforage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Slide } from 'react-toastify';

import HotKeyInterface from './hotKeyMap';
import ActionMapInterface from './actionMap';
import ScriptInfoInterface from './scriptInfo';
import FontInfoInterface from './fontInfo';
import EditorCore from './EditorCore';

import DockedPanel from './Panels/DockedPanel/DockedPanel';
import ModalHandler from './Modals/ModalHandler/ModalHandler';
import Canvas from './Panels/Canvas/Canvas';
import Inspector from './Panels/Inspector/Inspector';
import MenuBar from './Panels/MenuBar/MenuBar';
import Timeline from './Panels/Timeline/Timeline';
import CanvasTransforms from './Panels/CanvasTransforms/CanvasTransforms';
import Toolbox from './Panels/Toolbox/Toolbox';
import AssetLibrary from './Panels/AssetLibrary/AssetLibrary';
import PopOutCodeEditor from './PopOuts/PopOutCodeEditor/PopOutCodeEditor';

class Editor extends EditorCore {
  constructor () {
    super();

    // "Live" editor states
    this.project = null;
    this.paper = null;

    // GUI state
    this.state = {
      project: null,
      previewPlaying: false,
      activeModalName: window.localStorage.skipWelcomeMessage ? null : "WelcomeMessage",
      activeModalQueue: [],
      codeEditorOpen: false,
      scriptToEdit: "default",
      showCanvasActions: false,
      codeErrors: [],
      inspectorSize: 250,
      timelineSize: 175,
      assetLibrarySize: 150,
      warningModalInfo: {
        description: "No Description Given",
        title: "Title",
        acceptText: "Accept",
        cancelText: "Cancel",
        acceptAction: (() => {console.warn("No Accept Action")}),
        cancelAction: (() => {console.warn("No Cancel Action")}),
      },
      renderProgress: 0,
      renderType: "default",
      renderStatusMessage: "",
      customHotKeys: {},
    };

    // Set up error.
    this.error = null;

    // Create interfaces.
    this.fontInfoInterface = new FontInfoInterface(this);

    // Init hotkeys
    this.hotKeyInterface = new HotKeyInterface(this);

    // Init actions
    this.actionMapInterface = new ActionMapInterface(this);

    // Init Script Info
    this.scriptInfoInterface = new ScriptInfoInterface();

    // Wick file input
    this.openFileRef = React.createRef();
    this.importAssetRef = React.createRef();

    // Resizable panels
    this.RESIZE_THROTTLE_AMOUNT_MS = 100;
    this.WINDOW_RESIZE_THROTTLE_AMOUNT_MS = 300;
    this.resizeProps = {
      onStopResize: throttle(this.onStopResize, this.resizeThrottleAmount),
      onStopInspectorResize: throttle(this.onStopInspectorResize, this.resizeThrottleAmount),
      onStopAssetLibraryResize: throttle(this.onStopAssetLibraryResize, this.resizeThrottleAmount),
      onStopTimelineResize: throttle(this.onStopTimelineResize, this.resizeThrottleAmount),
      onStopCodeEditorResize: throttle(this.onStopCodeEditorResize, this.resizeThrottleAmount),
      onResize: throttle(this.onResize, this.resizeThrottleAmount),
      onWindowResize: throttle(this.onWindowResize, this.windowResizeThrottleAmount),
    };
    window.addEventListener("resize", this.resizeProps.onWindowResize);

    this.canvasComponent = null;
    this.timelineComponent = null;
  }

  componentWillMount = () => {
    ReactGA.initialize('UA-88233944-1');
    ReactGA.pageview(window.location.pathname + window.location.search);
    // Initialize "live" engine state
    this.project = new window.Wick.Project();
    this.paper = window.paper;

    // Initialize local storage
    localForage.config({
      name        : 'WickEditor',
      description : 'Live Data storage of the Wick Editor app.'
    });

    this.autoSaveKey = "wickProjectAutosave1-0-11";
    this.customHotKeysKey = "wickEditorcustomHotKeys";

    // Set up custom hotkeys if they exist.
    localForage.getItem(this.customHotKeysKey).then(
      (customHotKeys) => {
        this.hotKeyInterface.setCustomHotKeys(customHotKeys);
      }
    );

    // Setup the initial project state
    this.setState({
      ...this.state,
      project: this.project.serialize(),
      codeEditorWindowProperties: this.getDefaultCodeEditorProperties(),
    });

    // Leave Page warning.
    window.onbeforeunload = function(event) {
      // Don't show the warning if nothing has been done to the project
      if(this.project.numUndoStates > 1) {
          return null;
      }

      var confirmationMessage = 'Warning: All unsaved changes will be lost!';
      (event || window.event).returnValue = confirmationMessage; //Gecko + IE
      return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    };
  }

  componentDidMount = () => {
    this.hidePreloader();
    this.onWindowResize();
    this.showAutosavedProjects();
  }

  componentDidUpdate = (prevProps, prevState) => {

    if(this.state.previewPlaying && !prevState.previewPlaying) {
      this.project.view.canvas.focus();
      this.project.play({
        onError: (error) => {
          this.stopPreviewPlaying([error])
        },
        onAfterTick: () => {
          //this.project.view.render();
          this.project.guiElement.draw();
        },
        onBeforeTick: () => {

        },
      });
    }

    if(!this.state.previewPlaying && prevState.previewPlaying) {
      this.project.stop();
      this.projectDidChange();
    }
  }

//

  hidePreloader = () => {
    let preloader = window.document.getElementById('preloader');
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
      this.project.view.render()
    }, 2000);
  }

  showWaitOverlay = (message) => {
    window.clearTimeout(this._showWaitOverlayTimeoutID);
    this._showWaitOverlayTimeoutID = window.setTimeout(() => {
      let waitOverlay = window.document.getElementById('wait-overlay');
      waitOverlay.innerHTML = message || "Please wait...";
      waitOverlay.style.display = 'block';
    }, 250);
  }

  hideWaitOverlay = () => {
    window.clearTimeout(this._showWaitOverlayTimeoutID);
    let waitOverlay = window.document.getElementById('wait-overlay');
    waitOverlay.style.display = 'none';
  }

  /**
   * Resets the editor in preparation for a project load.
   */
  resetEditorForLoad = () => {

  }

  onWindowResize = () => {
    // Ensure that all elements resize on window resize.
    this.resizeProps.onResize();

    // reset the code window if we resize the window.
    this.setState({
      codeEditorWindowProperties: this.getDefaultCodeEditorProperties(),
    });
  }

  getDefaultCodeEditorProperties = () => {
    var width = window.innerWidth / 2;
    var height = window.innerHeight / 2;
    return (
      {
        width: width,
        height: height,
        x: window.innerWidth/2 - width/2,
        y: window.innerHeight/2 - height/2,
        minWidth: 500,
        minHeight: 300,
      }
    );
  }

  onResize = (e) => {
    this.project.view.resize();
    this.project.guiElement.draw();
  }

  onStopResize = ({domElement, component}) => {

  }

  getSizeHorizontal = (domElement) => {
    return domElement.offsetWidth;
  }

  getSizeVertical = (domElement) => {
    return domElement.offsetHeight;
  }

  /**
   * Updates the code editor properties in the state.
   * @param  {object} newProperties object with new code editor properties. Can include width, height, x, y.
   */
  updateCodeEditorWindowProperties = (newProperties) => {
    let finalProperties = this.state.codeEditorWindowProperties;
    Object.keys(newProperties).forEach(key => {
      finalProperties[key] = newProperties[key];
    });

    this.setState({
      codeEditorWindowProperties: finalProperties,
    });
  }

  /**
   * Removes all code errors.
   */
  removeCodeErrors = () => {
    this.setState({
      codeErrors: [],
    });
  }

  /**
   * An event called when a minor code update happens as defined by the code editor.
   */
  onMinorScriptUpdate = () => {
    if (this.state.codeErrors.length > 0) {
      this.removeCodeErrors();
    }
  }

  /**
   * An event called when a major code update happens as defined by the code editor.
   * @return {[type]} [description]
   */
  onMajorScriptUpdate = () => {

  }

  /**
   * Called when the inspector is resized.
   * @param  {DomElement} domElement DOM element containing the inspector
   * @param  {React.Component} component  React component of the inspector.
   */
  onStopInspectorResize = ({domElement, component}) => {
    this.setState({
      inspectorSize: this.getSizeHorizontal(domElement)
    });
  }

  /**
   * Called when the asset library is resized.
   * @param  {DomElement} domElement DOM element containing the asset library
   * @param  {React.Component} component  React component of the asset library
   */
  onStopAssetLibraryResize = ({domElement, component}) => {
    this.setState({
      assetLibrarySize: this.getSizeVertical(domElement)
    });
  }

  /**
   * Called when the timeline is resized.
   * @param  {DomElement} domElement DOM element containing the timeline
   * @param  {React.Component} component  React component of the timeline.
   */
  onStopTimelineResize = ({domElement, component}) => {
    var size = this.getSizeVertical(domElement);

    this.setState({
      timelineSize: size
    });
  }

  /**
   * Opens the requested modal.
   * @param  {string} name name of the modal to open.
   */
  openModal = (name) => {
    this.setState({
      activeModalName: name,
    });
  }

  /**
   * Queues a modal to be opened at the next opportunity.
   * @param  {string} name [description]
   */
  queueModal = (name) => {
    if (this.state.activeModalName !== name) {
      // If there is another modal up, queue the modal.
      if (this.state.activeModalName !== null && this.state.activeModalQueue.indexOf(name) === -1) {
        this.setState(prevState => {
          return {
            activeModalQueue: [name].concat(prevState.activeModalQueue),
          }
        });
      // Otherwise, just open it.
      } else {
        this.openModal(name)
      }
    }
  }

  /**
   * Closes the active modal, if there is one. Opens the next modal in the
   * if necessary.
   */
  closeActiveModal = () => {
    let oldQueue = [].concat(this.state.activeModalQueue);
    if (oldQueue.length === 0) {
      this.openModal(null);
      return;
    }
    var newModalName = oldQueue.shift();
    this.setState({
      activeModalQueue: oldQueue,
    }, () => this.openModal(newModalName));
  }

  /**
   * Opens and closes the code editor depending on the state of the codeEditor.
   * @param {boolean} state - Optional. True will open the code editor, false will close.
   */
  toggleCodeEditor = (state) => {
    if (state === undefined || (typeof variable !== "boolean")) {
      state = !this.state.codeEditorOpen;
    }

    this.setState({
      codeEditorOpen: state,
    });
  }

  /**
   * Opens and closes the canvas actions popover.
   * @param {boolean} state - Optional. True will open the canvas actions menu, false will close.
   */
  toggleCanvasActions = (state) => {
    if (state === undefined || (typeof variable !== "boolean")) {
      state = !this.state.showCanvasActions;
    }

    this.setState({
      showCanvasActions: state,
    });
  }

  /**
   * Show code errors in the code editor by popping it up.
   * @param  {object[]} errors Array of error objects.
   */
  showCodeErrors = (errors) => {
    this.setState({
      codeEditorOpen: errors === undefined ? this.state.codeEditorOpen : true,
    });

    if (errors.length > 0) {
      let uuid = errors[0].uuid;
      let obj = window.Wick.ObjectCache.getObjectByUUID(uuid);
      this.setFocusObject(obj.parentClip);
      this.selectObject(obj)
      this.projectDidChange();
    }
  }

  /**
   * Signals to React that the "live" project changed, so that all components
   * displaying info about the project will render.
   * @param {boolean} skipHistory - If set to true, the current state will not be pushed to the history.
   */
  projectDidChange = (options) => {
    if(!options) options = {};

    // Request an autosave, so a save will happen sometime later.
    this.requestAutosave();

    // Save state to history if needed
    if(!options.skipHistory) {
      this.project.history.pushState(window.Wick.History.StateType.ONLY_VISIBLE_OBJECTS);
    }

    // Render engine
    this.project.view.render();
    this.project.guiElement.draw();

    // Force react to render
    this.setState({
      project: ''+Math.random(),
    });
  }

  /**
   * Create a toast notification.
   * @param {string} message - the message to display inside the toast.
   * @param {string} type - the type of the toast. ("info", "success", "warning", or "error". See react-toastify docs for more info)
   * @param {object} options - the options for the toast notification. For all options, see the demo for react-toastify: https://fkhadra.github.io/react-toastify/
   */
  toast = (message, type, options) => {
    if(!message) {
      console.error("toast() requires a message.");
      return;
    }

    // If no type is given, default to "info"
    if(!type) type = "info";

    if(["info", "success", "warning", "error"].indexOf(type) === -1) {
      console.error("toast(): Invalid type: " + type);
      return;
    }

    // If no options are given, set the options param to an empty object so only the default options are used.
    if(!options) options = {};

    // Default options for the toast:
    let defaultOptions = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: (type + '-toast-background'),
      bodyClassName: (type + '-toast-body'),
      progressClassName: (type + '-toast-progress'),
    };

    // Mix default options and options param:
    let mixOptions = Object.assign(defaultOptions, options);

    return toast[type](message, mixOptions);
  }

  /**
   * Updates an existing toast to a new toast type
   * @param {string} id ID of the toast to update.
   * @param {object} options options to apply to the newly updated toast.
   */
  updateToast = (id, options) => {
    if (options.text) {
      options.render = options.text;
    }

    if (options.type) {
      options.className = options.type + '-toast-background';
    }

    if (!options.autoClose) {
      options.autoClose = 5000;
    }

    toast.update(id, options);
  }


  /**
   * Opens a warning modal with a description. If the modal is accepted, the accept action is called.
   * @param {Object} args can contain description {string}, acceptAction {function}, cancelAction {function},
   * acceptText {string}, cancelText {string}, title {string}.
   */
  openWarningModal = (args) => {
    let modalInfo = {
      description: args.description || "No Description",
      title: args.title || "Title",
      acceptAction: args.acceptAction || (() => {console.warn("No accept action implemented.")}),
      cancelAction: args.cancelAction || (() => {console.warn("No cancel action implemented.")}),
      finalAction: args.finalAction || (() => {console.warn("No final action implemented.")}),
      acceptText: args.acceptText || "Accept",
      cancelText: args.cancelText || "Cancel",
    }

    this.setState({
      warningModalInfo: modalInfo,
      activeModalName: "GeneralWarning",
    });
  }

  // Any elements that are in hotkeys 2 will overwrite items by same name in hotkeys1.
  combineHotKeys = (hotkeys1, hotkeys2) => {
    // Try to combine all keys
    let newHotKeys = {...hotkeys1, ...hotkeys2};

    let keys1 = Object.keys(hotkeys1);
    let keys2 = Object.keys(hotkeys2);

    let similarKeys = keys2.filter(key => keys1.indexOf(key) > -1);

    similarKeys.forEach(key => {
      let combinedKey = {...hotkeys1[key], ...hotkeys2[key]};
      newHotKeys[key] = combinedKey;
    }); 

    return newHotKeys;
  }

  convertHotkeyArray = (hotkeys) => {
    let keyObj = {}; 

    hotkeys.forEach(key => {
      if (keyObj[key.actionName]) {
        keyObj[key.actionName][key.index] = key.sequence;
      } else {
        keyObj[key.actionName] = {}
        keyObj[key.actionName][key.index] = key.sequence;
      }
    });

    return keyObj;
  }

  // Expects array of hotkey objects
  addCustomHotKeys = (newHotKeys) => {
    let combined = this.combineHotKeys(this.state.customHotKeys, this.convertHotkeyArray(newHotKeys)); 

    this.syncHotKeys(combined);
  }

  syncHotKeys = (hotkeys) => {
    this.hotKeyInterface.setCustomHotKeys(hotkeys);
    localForage.setItem(this.customHotKeysKey, hotkeys);
    this.setState({
      customHotKeys: hotkeys
    }); 
  }

  resetCustomHotKeys = () => {
    this.syncHotKeys({});
  }

  /**
   * A flag to prevent "double state changes" where an action tries to happen while another is still processing.
   * Set this to true before doing something asynchronous that will take a long time, and set it back to false when done.
   */
  get processingAction () {
    return this._processingAction;
  }

  set processingAction (processingAction) {
    this._processingAction = processingAction;
  }

  handleWickFileLoad = (e) => {
    var file = e.target.files[0];
    if (!file) {
      console.warn('handleWickFileLoad: no files recieved');
      return;
    }
    this.importProjectAsWickFile(file);
  }

  handleAssetFileImport = (e) => {
    this.createAssets(e.target.files, []);
  }

  openProjectFileDialog = () => {
    this.openFileRef.current.click();
  }

  openImportAssetFileDialog = () => {
    this.importAssetRef.current.click();
  }

  /**
   * Returns the appropriate keymap based on the state of the editor.
   * @param fullKeyMap {Bool} If true, returns the full keymap for the editor. Otherwise, the appropriate keymap is returned.
   * @returns {Object} Keymap listed as actionName : Object { 0 : sequence, 1 : sequence }
   */
  getKeyMap = (fullKeyMap) => {
    if (this.state.previewPlaying && !fullKeyMap) {
      return this.hotKeyInterface.getEssentialKeyMap(this.state.customHotKeys)
    } else {
      return this.hotKeyInterface.getKeyMap(this.state.customHotKeys)
    }
  }

  /**
   * Returns the appropriate key handlers based on the state of the editor.
   * @param fullKeyHandlers {Bool} If true, returns all key handlers for the editor. Otherwise, the appropriate keyhandlers returned.
   */
  getKeyHandlers = (fullKeyHandlers) => {
    if (this.state.previewPlaying && !fullKeyHandlers) {
      return this.hotKeyInterface.getEssentialKeyHandlers(this.state.customHotKeys)
    } else {
      return this.hotKeyInterface.getHandlers(this.state.customHotKeys)
    }
  }

  render = () => {
    // Create some references to the project and editor to make debugging in the console easier:
    window.project = this.project;
    window.editor = this;

    return (
      <div>
        <div>
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
            pauseOnHover
          />
            <GlobalHotKeys
              allowChanges={true}
              keyMap={this.getKeyMap()}
              handlers={this.getKeyHandlers()}/>
              <div id="editor">
                <input
                  type='file'
                  accept={window.Wick.FileAsset.getValidExtensions().join(', ')}
                  style={{display: 'none'}}
                  ref={this.importAssetRef}
                  onChange={this.handleAssetFileImport}
                />
                <input
                  type='file'
                  accept='.zip, .wick'
                  style={{display: 'none'}}
                  ref={this.openFileRef}
                  onChange={this.handleWickFileLoad}
                />
                <div id="menu-bar-container">
                  <ModalHandler
                    activeModalName={this.state.activeModalName}
                    openModal={this.openModal}
                    closeActiveModal={this.closeActiveModal}
                    queueModal={this.queueModal}
                    project={this.project}
                    createClipFromSelection={this.createClipFromSelection}
                    createButtonFromSelection={this.createButtonFromSelection}
                    updateProjectSettings={this.updateProjectSettings}
                    exportProjectAsGif={this.exportProjectAsAnimatedGIF}
                    exportProjectAsVideo={this.exportProjectAsVideo}
                    exportProjectAsStandaloneZip={this.exportProjectAsStandaloneZip}
                    warningModalInfo={this.state.warningModalInfo}
                    loadAutosavedProject={this.loadAutosavedProject}
                    clearAutoSavedProject={this.clearAutoSavedProject}
                    renderProgress={this.state.renderProgress}
                    renderStatusMessage={this.state.renderStatusMessage}
                    renderType={this.state.renderType}
                    addCustomHotKeys={this.addCustomHotKeys}
                    resetCustomHotKeys={this.resetCustomHotKeys}
                    customHotKeys={this.state.customHotKeys}
                    keyMap={this.getKeyMap()}
                  />
                  {/* Header */}
                  <DockedPanel showOverlay={this.state.previewPlaying}>
                    <MenuBar
                      openModal={this.openModal}
                      projectName={this.project.name}
                      openProjectFileDialog={this.openProjectFileDialog}
                      openNewProjectConfirmation={this.openNewProjectConfirmation}
                      exportProjectAsWickFile={this.exportProjectAsWickFile}
                      importProjectAsWickFile={this.importProjectAsWickFile}
                      toast={this.toast}
                      openExportOptions={() => {this.openModal('ExportOptions')}}
                    />
                  </DockedPanel>
                </div>
                <div id="editor-body">
                  <div id="flexible-container">
                    {/*App*/}
                    <ReflexContainer windowResizeAware={true} orientation="vertical">
                      {/* Middle Panel */}
                      <ReflexElement {...this.resizeProps}>
                        {/*Toolbox*/}
                        <div id="toolbox-container">
                          <DockedPanel showOverlay={this.state.previewPlaying}>
                            <Toolbox
                              project={this.state.project}
                              getActiveToolName={() => this.getActiveTool().name}
                              activeToolName={this.getActiveTool().name}
                              setActiveTool={this.setActiveTool}
                              getToolSetting={this.getToolSetting}
                              setToolSetting={this.setToolSetting}
                              previewPlaying={this.state.previewPlaying}
                              editorActions={this.actionMapInterface.editorActions}
                              getToolSettingRestrictions={this.getToolSettingRestrictions}
                              showCanvasActions={this.state.showCanvasActions}
                              toggleCanvasActions={this.toggleCanvasActions}
                            />
                          </DockedPanel>
                        </div>
                        <div id="editor-canvas-timeline-panel">
                          <ReflexContainer windowResizeAware={true} orientation="horizontal">
                            {/*Canvas*/}
                            <ReflexElement {...this.resizeProps}>
                              <DockedPanel>
                                <Canvas
                                  project={this.project}
                                  projectDidChange={this.projectDidChange}
                                  projectData={this.state.project}
                                  paper={this.paper}
                                  previewPlaying={this.state.previewPlaying}
                                  createImageFromAsset={this.createImageFromAsset}
                                  toast={this.toast}
                                  onRef={ref => this.canvasComponent = ref}
                                />
                                <CanvasTransforms
                                  onionSkinEnabled={this.project.onionSkinEnabled}
                                  toggleOnionSkin={this.toggleOnionSkin}
                                  zoomIn={this.zoomIn}
                                  zoomOut={this.zoomOut}
                                  recenterCanvas={this.recenterCanvas}
                                  activeToolName={this.getActiveTool().name}
                                  setActiveTool={this.setActiveTool}
                                  previewPlaying={this.state.previewPlaying}
                                  togglePreviewPlaying={this.togglePreviewPlaying}
                                />
                              </DockedPanel>
                            </ReflexElement>
                            <ReflexSplitter {...this.resizeProps}/>
                            {/*Timeline*/}
                            <ReflexElement
                              minSize={100}
                              size={this.state.timelineSize}
                              onResize={this.resizeProps.onResize}
                              onStopResize={this.resizeProps.onStopTimelineResize}>
                              <DockedPanel  showOverlay={this.state.previewPlaying}>
                                <Timeline
                                  project={this.project}
                                  projectDidChange={this.projectDidChange}
                                  projectData={this.state.project}
                                  getSelectedTimelineObjects={this.getSelectedTimelineObjects}
                                  setOnionSkinOptions={this.setOnionSkinOptions}
                                  getOnionSkinOptions={this.getOnionSkinOptions}
                                  setFocusObject={this.setFocusObject}
                                  addTweenKeyframe={this.addTweenKeyframe}
                                  onRef={ref => this.timelineComponent = ref}
                                  dragSoundOntoTimeline={this.dragSoundOntoTimeline}
                                />
                              </DockedPanel>
                            </ReflexElement>
                          </ReflexContainer>
                        </div>
                      </ReflexElement>

                      <ReflexSplitter {...this.resizeProps}/>

                      {/* Right Sidebar */}
                      <ReflexElement
                        size={250}
                        maxSize={300} minSize={200}
                        onResize={this.resizeProps.onResize}
                        onStopResize={this.resizeProps.onStopInspectorResize}>
                        <ReflexContainer windowResizeAware={true} orientation="horizontal">
                          {/* Inspector */}
                          <ReflexElement {...this.resizeProps}>
                            <DockedPanel showOverlay={this.state.previewPlaying}>
                              <Inspector
                                getToolSetting={this.getToolSetting}
                                setToolSetting={this.setToolSetting}
                                getSelectionType={this.getSelectionType}
                                getAllSoundAssets={this.getAllSoundAssets}
                                getAllSelectionAttributes={this.getAllSelectionAttributes}
                                setSelectionAttribute={this.setSelectionAttribute}
                                editorActions={this.actionMapInterface.editorActions}
                                selectionIsScriptable={this.selectionIsScriptable}
                                script={this.getSelectedObjectScript()}
                                scriptInfoInterface={this.scriptInfoInterface}
                                deleteScript={this.deleteScript}
                                editScript={this.editScript}
                                fontInfoInterface={this.fontInfoInterface}
                                project={this.project}
                                importFileAsAsset={this.importFileAsAsset}
                              />
                            </DockedPanel>
                          </ReflexElement>

                          <ReflexSplitter {...this.resizeProps}/>

                          {/* Asset Library */}
                          <ReflexElement
                            minSize={100}
                            size={this.state.assetLibrarySize}
                            onResize={this.resizeProps.onResize}
                            onStopResize={this.resizeProps.onStopAssetLibraryResize}>
                            <DockedPanel showOverlay={this.state.previewPlaying}>
                              <AssetLibrary
                                projectData={this.state.project}
                                assets={this.project.getAssets()}
                                openImportAssetFileDialog={this.openImportAssetFileDialog}
                                selectObjects={this.selectObjects}
                                clearSelection={this.clearSelection}
                                isObjectSelected={this.isObjectSelected}
                              />
                            </DockedPanel>
                          </ReflexElement>
                        </ReflexContainer>
                      </ReflexElement>
                    </ReflexContainer>
                  </div>
                </div>
              </div>
          {this.state.codeEditorOpen &&
            <PopOutCodeEditor
              codeEditorWindowProperties={this.state.codeEditorWindowProperties}
              updateCodeEditorWindowProperties={this.updateCodeEditorWindowProperties}
              scriptInfoInterface={this.scriptInfoInterface}
              selectionIsScriptable={this.selectionIsScriptable}
              getSelectionType={this.getSelectionType}
              script={this.getSelectedObjectScript()}
              errors={this.state.codeErrors}
              onMinorScriptUpdate={this.onMinorScriptUpdate}
              onMajorScriptUpdate={this.onMajorScriptUpdate}
              deleteScript={this.deleteScript}
              scriptToEdit={this.state.scriptToEdit}
              editScript={this.editScript}
              toggleCodeEditor={this.toggleCodeEditor}
              />}
        </div>
      </div>
      )
  }
}

export default DragDropContext(HTML5Backend)(Editor)
