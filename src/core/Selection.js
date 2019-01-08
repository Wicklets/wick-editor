class Selection {
  constructor () {
    this._canvasObjects = [];
    this._timelineObjects = [];
    this._assetLibraryObjects = [];

    this.project = null;

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
    if(this._canvasObjects.length > 0) {
      return this._canvasSelectionType;
    } else if (this._timelineObjects.length > 0) {
      return this._timelineSelectionType;
    } else if (this._assetLibraryObjects.length > 0) {
      return this._assetLibrarySelectionType;
    }
    return null;
  }

  get _canvasSelectionType () {
    let self = this;
    let types = this._canvasObjects.map(obj => {
      if(obj instanceof window.paper.Path) {
        return 'Path';
      } else {
        console.log(self.project)
      }
    });
    console.log(types);
    return 'multipath';
  }

  get _timelineSelectionType () {
    var types = this._timelineObjects.map(object => {
      return object.classname;
    });
    if(types.length === 1) {
      return types[0];
    } else {
      if(this._allSameType(types, 'Frame')) {
        return 'multiframe';
      } else if(this._allSameType(types, 'Tween')) {
        return 'multitween';
      } else {
        return 'multimixed';
      }
    }
  }

  get _assetLibrarySelectionType () {
    if(this._assetLibraryObjects[0].classname === 'ButtonAsset') {
      return 'buttonasset';
    } else if(this._assetLibraryObjects[0].classname === 'ClipAsset') {
      return 'clipasset';
    } else if(this._assetLibraryObjects[0].classname === 'ImageAsset') {
      return 'imageasset';
    } else if(this._assetLibraryObjects[0].classname === 'SoundAsset') {
      return 'soundasset';
    }
  }

  _allSameType (types, type) {
    let allSameType = true;
    types.forEach(seekType => {
      if(seekType !== type) {
        allSameType = false;
      }
    })
    return allSameType;
  }

  get possibleActions () {
    return [
      [
        {
          name: "Convert to Symbol",
          fn: () => this.openModal("ConvertToSymbol"),
          color: "blue",
          tooltip: "Convert to Symbol",
          icon: undefined,
        }
      ]
    ];
  }

  set canvasObjects (objects) {
    this._canvasObjects = objects;
  }

  set timelineObjects (objects) {
    this._timelineObjects = objects;
  }

  set assetLibraryObjects (objects) {
    this._assetLibraryObjects = objects;
  }

  get canvasObjects () {
    return this._canvasObjects;
  }

  get timelineObjects () {
    return this._timelineObjects;
  }

  get assetLibraryObjects () {
    return this._assetLibraryObjects;
  }
}

export default Selection;
