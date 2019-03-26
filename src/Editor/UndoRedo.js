class UndoRedo {
  constructor (editor) {
    this.editor = editor;

    this._undoStack = [];
    this._redoStack = [];

    this.LOG_STACKS = false;
  }

  saveState () {
    let state = this.generateProjectState();
    let lastState = this._undoStack[this._undoStack.length-1];
    if(!lastState) lastState = '';

    if(JSON.stringify(state.project) !== JSON.stringify(lastState.project) ||
       JSON.stringify(state.focus) !== JSON.stringify(lastState.focus)) {
      this._undoStack.push(state);
      this._redoStack = [];
    }

    if(this.LOG_STACKS) this._logStacks();
  }

  undo () {
    if(this._undoStack.length <= 1) return false;

    let currentState = this._undoStack.pop();
    this._redoStack.push(currentState);

    let oldState = this._undoStack[this._undoStack.length-1];
    this.recoverProjectState(oldState);

    if(this.LOG_STACKS) this._logStacks();

    return true;
  }

  redo () {
    if(this._redoStack.length === 0) return false;

    let recoveredState = this._redoStack.pop();
    this._undoStack.push(recoveredState);

    this.recoverProjectState(recoveredState);

    if(this.LOG_STACKS) this._logStacks();

    return true;
  }

  clearHistory () {
    this._undoStack = [];
    this._redoStack = [];
  }

  generateProjectState () {
    return {
      project: this.editor.project.serialize({shallow:true}),
      focus: this.editor.project.focus.serialize(),
    };
  }

  recoverProjectState (state) {
    let currentZoom = this.editor.project.zoom;
    let currentPan = {x:this.editor.project.pan.x, y:this.editor.project.pan.y};
    //this.editor.project = window.Wick.Project.deserialize(state.project);
    window.Wick.Project._deserialize(state.project, this.editor.project);
    window.Wick.Clip._deserialize(state.focus, this.editor.project.getChildByUUID(state.focus.uuid));
    this.editor.project.root._onscreenLastTick = false;
    this.editor.project.root._onscreen = false;
    this.editor.project.zoom = currentZoom;
    this.editor.project.pan = currentPan;
    this.editor.projectDidChange(true);
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
