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

import 'Editor/styles/PopOuts/_wickcodeeditor.css';

export default function WickCodeEditor(props) {

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

  function resizeConsole (console) {
    props.updateCodeEditorWindowProperties({
      consoleHeight: console.domElement.offsetHeight,
    });
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
      </div>
      <div className="wick-code-editor-body">
        <div className="wick-code-editor-reference">

        </div>
        <div className="wick-code-editor-content">
          <div className="wick-code-editor-tabs">
              Tabs
          </div>
          <ReflexContainer>
            <ReflexElement>
              <div className="wick-code-editor-code">
                Code
              </div>
            </ReflexElement>
            
            <ReflexSplitter></ReflexSplitter>
            
            <ReflexElement
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