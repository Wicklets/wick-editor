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
      'delete': 'backspace',
      'preview-play-toggle': 'enter',
      'undo': 'ctrl+z',
      'redo': 'ctrl+y',
      'leave-focus': '8',
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
      'undo': (() => this.editor.state.history.undo()),
      'redo': (() => this.editor.state.history.redo()),
      'leave-focus': (() => this.editor.focusTimelineOfParentObject()),
      'do-nothing': (() => console.log("donothing")),
    }

    for(let name in this.handlers) {
      let origHandler = this.handlers[name];
      this.handlers[name] = ((e) => {
        if(e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA')
          origHandler();
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
