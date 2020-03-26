/*
 * Copyright 2020 WICKLETS LLC
 *
 * This file is part of Wick Engine.
 *
 * Wick Engine is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Engine is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Engine.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Utility class for bundling Wick projects inside ZIP files.
 */
Wick.ZIPExport = class {
    static bundleProject (project, done) {
        this._downloadDependenciesFiles(items => {
            window.Wick.WickFile.toWickFile(project, wickFile => {
                this._bundleFilesIntoZip(wickFile, items, done);
            });
        });
    }

    static _downloadDependenciesFiles (done) {
      var list = [];
      var urls = [
          "index.html",
          "preloadjs.min.js",
          "wickengine.js",
      ];
      var results = [];

      urls.forEach(function(url, i) {
          list.push(
              fetch(Wick.resourcepath + url).then(function(res){
                  results[i] = {
                      data: res.blob(),
                      name: url,
                  }
              })
          );
      });

      Promise
          .all(list)
          .then(function() {
              done(results);
          });
    }

    static _bundleFilesIntoZip (wickFile, dependenciesFiles, done) {
        var zip = new JSZip();
        dependenciesFiles.forEach(file => {
            zip.file(file.name, file.data);
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
