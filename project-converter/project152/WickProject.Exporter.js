/* Wick - (c) 2017 Zach Rispoli, Luca Damasco, and Josh Rispoli */

/*  This file is part of Wick. 
    
    Wick is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Wick is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Wick.  If not, see <http://www.gnu.org/licenses/>. */
    
WickProject.Exporter = (function () {

    var projectExporter = { };

    projectExporter.generatePlayer = function () {

        if(window.cachedPlayer) return window.cachedPlayer;
        
        var fileOut = "";

        // Add the player webpage (need to download the empty player)
        var emptyPlayerPath = "src/player/emptyplayer.htm";
        fileOut += FileDownloader.downloadFile(emptyPlayerPath) + "\n";

        // All libs needed by the player. 
        var requiredLibFiles = [
            "lib/pixi.4.5.6.min.js",
            "lib/webfont.js",
            //"https://cdnjs.cloudflare.com/ajax/libs/stats.js/r16/Stats.min.js",
            "lib/lz-string.min.js",
            "lib/polyfills.js",
            "lib/keyCharToCode.js",
            "lib/fpscounter.js",
            "lib/base64-arraybuffer.js",
            "lib/canvasutils.js",
            "lib/random.js",
            "lib/SAT.js",
            "lib/jquery.min.js",
            "lib/Tween.js",
            "lib/lerp.js",
            "lib/bowser.js",
            "lib/howler.min.js",
            "lib/URLParameterUtils.js",
            "lib/stats.min.js",
            "lib/localstoragewrapper.js",
            "src/project/WickTween.js",
            "src/project/WickFrame.js",
            "src/project/WickLayer.js",
            "src/project/WickObject.js",
            "src/project/WickAsset.js",
            "src/project/WickProject.js",
            "src/project/WickCamera.js",
            "src/project/WickProject.AssetLibrary.js",
            "src/project/WickProject.Compressor.js",
            "src/player/WickPlayer.PixiRenderer.js",
            "src/player/WickPlayer.HowlerAudioPlayer.js",
            "src/player/WickPlayer.InputHandler.js",
            "src/player/WickPlayer.js",
        ];

        var totalSize = 0;
        requiredLibFiles.forEach(function (filename) {
            var script = FileDownloader.downloadFile(filename);
            //console.log(script.length + " used for " + filename);

            //var scriptCompressed = LZString.compressToBase64(script)
            //console.log(scriptCompressed.length + " compressed: " + filename);

            totalSize += script.length;
            fileOut += "<script>" + script + "</script>\n";
        });
        //console.log(totalSize + " total");

        window.cachedPlayer = fileOut;
        return fileOut;

    }

    projectExporter.exportPlayer = function () {
        var emptyplayerString = projectExporter.generatePlayer();
        var blob = new Blob([emptyplayerString], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "player.html")
    }

    projectExporter.bundleProjectToHTML = function (wickProject, callback) {

        var fileOut = projectExporter.generatePlayer();

        // Bundle the JSON project
        wickProject.getAsJSON(function (JSONProject) {

            wickProject.library.getAllAssets('script').forEach(function (asset) {
                fileOut += '<script>' + asset.getData() + '</script>';
            });

            fileOut += "<script>var wickPlayer = new WickPlayer(); wickPlayer.runProject('" + JSONProject + "', document.getElementById('playerCanvasContainer'));</script>" + "\n";
            callback(fileOut);
        });

    }

    projectExporter.exportProject = function (wickProject, args) {

        if(args && args.wick) {
            wickProject.getAsJSON(function(JSONProject) {
                var byteArray = LZString.compressToUint8Array(JSONProject);
                
                var blob1 = new Blob([byteArray], {type: "application/octet-stream"});

                saveAs(blob1, wickProject.name+'-'+timeStamp()+".wick");
            });
            return;
        }

        if(args && args.json) {
            wickProject.getAsJSON(function(JSONProject) {
                var blob = new Blob([JSONProject], {type: "text/plain;charset=utf-8"});
                saveAs(blob, wickProject.name+'-'+timeStamp()+'.json');
            }, '\t');
            return;
        }

        projectExporter.bundleProjectToHTML(wickProject, function(fileOut) {
            var filename = wickProject.name || "project";
            if(args && args.zipped) {
                var zip = new JSZip();
                zip.file("index.html", fileOut);
                zip.generateAsync({type:"blob"}).then(function(content) {
                    saveAs(content, filename+'-'+timeStamp()+".zip");
                });
            } else {
                if(args && args.asNewWindow) {
                    var x=window.open('','','width='+wickProject.width+', height='+wickProject.height);
                    x.document.open().write(fileOut);
                } else {
                    var blob = new Blob([fileOut], {type: "text/plain;charset=utf-8"});
                    saveAs(blob, filename+'-'+timeStamp()+".html");
                }
            }
        });

    }

    projectExporter.autosaveProject = function (wickProject, args) {
        wickProject.getAsJSON(function (projectJSON) {
            console.log("Project size: " + projectJSON.length)
            idbKeyval.set('AutosavedWickProject', projectJSON)
              .then(() => {
                wickEditor.alertbox.showProjectSavedMessage();
                wickProject.unsaved = false;
                wickEditor.syncInterfaces();
              })
              .catch(err => console.log('idbKeyval failed to save. ', err));
        });
    }

    projectExporter.getAutosavedProject = function (callback) {
        idbKeyval.get('AutosavedWickProject').then(val => {
            if(!val) {
                callback(new WickProject());
            } else {
                if(localStorage.alwaysLoadAutosavedProject === 'true' || window.confirm("There is an autosaved project. Would you like to recover it?")) {
                    var project = WickProject.fromJSON(val);
                    callback(project);
                    return;
                } else {
                    callback(new WickProject());
                    return;
                }
            }
        });
    }

    var dontJSONVars = [
        "thumbnail",
        "clones",
        "currentObject",
        "parentObject",
        "causedAnException",
        "parentFrame",
        "alphaMask",
        "cachedImageData",
        "parentWickObject",
        "parentLayer",
        "asset",
        "paper",
        "unsaved",
        "_renderDirty",
        "_selection",
        "smallFramesMode",
        "_soundDataForPreview",
        "_wasClicked",
        "_wasClickedOff",
        "_wasHoveredOver",
        "_beingClicked",
        "_pixiTextureCached",
        "_hitBox",
        "sourceUUID",
        "_renderAsBGObject",
        "howl",
        "tweenClipboardData",
    ];

    projectExporter.JSONReplacer = function(key, value) {
        if (dontJSONVars.indexOf(key) !== -1) {
            return undefined;
        } else {
            return value;
        }
    }

    projectExporter.JSONReplacerObject = function (key, value) {
        if (key === "uuid" || dontJSONVars.indexOf(key) !== -1) {
            return undefined;
        } else {
            return value;
        }
    }

    return projectExporter;

})();
