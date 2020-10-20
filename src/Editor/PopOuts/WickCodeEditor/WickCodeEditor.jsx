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

import React, { useState, useEffect, useRef } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex'
import WickInput from 'Editor/Util/WickInput/WickInput';
import { Rnd } from 'react-rnd';
import ActionButton from 'Editor/Util/ActionButton/ActionButton';
import AddScriptPanel from './AddScriptPanel/AddScriptPanel';
import { Console, Hook, Unhook } from 'console-feed'

// Import Ace Editor and themes.
import AceEditor from 'react-ace';
import 'brace/mode/javascript';

import 'brace/theme/monokai';
import 'brace/theme/dracula';
import 'brace/theme/eclipse';
import 'brace/theme/github';

import 'Editor/styles/PopOuts/_wickcodeeditor.css';

import capitalize from 'Editor/Util/DataFunctions/capitalize';
import ToolIcon from '../../Util/ToolIcon/ToolIcon';

const editorThemes = [
  {
    value: 'monokai',
    label: 'Monokai'
  }, 
  {
    value: 'cobalt',
    label: 'Cobalt'
  },
  {
    value: 'dracula',
    label: 'Dracula'
  },
  {
    value: 'eclipse',
    label: 'Eclipse'
  },
  {
    value: 'github',
    label: 'Github',
  }]

let classNames = require('classnames');

export default function WickCodeEditor(props) {

  const [addScriptTab, setAddScriptTab] = useState('Mouse');
  const [consoleType, setConsoleType] = useState('console');
  const [aceEditor, setAceEditor] = useState(null);
  const [logs, setLogs] = useState([]);

  const editorThemeSelectRef = useRef();

  // Run once, connect the console to the console object.
  useEffect(() => {
    Hook(window.console, log => setLogs(currLogs => [...currLogs, log]), false)
    return () => Unhook(window.console)
  }, [])

  function onDragHandler(e, d) {
    props.updateCodeEditorWindowProperties({
      x: d.x,
      y: d.y,
    });
  }

  function onResizeHandler(e, dir, ref, delta, position) {
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
  function resizeConsole(console) {
    props.updateCodeEditorWindowProperties({
      consoleHeight: console.domElement.offsetHeight,
    });
  }


  /**
   * Adds a script to the currently selected object.
   */
  function addScript(scriptName) {
    if (!props.script) return;

    props.script.addScript(scriptName);
    props.editScript(scriptName);
    // props.rerenderCodeEditor();
  }

  /**
   * To run when the script changes.
   * @param {script} newScript - New script to change. 
   */
  function scriptOnChange(newScript) {
    if (props.script) {
      props.requestAutosave();
      props.script.updateScript(props.scriptToEdit, newScript);
      props.onMinorScriptUpdate(newScript);
    }
  }


  /**
   * Clears the console in the code editor.
   */
  function clearConsole() {
    setLogs([]);
  }


  // Determine the script to display.
  let scriptToShow = 'No Scriptable Object Selected';
  if (props.script) {
    scriptToShow = props.script.src;
  }


  // Sort scripts if needed.
  props.script && props.script.scripts.sort(props.scriptInfoInterface.sortScripts);

  /**
   * Adds code to the currently accessed code tab at the current cursor position.
   * @param {string} code to add to tab.
   */
  function addCodeToTab(code) {
    if (aceEditor && props.scriptToEdit !== "add") {
      aceEditor.session.insert(aceEditor.getCursorPosition(), code);
    }
  }

  /**
   * Map error from editor to markers for Ace Editor
   * @param {object} error - Object representing error from editor. Should include lineNumber.
   */
  function mapErrorToMarkers(error) {
    if (!error) {
      return [];
    }

    let marker = {};
    marker.startRow = error.lineNumber - 1;
    marker.endRow = error.lineNumber - 1;
    marker.startCol = 0;
    marker.endCol = 1000; // Set length to an arbitrary amount that should encompass the whole line.
    marker.className = 'error-marker';
    marker.type = 'background';
    return [marker];
  }

  /**
   * Sets code editor font size. 
   * @param {*} size 
   */
  function setCodeEditorFontSize(size) {
    props.updateCodeEditorWindowProperties({
      fontSize: size,
    })
  }

  /**
   * Renders all code editor options.
   */
  function renderCodeEditorOptions() {
    return <div className="we-code-options-panel">

      <table>
        <tbody>
          <tr>
            <th>Option</th>
            <th></th>
          </tr>
          <tr>
            <td>Font Size</td>
            <td> <WickInput
              className="code-editor-option-input"
              id="code-editor-font"
              type="numeric"
              value={props.codeEditorWindowProperties.fontSize}
              onChange={(val) => { setCodeEditorFontSize(val) }}
            /></td>
          </tr>
          <tr>
            <td>Editor Style</td>
            <td> 
              <select 
              selected={props.codeEditorWindowProperties.theme}
              ref={editorThemeSelectRef}
              onChange={(e) => {
                props.updateCodeEditorWindowProperties({theme: editorThemeSelectRef.current.value})}}>
                {editorThemes.map(theme => {
                  return <option 
                  value={theme.value}
                  key={'code-theme-' + theme.value}>{theme.label}</option>
                })}

              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  }

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
          action={props.toggleCodeEditor} />
      </div>
      <div className="wick-code-editor-body">
        <div className="wick-code-editor-reference">
          <CodeReference
            referenceItems={props.scriptInfoInterface.referenceItems}
            addCodeToTab={addCodeToTab} />
        </div>
        <div className="wick-code-editor-content">
          <div className="wick-code-editor-tabs">
            {props.script && props.script.scripts.map(script => {
              return <button
                key={"script-tab-" + script.name}
                onClick={() => {
                  props.editScript(script.name)
                  props.clearCodeEditorError();
                }}

                className={classNames("we-code-script-button",
                  "we-event",
                  props.scriptInfoInterface.getScriptType(script.name),
                  { selected: props.scriptToEdit === script.name })}
              >
                {capitalize(script.name)}
              </button>
            })}
            <button
              onClick={() => {
                props.editScript('add')
                props.clearCodeEditorError();
              }}
              className={classNames("we-code-script-button", "we-code-add")}
            >
              +
              </button>
          </div>
          <ReflexContainer>
            <ReflexElement>
              <div className={classNames("wick-code-editor-code", 'theme' + props.codeEditorWindowProperties.theme)}>
                {
                  props.scriptToEdit === 'add' &&
                  <AddScriptPanel
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
                    theme={props.codeEditorWindowProperties.theme}
                    fontSize={props.codeEditorWindowProperties.fontSize} // TODO: Controllable by User
                    width="100%"
                    height="100%"
                    name="wick-ace-editor"
                    focus={props.focus}
                    editorProps={{ $blockScrolling: true }}
                    onChange={scriptOnChange}
                    onLoad={(editor) => setAceEditor(editor)}
                    markers={mapErrorToMarkers(props.error)}
                    readOnly={!props.script}
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

                <div className="we-code-console-bar">
                  <div className="we-code-console-title">{consoleType === 'options' ? 'Editor Options' : 'Console'}</div>
                  <div className="we-code-console-options-container">
                    {
                      consoleType === 'options' &&
                      <ActionButton
                        className="we-code-console-option"
                        id="console-console-button"
                        icon="codeConsole"
                        action={() => { setConsoleType('console') }}
                        tooltip="Show Console"
                        tooltipPlace="left"
                        color='tool' />
                    }

                    {
                      consoleType === 'console' &&
                      <ActionButton
                        className="we-code-console-option"
                        id="console-option-button"
                        icon="gear"
                        action={() => { setConsoleType('options') }}
                        tooltip="Show Options"
                        tooltipPlace="left"
                        color='tool' />
                    }

                    {
                      consoleType === 'console' &&
                      <ActionButton
                        className="we-code-console-option we-code-clear-console"
                        id="clear-console-button"
                        icon="clear"
                        action={clearConsole}
                        tooltip="Clear Console"
                        tooltipPlace="left"
                        color='tool' />
                    }
                  </div>

                </div>

                {consoleType === 'console' && <Console logs={logs} variant="dark" />}
                {consoleType === 'options' && renderCodeEditorOptions()}
              </div>
            </ReflexElement>
          </ReflexContainer>
        </div>
      </div>

    </Rnd>
  )
}

/**
 * Interactive code reference
 */
function CodeReference(props) {
  const [selected, setSelected] = useState('');

  let referenceKeys = Object.keys(props.referenceItems);

  let codeOptions = props.referenceItems[selected];

  function renderChoices() {
    return (
      referenceKeys.map(refKey => {
        return <button
          key={"code-reference-button-" + refKey}
          className={classNames("reference-button", "we-code", refKey)}
          onClick={() => setSelected(refKey)}
        >
          <ToolIcon name={'code' + refKey} className="reference-icon" />
          <div className="reference-button-title">{refKey}</div>
        </button>
      })
    )
  }

  function renderCodeOptions(referenceKey) {
    return (
      <div
        className="we-code-options"
      >
        <div className="we-code-options-body">
          {/* Interactive Reference Buttons */}
          {codeOptions.map(option => 
            <div
            key={"code-option-button-" + option.name}
            className="code-option-button">
              <ActionButton
                  id={"code-reference-button-" + option.name}
                  action={() => { props.addCodeToTab(option.snippet) }}
                  tooltip={option.description}
                  tooltipPlace="left"
                  color='reference'
                  text={option.name} />
            </div>
          )}
        </div>

      </div>
    )
  }

  return (
    <div className="we-code-reference">
      <div className="we-code-reference-title">
        <div className="we-code-reference-title-text">Reference</div>

        {
          selected !== '' &&
          <div className="we-code-options-selected">
            <button
              className="we-code-options-back"
              onClick={() => setSelected('')}>{'<-'}</button>
            <button
              key={"code-reference-button-" + selected}
              className={classNames("reference-button", "we-code", selected)}
            >
              <ToolIcon name={'code' + selected} className="reference-icon" />
              <div className="reference-button-title">{selected}</div>
            </button>
          </div>
        }
      </div>

      <div className="we-code-reference-body">
        {
          selected === '' && renderChoices()
        }

        {
          selected !== '' && renderCodeOptions(selected)
        }
      </div>

    </div>
  )
}
