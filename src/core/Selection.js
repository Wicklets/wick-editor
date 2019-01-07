class Selection {
  constructor () {
    this._canvasUUIDs = [];
    this._timelineUUIDs = [];

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
    return 'multimixed';
  }

  get canvasUUIDs () {
    return this._canvasUUIDs;
  }

  get timelineUUIDs () {
    return this._timelineUUIDs;
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

  set canvasUUIDs (uuids) {
    this._canvasUUIDs = uuids;
    this._timelineUUIDs = [];
  }

  set timelineUUIDs (uuids) {
    this._canvasUUIDs = [];
    this._timelineUUIDs = uuids;
  }
}

export default Selection;
