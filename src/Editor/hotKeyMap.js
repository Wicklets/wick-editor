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
      'delete': 'q',
    }
  }

  createHandlers() {
    this.handlers =     {
          'activate-brush': (() => this.editor.activateTool("brush")),
          'activate-cursor': (() => this.editor.activateTool("cursor")),
          'activate-pencil': (() => this.editor.activateTool("pencil")),
          'activate-eraser': (() => this.editor.activateTool("eraser")),
          'activate-rectangle': (() => this.editor.activateTool("rectangle")),
          'activate-ellipse': (() => this.editor.activateTool("ellipse")),
          'activate-line': (() => this.editor.activateTool("line")),
          'activate-eyedropper': (() => this.editor.activateTool("eyedropper")),
          'activate-pan': (() => this.editor.activateTool("pan")),
          'activate-zoom': (() => this.editor.activateTool("zoom")),
          'delete': (() => this.editor.deleteSelectedObjects()),
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
