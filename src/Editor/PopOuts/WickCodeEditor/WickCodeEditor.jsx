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

import React, { useState } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import { Rnd } from 'react-rnd';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import AddScriptPanel from './AddScriptPanel/AddScriptPanel';

// Import Ace Editor and themes.
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/monokai';
import 'Editor/styles/PopOuts/_wickcodeeditor.css';

import capitalize from 'Editor/Util/DataFunctions/capitalize';

export default function WickCodeEditor(props) {

  const [addScriptTab, setAddScriptTab] = useState('Mouse');

  function onDragHandler (e, d) {
    props.updateCodeEditorWindowProperties({
      x: d.x,
      y: d.y,
    });
  }

  function onResizeHandler (e, dir, ref, delta, position) {
    props.updateCodeEditorWindowProperties({
      width: ref.style.width,
      height: ref.style.height,
    });
  }

  /**
   * To run when the console is resized. Should update
   * the size of the console in the main editor.
   * @param {object} console 
   */
  function resizeConsole (console) {
    props.updateCodeEditorWindowProperties({
      consoleHeight: console.domElement.offsetHeight,
    });
  }


  /**
   * Adds a script to the currently selected object.
   */
  function addScript (scriptName) {
    props.script.addScript(scriptName);
    props.editScript(scriptName);
    // props.rerenderCodeEditor();
  }

  /**
   * To run when the script changes.
   * @param {script} newScript - New script to change. 
   */
  let scriptOnChange = (newScript) => {
    if (props.script) {
      props.requestAutosave();
      props.script.updateScript(props.scriptToEdit, newScript);
      props.onMinorScriptUpdate(newScript);
    }
  }

  // Determine the script to display.
  let scriptToShow = 'No Script';
  if (props.script) {
    scriptToShow = props.script.src;
  }

  let scriptsByType = props.scriptInfoInterface.scriptsByType;
  let scriptDescriptions = props.scriptInfoInterface.scriptDescriptions;

  return (
    <Rnd
      id="wick-code-editor-resizeable"
      bounds="window"
      dragHandleClassName="wick-code-editor-drag-handle"
      minWidth={props.codeEditorWindowProperties.minWidth}
      minHeight={props.codeEditorWindowProperties.minHeight}
      onResizeStop={onResizeHandler}
      onDragStop={onDragHandler}
      default={props.codeEditorWindowProperties}
    >

      <div className="wick-code-editor-drag-handle">
        <div className="wick-code-editor-icon">{"</>"}</div>
        Code Editor

        <ActionButton 
          className="we-code-close-button" 
          color="tool" 
          icon="cancel-white" 
          action={props.toggleCodeEditor}/>
      </div>
      <div className="wick-code-editor-body">
        <div className="wick-code-editor-reference">

        </div>
        <div className="wick-code-editor-content">
          <div className="wick-code-editor-tabs">
            {props.script && props.script.scripts.map(script => {
              return <button 
                onClick={() => {
                  props.editScript(script.name)
                  props.clearCodeEditorError();
                }}
                className="we-code-script-button"
              >
                {capitalize(script.name)}
                </button>
            })}
              <button 
                  onClick={() => {
                    props.editScript('add')
                    props.clearCodeEditorError();
                  }}
                  className="we-code-script-button"
                >
                +
              </button>
          </div>
          <ReflexContainer>
            <ReflexElement>
              <div className="wick-code-editor-code">
                {
                  props.scriptToEdit === 'add' && <AddScriptPanel 
                  availableScripts={props.script && props.script.getAvailableScripts()}
                  scripts={props.scriptInfoInterface.scriptData.filter(script => script.type === addScriptTab)}
                  changeTab={(tab) => setAddScriptTab(tab)}
                  addScript={addScript}
                  addScriptTab={addScriptTab}
                  /> 
                }
                {
                  props.scriptToEdit !== 'add' && 
                  <AceEditor
                    value={scriptToShow}
                    mode="javascript"
                    theme="monokai"
                    fontSize={16} // TODO: Controllable by User
                    width="100%"
                    height="100%"
                    name="wick-ace-editor"
                    focus={props.focus}
                    editorProps={{$blockScrolling: true}}
                    onChange={scriptOnChange}

                    // onCursorChange={this.props.onCursorChange}
                    // focus={this.props.focus}
                    // onLoad={this.onLoad}
                    // markers={this.mapErrorToMarkers(this.props.error)}
                  />
                }
              </div>
            </ReflexElement>
            
            <ReflexSplitter></ReflexSplitter>
            
            <ReflexElement
              minSize={40}
              size={props.codeEditorWindowProperties.consoleOpen ? props.codeEditorWindowProperties.consoleHeight : 1}
              onStopResize={resizeConsole}>
              <div className="wick-code-editor-console">
                Console
              </div>
            </ReflexElement>
          </ReflexContainer>
        </div>
      </div>

    </Rnd>
  )
}