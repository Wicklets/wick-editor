class Selection {
  constructor (editor) {
    this._selectedObjects = [];

    this.editor = editor;

    this.attributes = {
      name: '',
      filename: '',
      src: '',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      scaleW: 0,
      scaleH: 0,
      rotation: 0,
      opacity: 0,
      strokeWidth: 0,
      fillColor: '#000000',
      strokeColor: '#000000',
    }
  }

  get type () {
    if(this.selectedObjects.length > 0) {
      if(this.selectedCanvasObjects.length > 0) {
        return this.canvasObjectType;
      } else if (this.selectedTimelineObjects.length > 0) {
        return this.timelineObjectType;
      } else if (this.selectedAssets.length > 0) {
        return this.assetObjectType;
      }
    }
    return null;
  }

  get canvasObjectType () {
    // Single object type
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
      // Multi Object Type
      if (this.selectedPaths.length === 0 && this.selectedClips.length > 0) {
        return 'multiclip'
      } else if (this.selectedClips.length === 0 && this.selectedPaths.length > 0) {
        return 'multipath';
      } else {
        return 'multicanvasmixed';
      }
    }

    return null;
  }

  get timelineObjectType () {
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

    return null;
  }

  get assetObjectType () {
    return 'asset';
  }

  get possibleActions () {
    return [
      [
        {
          action: () => this.editor.openModal("ConvertToSymbol"),
          color: "blue",
          tooltip: "Convert to Symbol",
          icon: undefined,
          id: "convert-to-symbol-action",
        }
      ],
      [
        {
          name: "Delete",
          action: () => this.deleteSelectedObjects(),
          color: "sky",
          tooltip: "Delete",
          icon: undefined,
          id: "action-button-delete",
        },
      ]
    ];
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

  selectObjects (objects) {
    this._selectedObjects = objects;
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

  focusObject (object) {
    this.editor.state.selection.selectObjects([]);
    this.editor.state.project.focus = this.editor.state.project.root._childByUUID(object.uuid);
    this.editor.updateEditorState({
      selection: this.editor.state.selection,
      project: this.editor.state.project
    });
  }

  focusSelectedObject () {
    this.focusObject(this.selectedClips[0]);
  }

  focusParentObject () {
    this.focusObject(this.editor.state.project.focus._parentByInstanceOf(window.Wick.Clip));
  }

  isObjectSelected (object) {
    return this._selectedObjects.find(seekObject => {
      return object.uuid === seekObject.uuid;
    }) !== undefined;
  }

  serialize () {
    return {
      objects: this._selectedObjects.map(obj => {
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
      }),
      attributes: Object.assign({}, this.attributes),
    };
  }

  deserialize (data) {
    this.attributes = Object.assign({}, data.attributes);

    var paths = window.paper.project.layers.map(layer => {
      return layer.children;
    }).flat();

    this._selectedObjects = data.objects.map(objData => {
      if(objData.type === 'path') {
        return paths.find(path => {
          return path.name === objData.name;
        })
      } else if (objData.type === 'wickobject') {
        return this.editor.state.project._childByUUID(objData.uuid);
      }
    });
    return this;
  }
}

export default Selection;
