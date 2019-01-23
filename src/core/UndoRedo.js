class UndoRedo {
  constructor (editor) {
    this.editor = editor;

    this._undoStack = [];
    this._redoStack = [];

    this.LOG_STACKS = false;
  }

  saveState (selection, project) {
    this._undoStack.push(this._generateProjectState(selection, project));

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

  _generateProjectState (selection, project) {
    return {
      project: project.serialize(),
      selection: JSON.parse(JSON.stringify(selection)),
    };
  }

  _recoverProjectState (state) {
    this.editor.setState({
      project: window.Wick.Project.deserialize(state.project),
      selection: JSON.parse(JSON.stringify(state.selection)),
    });
  }

  _logStacks () {
    console.log('UNDOREDO STACKS')
    console.log(this._undoStack.length);
    console.log(this._undoStack);
    console.log(this._redoStack.length);
    console.log(this._redoStack);
    console.log(' ');
  }
}

export default UndoRedo;
