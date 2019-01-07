class Selection {
  constructor () {
    this._uuids = [];

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

  get content () {
    return 'multimixed';
  }

  set objects (objects) {
    this.uuids = objects.map(obj => {
      return obj.uuid;
    });
  }

  set uuids (uuids) {
    this._uuids = uuids;
  }

  get actions () {
    return [
      {
        name: "Convert to Symbol",
        fn: () => this.openModal("ConvertToSymbol"),
        color: "blue",
        tooltip: "Convert to Symbol",
        icon: undefined,
      }
    ];
  }
}

export default Selection;
