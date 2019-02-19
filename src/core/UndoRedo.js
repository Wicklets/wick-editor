class UndoRedo {
  constructor (editor) {
    this.editor = editor;

    this._undoStack = [];
    this._redoStack = [];

    this.LOG_STACKS = false;
  }

  saveState () {
    this._undoStack.push(this._generateProjectState());
    this._redoStack = [];

    if(this.LOG_STACKS) this._logStacks();
  }

  undo () {
    if(this._undoStack.length <= 1) return false;

    let currentState = this._undoStack.pop();
    this._redoStack.push(currentState);

    let oldState = this._undoStack[this._undoStack.length-1];
    this._recoverProjectState(oldState);

    if(this.LOG_STACKS) this._logStacks();

    return true;
  }

  redo () {
    if(this._redoStack.length === 0) return false;

    let recoveredState = this._redoStack.pop();
    this._undoStack.push(recoveredState);

    this._recoverProjectState(recoveredState);

    if(this.LOG_STACKS) this._logStacks();

    return true;
  }

  clearHistory () {
    this._undoStack = [];
    this._redoStack = [];
  }

  _generateProjectState () {
    return {
      project: this.editor.project.serialize(),
    };
  }

  _recoverProjectState (state) {
    let currentZoom = this.editor.project.zoom;
    let currentPan = {x:this.editor.project.pan.x, y:this.editor.project.pan.y};
    this.editor.project = window.Wick.Project.deserialize(state.project);
    this.editor.project.zoom = currentZoom;
    this.editor.project.pan = currentPan;
    this.editor.setState({
      ...this.editor.state,
      project: state.project,
    });
    this.editor.refocusEditor(); // Why do we need to do this...? Why does the setState call here change the focus?
  }

  _logStacks () {
    console.log('UNDO/REDO STACKS:')
    console.log(this._undoStack.length);
    console.log(this._undoStack);
    console.log(this._redoStack.length);
    console.log(this._redoStack);
    console.log(' ');
  }
}

export default UndoRedo;
