class Selection {
  constructor (editor) {
    this._selectedObjects = [];

    this.editor = editor;

    this.name = '';
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.scaleW = 0;
    this.scaleH = 0;
    this.rotation = 0;
    this.opacity = 0;
    this.strokeWidth = 0;
    this.fillColor = '#000000';
    this.strokeColor = '#000000';
  }

  get type () {
    if(this.selectedObjects.length > 0) {
      if(this.selectedCanvasObjects.length > 0) {
        if(this.selectedCanvasObjects.length === 1) {
          if(this.selectedPaths.length === 1) {
            return 'path';
          } else if(this.selectedClips.length === 1) {
            if(this.selectedClips[0] instanceof window.Wick.Button) {
              return 'button'
            } else if(this.selectedClips[0] instanceof window.Wick.Clip) {
              return 'clip';
            }
          }
        } else {
          return 'multicanvasmixed';
        }
      } else if (this.selectedTimelineObjects.length > 0) {
        if(this.selectedFrames.length > 0 && this.selectedTweens.length > 0) {
          return 'multitimeline';
        } else if(this.selectedFrames.length > 1) {
          return 'multiframe';
        } else if(this.selectedFrames.length > 0) {
          return 'frame';
        } else if(this.selectedTweens.length > 1) {
          return 'mulittween';
        } else if(this.selectedTweens.length > 0) {
          return 'tween';
        }
      } else if (this.selectedAssets.length > 0) {
        return 'asset';
      }
    }
    return null;
  }

  get possibleActions () {
    return [
      [
        {
          action: () => this.editor.openModal("ConvertToSymbol"),
          color: "blue",
          tooltip: "Convert to Symbol",
          icon: undefined,
          id: "convert-to-symbol-action"
        },
        {
          name: "Convert to Symbol 2",
          action: () => this.editor.openModal("ConvertToSymbol"),
          color: "blue",
          tooltip: "Symbol Conversion",
          icon: "pan",
          id: "convert-to-symbol-action-2",
        }
      ],
      [
        {
          name: "Convert to Symbol",
          action: () => this.editor.openModal("ConvertToSymbol"),
          color: "sky",
          tooltip: "Symbua",
          icon: undefined,
          id: "convert-to-symbol-action-row2"
        },
        {
          name: "Delete",
          action: () => this.deleteSelectedObjects(),
          color: "sky",
          tooltip: "Delete",
          icon: undefined,
          id: "convert-to-symbol-action-row2"
        },
      ]
    ];
  }

  selectObjects (objects) {
    this._selectedObjects = objects;
  }

  get selectedObjects () {
    return this._selectedObjects;
  }

  get selectedCanvasObjects () {
    return this.selectedClips.concat(this.selectedPaths);
  }

  get selectedPaths () {
    return this._selectedObjects.filter(object => {
      return object instanceof window.paper.Path
          || object instanceof window.paper.CompoundPath;
    });
  }

  get selectedClips () {
    return this._selectedObjects.filter(object => {
      return object instanceof window.paper.Group;
    }).map(obj => {
      return this.editor.state.project._childByUUID(obj.data.wickUUID);
    });
  }

  get selectedTimelineObjects () {
    return this.selectedFrames.concat(this.selectedTweens);
  }

  get selectedFrames () {
    return this._selectedObjects.filter(object => {
      return object instanceof window.Wick.Frame;
    });
  }

  get selectedTweens () {
    return this._selectedObjects.filter(object => {
      return object instanceof window.Wick.Tween;
    });
  }

  get selectedAssets () {
    return this._selectedObjects.filter(object => {
      return object instanceof window.Wick.Asset;
    });
  }

  deleteSelectedObjects () {
    if(this.selectedCanvasObjects.length > 0) {
      this.deleteCanvasObjects();
    } else if (this.selectedTimelineObjects.length > 0) {
      this.deleteTimelineObjects();
    }
  }

  deleteCanvasObjects () {
    this.selectObjects([]);
    window.paper.drawingTools.cursor.deleteSelectedItems(); // This updates the editor state for us.
  }

  deleteTimelineObjects () {
    this.selectedFrames.forEach(f => {
      let frame = this.editor.state.project._childByUUID(f.uuid);
      frame.parent.removeFrame(frame);
    });

    this.selectObjects([]);

    this.editor.updateEditorState({
      project: this.editor.state.project
    });
  }

  serialize () {
    return this._selectedObjects.map(obj => {
      if(obj instanceof window.paper.Path || obj instanceof window.paper.CompoundPath) {
        return {
          type: 'path',
          name: obj.name,
        }
      } else {
        return {
          type: 'wickobject',
          uuid: obj.uuid,
        }
      }
    });
  }

  deserialize (data) {
    this._selectedObjects = data.map(objData => {
      if(objData.type === 'path') {
        return null;
      } else if (objData.type === 'wickobject') {
        return this.editor.state.project._childByUUID(objData.uuid);
      }
    });
    return this;
  }
}

export default Selection;
