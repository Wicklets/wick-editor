class ZIPExport {
  static bundleStandaloneProject (project, done) {
    this._downloadDependenciesFiles(items => {
      window.Wick.WickFile.toWickFile(project, wickFile => {
        this._bundleFilesIntoZip(wickFile, items, done);
      });
    });
  }

  static _downloadDependenciesFiles (done) {
    let createjs = window.createjs;

    var queue = new createjs.LoadQueue();
    queue.on("complete", () => {
      done(queue.getItems());
    }, this);
    queue.on("progress", event => {
      // TODO use this to handle progress bar ...
    }, this);
    queue.on("error", event => {
      console.error("ZIPExport _downloadDependenciesFiles error:");
      console.error(event);
    });
    queue.loadManifest([
        {id: "index.html", src: "standalone/index.html", type:createjs.Types.BINARY},
        {id: "loadproject.js", src: "standalone/loadproject.js", type:createjs.Types.BINARY},
        {id: "preloadjs.min.js", src: "standalone/preloadjs.min.js", type:createjs.Types.BINARY},
        {id: "preloader-animation.css", src: "standalone/preloader-animation.css", type:createjs.Types.BINARY},
        {id: "wickengine.js", src: "corelibs/wick-engine/wickengine.js", type:createjs.Types.BINARY},
    ]);
  }

  static _bundleFilesIntoZip (wickFile, dependenciesFiles, done) {
    let JSZip = window.JSZip;

    var zip = new JSZip();
    dependenciesFiles.forEach(file => {
      var blob = new Blob([new Uint8Array(file.result)]);
      zip.file(file.item.id, blob);
    });
    zip.file('project.wick', wickFile);

    zip.generateAsync({
        type:"blob",
        compression: "DEFLATE",
        compressionOptions: {
            level: 9
        },
    }).then(done);
  }
}

export default ZIPExport;
