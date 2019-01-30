// Use React Hotkeys style mappings
class HotKeyInterface extends Object {
  // Take in wick editor
  constructor(editor) {
    super();
    this.editor = editor;
    this.createKeyMap = this.createKeyMap.bind(this);
    this.createHandlers = this.createHandlers.bind(this);
    this.createKeyMap();
    this.createHandlers();
  }

  // Create mappings of actions to keys
  // SINGLE: action:'key' | OR: action:['keya','keyb'] | AND: action 'keya+keyb'
  createKeyMap() {
    this.keyMap = {
      'activate-brush': 'b',
      'activate-cursor': 'c',
      'activate-pencil': 'p',
      'activate-eraser': 'e',
      'activate-rectangle': 'r',
      'activate-ellipse': 'o',
      'activate-line': 'l',
      'activate-eyedropper': 'v',
      'activate-pan': 'space',
      'activate-zoom': 'z',
      'delete': ['backspace', 'del'],
      'preview-play-toggle': ['ctrl+enter','command+enter'],
      'undo': ['ctrl+z','command+z'],
      'redo': ['ctrl+y','command+y'],
      'copy': ['ctrl+c','command+c'],
      'paste': ['ctrl+v', 'command+v'],
      'cut': ['ctrl+x', 'command+x'],
      'auto-load': ['alt+a+v'],
      'clear-auto-save': ['alt+a+c'],
      'break-apart': 'ctrl+b',
      'grow-brush-size': ']',
      'shrink-brush-size': '[',
    }
  }

  createHandlers() {
    this.handlers = {
      'activate-brush': (() => this.editor.setActiveTool("brush")),
      'activate-cursor': (() => this.editor.setActiveTool("cursor")),
      'activate-pencil': (() => this.editor.setActiveTool("pencil")),
      'activate-eraser': (() => this.editor.setActiveTool("eraser")),
      'activate-rectangle': (() => this.editor.setActiveTool("rectangle")),
      'activate-ellipse': (() => this.editor.setActiveTool("ellipse")),
      'activate-line': (() => this.editor.setActiveTool("line")),
      'activate-eyedropper': (() => this.editor.setActiveTool("eyedropper")),
      'activate-pan': (() => this.editor.setActiveTool("pan")),
      'activate-zoom': (() => this.editor.setActiveTool("zoom")),
      'delete': (() =>  this.editor.deleteSelectedObjects()),
      'preview-play-toggle': (() => this.editor.togglePreviewPlaying()),
      'break-apart': (() => this.editor.breakApartSelection()),
      'undo': (() => this.editor.history.undo()),
      'redo': (() => this.editor.history.redo()),
      'leave-focus': (() => this.editor.focusTimelineOfParentObject()),
      'do-nothing': (() => console.log("donothing")),
      'copy': this.editor.copySelectionToClipboard,
      'cut': this.editor.cutSelectionToClipboard,
      'paste': this.editor.pasteFromClipboard,
      'auto-load': this.editor.attemptAutoLoad,
      'clear-auto-save': this.editor.clearAutoSavedProject,
      'grow-brush-size': this.editor.growBrushSize,
      'shrink-brush-size': this.editor.shrinkBrushSize,
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

  getKeyMap() {
    return this.keyMap;
  }

  getHandlers() {
    return this.handlers;
  }
}

export default HotKeyInterface;
