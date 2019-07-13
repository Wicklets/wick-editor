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

// Use React Hotkeys style mappings
class HotKeyInterface extends Object {
  // Take in wick editor
  constructor(editor) {
    super();
    this.editor = editor;
    this.createKeyMap();
    this.createHandlers();

    // Keys that should always work.
    this.essentialKeys = ['preview-play-toggle'];
  }

  // Create mappings of actions to keys
  // SINGLE: action:'key' | OR: action:['keya','keyb'] | AND: action 'keya+keyb'
  createKeyMap = () => {
    this.keyMap = {
      'activate-brush': 'b',
      'activate-cursor': ['c','v'],
      'activate-pencil': 'p',
      'activate-eraser': 'e',
      'activate-rectangle': 'r',
      'activate-ellipse': 'o',
      'activate-line': 'l',
      'activate-text': 't',
      'activate-pan': 'space',
      'activate-fill': ['f','g'],
      'activate-eyedropper': 'd',
      'deactivate-pan': { sequence: "space", action: "keyup" },
      'activate-zoom': 'z',
      'delete': ['backspace', 'del'],
      'preview-play-toggle': ['enter'],
      'preview-play-from-start': ['ctrl+enter', 'command+enter'],
      'undo': ['ctrl+z','command+z'],
      'redo': ['ctrl+y','command+y'],
      'copy': ['ctrl+c','command+c'],
      'paste': ['ctrl+v', 'command+v'],
      'cut': ['ctrl+x', 'command+x'],
      'break-apart': 'ctrl+b',
      'grow-brush-size': ']',
      'shrink-brush-size': '[',
      'move-playhead-forwards': '.',
      'move-playhead-backwards': ',',
      'select-all': ['ctrl+a', 'command+a'],
      'bring-to-front': ['ctrl+shift+up', 'command+shift+up'],
      'send-to-back': ['ctrl+shift+down', 'command+shift+down'],
      'move-forwards': ['ctrl+up', 'command+up'],
      'move-backwards': ['ctrl+down', 'command+down'],
      'nudge-up': 'up',
      'nudge-down': 'down',
      'nudge-left': 'left',
      'nudge-right': 'right',
      'nudge-up-more': 'shift+up',
      'nudge-down-more': 'shift+down',
      'nudge-left-more': 'shift+left',
      'nudge-right-more': 'shift+right',
      'toggle-script-editor': '`',
      'export-project-as-wick-file': ['ctrl+s', 'command+s'],
      'import-project-as-wick-file': ['ctrl+o', 'command+o'],
      'create-clip-from-selection': ['ctrl+g', 'command+g'],
      'break-apart-selection': ['ctrl+shift+g', 'command+shift+g']
    }
  }

  createHandlers = () => {
    this.handlers = {
      'activate-brush': (() => this.editor.setActiveTool("brush")),
      'activate-cursor': (() => this.editor.setActiveTool("cursor")),
      'activate-pencil': (() => this.editor.setActiveTool("pencil")),
      'activate-eraser': (() => this.editor.setActiveTool("eraser")),
      'activate-rectangle': (() => this.editor.setActiveTool("rectangle")),
      'activate-ellipse': (() => this.editor.setActiveTool("ellipse")),
      'activate-line': (() => this.editor.setActiveTool("line")),
      'activate-text': (() => this.editor.setActiveTool("text")),
      'activate-fill': (() => this.editor.setActiveTool("fillbucket")),
      'activate-eyedropper': (() => this.editor.setActiveTool("eyedropper")),
      'activate-pan': (() => this.editor.setActiveTool("pan")),
      'deactivate-pan': this.editor.activateLastTool,
      'activate-zoom': (() => this.editor.setActiveTool("zoom")),
      'delete': this.editor.deleteSelectedObjects,
      'preview-play-toggle': this.editor.togglePreviewPlaying,
      'preview-play-from-start': this.editor.startPreviewPlayFromBeginning,
      'break-apart': this.editor.breakApartSelection,
      'undo': this.editor.undoAction,
      'redo': this.editor.redoAction,
      'leave-focus': this.editor.focusTimelineOfParentObject,
      'do-nothing': (() => console.log("donothing")),
      'copy': this.editor.copySelectionToClipboard,
      'cut': this.editor.cutSelectionToClipboard,
      'paste': this.editor.pasteFromClipboard,
      'grow-brush-size': this.editor.growBrushSize,
      'shrink-brush-size': this.editor.shrinkBrushSize,
      'move-playhead-forwards': this.editor.movePlayheadForwards,
      'move-playhead-backwards': this.editor.movePlayheadBackwards,
      'select-all': this.editor.selectAll,
      'bring-to-front': this.editor.bringSelectionToFront,
      'send-to-back': this.editor.sendSelectionToBack,
      'move-forwards': this.editor.moveSelectionForwards,
      'move-backwards': this.editor.moveSelectionBackwards,
      'nudge-up': this.editor.nudgeSelectionUp,
      'nudge-down': this.editor.nudgeSelectionDown,
      'nudge-left': this.editor.nudgeSelectionLeft,
      'nudge-right': this.editor.nudgeSelectionRight,
      'nudge-up-more': this.editor.nudgeSelectionUpMore,
      'nudge-down-more': this.editor.nudgeSelectionDownMore,
      'nudge-left-more': this.editor.nudgeSelectionLeftMore,
      'nudge-right-more': this.editor.nudgeSelectionRightMore,
      'toggle-script-editor': this.editor.toggleCodeEditor,
      'export-project-as-wick-file': this.editor.exportProjectAsWickFile,
      'import-project-as-wick-file': (() => console.log("Ctrl-O as a shortcut doesn't work yet.")),
      'create-clip-from-selection': (() => this.editor.createClipFromSelection("", false)),
      'break-apart-selection': (() => this.editor.breakApartSelection())
    }

    for(let name in this.handlers) {
      let origHandler = this.handlers[name];
      this.handlers[name] = ((e) => {
        // If we are not on a text input area, use the original hotkey function and prevent the default action.
        if(e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          origHandler();
        }
      });
    }
  }

  getKeyMap = () => {
    return this.keyMap;
  }

  getHandlers = () => {
    return this.handlers;
  }

  getEssentialKeyMap = () => {
    return this.filterObject(this.essentialKeys, this.getKeyMap());
  }

  getEssentialKeyHandlers = () => {
    return this.filterObject(this.essentialKeys, this.getHandlers());
  }

  /**
   * Returns a filtered object that only contains provided keys
   * @param  {string[]} filters list of strings to filter.
   * @param  {object} obj     object to filter.
   * @return {object}         filtered object
   */
  filterObject(filters, obj) {
    let map = {}

    this.essentialKeys.forEach(key => {
      if (key in obj) {
        map[key] = obj[key]
      }
    });

    return map;
  }
}

export default HotKeyInterface;
