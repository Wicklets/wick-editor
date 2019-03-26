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

var WickProject = function () {

    // Create the root object. The editor is always editing the root
    // object or its sub-objects and cannot ever leave the root object.
    this.createNewRootObject();

    // Only used by the editor. Keeps track of current object editor is editing.
    this.currentObject = this.rootObject;
    this.rootObject.currentFrame = 0;

    this.library = new AssetLibrary();

    this.name = "New Project";

    this.onionSkinning = false;
    this.smallFramesMode = false;
    
    this.width = 720;
    this.height = 480;

    this.backgroundColor = "#FFFFFF";
    this.transparent = false;

    this.pixelPerfectRendering = false;

    this.framerate = 12;

    this.uuid = random.uuid4();

    this._selection = [];

    if(window.wickVersion) this.wickVersion = window.wickVersion;

};

WickProject.prototype.createNewRootObject = function () {
    var rootObject = new WickObject();
    rootObject.isSymbol = true;
    rootObject.isRoot = true;
    rootObject.playheadPosition = 0;
    rootObject.currentLayer = 0;
    var firstLayer = new WickLayer();
    firstLayer.identifier = "Layer 1";
    rootObject.layers = [firstLayer];
    rootObject.x = 0;
    rootObject.y = 0;
    rootObject.opacity = 1.0;
    this.rootObject = rootObject;
    this.rootObject.generateParentObjectReferences();
}

WickProject.fromFile = function (file, callback) {

    var reader = new FileReader();
    reader.onload = function(e) {
        if (file.type === "text/html") {
            callback(WickProject.fromWebpage(e.target.result));
        } else if (file.type === "application/json") {
            callback(WickProject.fromJSON(e.target.result));
        }
    };
    reader.readAsText(file);

}

WickProject.fromZIP = function (file, callback) {
      JSZip.loadAsync(file).then(function (zip) {
          return zip.file("index.html").async("text");
        }).then(function (txt) {
          callback(WickProject.fromWebpage(txt));
        });
}

WickProject.fromWebpage = function (webpageString) {

    var extractedProjectJSON;

    var webpageStringLines = webpageString.split('\n');
    webpageStringLines.forEach(function (line) {
        if(line.startsWith("<script>var wickPlayer = new WickPlayer(); wickPlayer.runProject(")) {
            extractedProjectJSON = line.split("'")[1];
        }
    });

    if(!extractedProjectJSON) {
        // Oh no, something went wrong
        console.error("Bundled JSON project not found in specified HTML file (webpageString). The HTML supplied might not be a Wick project, or zach might have changed the way projects are bundled. See WickProject.Exporter.js!");
        return null;
    } else {
        // Found a bundled project's JSON, let's load it!
        return WickProject.fromJSON(extractedProjectJSON);
    }
}

WickProject.fromJSON = function (rawJSONProject, uncompressed) {

    var JSONString = uncompressed ? rawJSONProject : WickProject.Compressor.decompressProject(rawJSONProject);

    // Replace current project with project in JSON
    var projectFromJSON = JSON.parse(JSONString);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    projectFromJSON.__proto__ = WickProject.prototype;
    WickObject.addPrototypes(projectFromJSON.rootObject);

    WickProject.fixForBackwardsCompatibility(projectFromJSON);
    projectFromJSON.library.__proto__ = AssetLibrary.prototype;
    AssetLibrary.addPrototypes(projectFromJSON.library);

    // Decode scripts back to human-readble and eval()-able format
    projectFromJSON.rootObject.decodeStrings();
    projectFromJSON.library.decodeStrings();

    // Add references to wickobject's parents (optimization)
    projectFromJSON.rootObject.generateParentObjectReferences();
    projectFromJSON.regenAssetReferences();

    // Start at the first from of the root object
    projectFromJSON.currentObject = projectFromJSON.rootObject;
    projectFromJSON.rootObject.playheadPosition = 0;
    projectFromJSON.currentObject.currentLayer = 0;

    projectFromJSON.currentObject = projectFromJSON.rootObject;

    return projectFromJSON;
}

// Backwards compatibility for old Wick projects
WickProject.fixForBackwardsCompatibility = function (project) {

    var allObjectsInProject = project.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(project.rootObject);
    allObjectsInProject.forEach(function (wickObj) {
        // Tweens belong to frames now
        if(wickObj.tweens) wickObj.tweens = null;

        if(!wickObj.isSymbol) return
        wickObj.layers.forEach(function (layer) {
            if(!layer.locked) layer.locked = false;
            if(!layer.hidden) layer.hidden = false;
            layer.frames.forEach(function (frame) {
                if(!frame.tweens) frame.tweens = [];
                // Make sure tweens have rotations now
                frame.tweens.forEach(function (tween) {
                    if(!tween.rotations) tween.rotations = 0;
                });
            });
        });
    });

    // Selection is handled in the project now
    if(!project._selection){
        project._selection = [];
    }

    // Data for sounds and images is stored in the asset library now
    if(!project.library) {
        project.library = new AssetLibrary();

        allObjectsInProject.forEach(function (wickObject) {
            if(wickObject.imageData) {
                var asset = new WickAsset(wickObject.imageData, 'image', 'untitled');
                wickObject.assetUUID = project.library.addAsset(asset);
                wickObject.isImage = true;
                wickObject.imageData = null;
                wickObject.name = 'untitled';
            } else if(wickObject.audioData) {
                var asset = new WickAsset(wickObject.imageData, 'audio', 'untitled');
                var assetUUID = project.library.addAsset(asset);
            }
        })
    }

    project.library.__proto__ = AssetLibrary.prototype;
    project.library.regenAssetUUIDs();

}

WickProject.prototype.getAsJSON = function (callback, format) {

    var self = this;

    // Encode scripts/text to avoid JSON format problems
    self.rootObject.encodeStrings();
    self.library.encodeStrings();

    // Add some browser/OS/wick editor version info for debugging other ppl's projects
    self.metaInfo = getBrowserAndOSInfo();
    self.metaInfo.wickVersion = wickEditor.version;
    self.metaInfo.dateSaved = new Date().toGMTString();

    var JSONProject = JSON.stringify(self, WickProject.Exporter.JSONReplacer, format);
    
    // Decode scripts back to human-readble and eval()-able format
    self.rootObject.decodeStrings();
    self.library.decodeStrings();

    callback(JSONProject);

}

WickProject.prototype.getCopyData = function () {
    var objectJSONs = [];
    var objects = this.getSelectedObjects();
    objects.forEach(function(obj) {
        if(obj instanceof WickObject)
            obj._tempZIndex = wickEditor.project.getCurrentFrame().wickObjects.indexOf(obj);
    })
    objects.sort(function (a,b) {
        return a._tempZIndex - b._tempZIndex;
    });
    for(var i = 0; i < objects.length; i++) {
        objectJSONs.push(objects[i].getAsJSON());
    }
    var clipboardObject = {
        groupPosition: {x : 0,
                        y : 0},
        wickObjectArray: objectJSONs
    }
    return JSON.stringify(clipboardObject);
}

WickProject.prototype.getCurrentObject = function () {
    return this.currentObject;
}

WickProject.prototype.getCurrentLayer = function () {
    return this.getCurrentObject().getCurrentLayer();
}

WickProject.prototype.getCurrentFrame = function () {
    return this.getCurrentObject().getCurrentLayer().getCurrentFrame();
}

WickProject.prototype.getCurrentFrames = function () {
    return this.getCurrentObject().getCurrentFrames();
}

WickProject.prototype.getAllObjects = function () {
    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();
    return allObjectsInProject;
}

WickProject.prototype.getAllFrames = function () {
    var frames = [];

    var allObjectsInProject = this.getAllObjects();
    allObjectsInProject.forEach(function (obj) {
        frames = frames.concat(obj.getAllFrames());
    });

    return frames;
}

WickProject.prototype.getObjectByUUID = function (uuid) {
    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(this.rootObject);

    var foundObj = null;
    allObjectsInProject.forEach(function (object) {
        if(foundObj) return;
        if(object.uuid === uuid) {
            foundObj = object;
        }
    });

    return foundObj;
}

WickProject.prototype.getObject = function (name) {
    return this.getObjectByName(name);
}

WickProject.prototype.getObjectByName = function (name) {
    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(this.rootObject);

    var foundObj = null;
    allObjectsInProject.forEach(function (object) {
        if(foundObj) return;
        if(object.name === name) {
            foundObj = object;
        }
    });

    return foundObj;
}

WickProject.prototype.getFrameByUUID = function (uuid) {
    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(this.rootObject);

    var foundFrame = null;
    allObjectsInProject.forEach(function (object) {
        if(!object.isSymbol) return;
        object.layers.forEach(function (layer) {
            layer.frames.forEach(function (frame) {
                if(frame.uuid === uuid) {
                    foundFrame = frame;
                }   
            });
        })
    });

    return foundFrame;
}

WickProject.prototype.addObject = function (wickObject, zIndex, ignoreSymbolOffset, frame) {

    var frame = frame || this.getCurrentFrame();

    if(!ignoreSymbolOffset) {
        var insideSymbolOffset = this.currentObject.getAbsolutePosition();
        wickObject.x -= insideSymbolOffset.x;
        wickObject.y -= insideSymbolOffset.y;
    }

    if(!wickObject.uuid) wickObject.uuid = random.uuid4();
    
    if(zIndex === undefined || zIndex === null) {
        frame.wickObjects.push(wickObject);
    } else {
        frame.wickObjects.splice(zIndex, 0, wickObject);
    }

    this.rootObject.generateParentObjectReferences();

}

WickProject.prototype.getNextAvailableName = function (baseName) {

    var nextName = baseName;
    var number = 0;

    this.getAllObjects().forEach(function (object) {
        if(!object.name) return;
        var nameSuffix = object.name.split(baseName)[1]

        if(nameSuffix === "") {
            if(number === 0)
                number = 1;
        } else {
            var prefixNumber = parseInt(nameSuffix);
            if(!isNaN(prefixNumber) && prefixNumber > number) 
                number = prefixNumber;
        }
    });

    if(number === 0) {
        return baseName;
    } else {
        return baseName + " " + (number+1);
    }

}

WickProject.prototype.jumpToObject = function (obj) {

    var that = this;

    this.rootObject.getAllChildObjectsRecursive().forEach(function (child) {
        if(child.uuid === obj.uuid) {
            that.currentObject = child.parentObject;
        }
    });

    var currentObject = this.currentObject;
    var frameWithChild = currentObject.getFrameWithChild(obj);
    var playheadPositionWithChild = frameWithChild.playheadPosition
    currentObject.playheadPosition = playheadPositionWithChild;

}

WickProject.prototype.jumpToFrame = function (frame) {

    var that = this;

    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();
    allObjectsInProject.push(this.rootObject);
    allObjectsInProject.forEach(function (child) {
        if(!child.isSymbol) return;
        child.layers.forEach(function (layer) {
            layer.frames.forEach(function (currframe) {
                if(frame === currframe) {
                    that.currentObject = child;
                }
            })
        })
    });

    var currentObject = this.currentObject;
    var frameWithChild = frame;
    var playheadPositionWithChild = frameWithChild.playheadPosition
    currentObject.playheadPosition = playheadPositionWithChild;
}

WickProject.prototype.hasSyntaxErrors = function () {

    var projectHasSyntaxErrors = false;

    this.rootObject.getAllChildObjectsRecursive().forEach(function (child) {
        child.getAllFrames().forEach(function (frame) {
            if(frame.scriptError && frame.scriptError.type === 'syntax') {
                projectHasSyntaxErrors = true;
            }
        });

        if(child.scriptError && child.scriptError.type === 'syntax') {
            projectHasSyntaxErrors = true;
        }
    });

    return projectHasSyntaxErrors;

}

WickProject.prototype.handleWickError = function (e, objectCausedError) {

    objectCausedError = window.errorCausingObject
    if(objectCausedError.objectClonedFrom) {
        objectCausedError = objectCausedError.objectClonedFrom
    }

    if (window.wickEditor) {
        //if(!wickEditor.builtinplayer.running) return;

        console.log("Exception thrown while running script of WickObject: " + this.name);
        console.log(e);
        var lineNumber = null;
        if(e.stack) {
            e.stack.split('\n').forEach(function (line) {
                if(lineNumber) return;
                if(!line.includes("<anonymous>:")) return;

                lineNumber = parseInt(line.split("<anonymous>:")[1].split(":")[0]);
            });
        }
        if(lineNumber) lineNumber -= 12;

        //console.log(e.stack.split("\n")[1].split('<anonymous>:')[1].split(":")[0]);
        //console.log(e.stack.split("\n"))
        //if(wickEditor.builtinplayer.running) wickEditor.builtinplayer.stopRunningProject()
        
        wickEditor.builtinplayer.stopRunningProject()

        wickEditor.scriptingide.displayError(objectCausedError, {
            message: e,
            line: lineNumber,
            type: 'runtime'
        });

        objectCausedError.scriptError = {
            message: e,
            line: lineNumber,
            type: 'runtime'
        }

    } else {
        alert("An exception was thrown while running a WickObject script. See console!");
        console.log(e);
    }
}

WickProject.prototype.isObjectSelected = function (obj) {
    var selected = false;

    this._selection.forEach(function (uuid) {
        if(obj.uuid === uuid) selected = true;
    });

    return selected;
}

WickProject.prototype.isTypeSelected = function (type) {
    var self = this;
    var selected = false;

    this._selection.forEach(function (uuid) {
        var obj = self.getObjectByUUID(uuid) 
               || self.getFrameByUUID(uuid);
        if(obj instanceof type) selected = true;
    });

    return selected;
}

WickProject.prototype.getSelectedObject = function () {
    var selectedObjects = this.getSelectedObjects();
    if(selectedObjects.length !== 1) {
        return null;
    } else {
        return selectedObjects[0];
    }
}

WickProject.prototype.getSelectedObjectByType = function (type) {
    var selectedObjects = this.getSelectedObjects();
    returnObject = null;
    
    selectedObjects.forEach(function (obj) {
        if(obj instanceof type) {
            returnObject = obj;
        }
    })

    return returnObject;
}

WickProject.prototype.getSelectedObjectsByType = function (type) {
    var selectedObjects = this.getSelectedObjects();
    
    selectedObjects = selectedObjects.filter(function (obj) {
        return (obj instanceof type);
    })

    return selectedObjects;
}

WickProject.prototype.getSelectedObjects = function () {
    var self = this;

    var objs = [];
    this._selection.forEach(function (uuid) {
        var obj = self.getObjectByUUID(uuid) 
               || self.getFrameByUUID(uuid);
               //|| self.getTweenByUUID(uuid);
        if(obj) objs.push(obj);
    });

    return objs;
}

WickProject.prototype.getSelectedWickObjects = function () {
    var self = this;

    var objs = [];
    this._selection.forEach(function (uuid) {
        var obj = self.getObjectByUUID(uuid);
        if(obj) objs.push(obj);
    });

    return objs;
}

WickProject.prototype.getSelectedObjectsUUIDs = function () {
    var self = this;

    var objs = [];
    this._selection.forEach(function (uuid) {
        var obj = self.getObjectByUUID(uuid) 
               || self.getFrameByUUID(uuid);
        if(obj) objs.push(obj.uuid);
    });

    return objs;
}

WickProject.prototype.getNumSelectedObjects = function (obj) {
    return this.getSelectedObjects().length;
}

WickProject.prototype.selectObject = function (obj) {
    wickEditor.inspector.clearSpecialMode();
    if(this._selection.indexOf(obj.uuid) === -1)
        this._selection.push(obj.uuid);
}

WickProject.prototype.selectObjectByUUID = function (uuid) {
    wickEditor.inspector.clearSpecialMode();
    if(this._selection.indexOf(uuid) === -1)
        this._selection.push(uuid);
}

WickProject.prototype.clearSelection = function () {
    var thingsWereCleared = false;
    if(this._selection.length > 0)  thingsWereCleared = true;
    this._selection = [];
    return thingsWereCleared;
}

WickProject.prototype.deselectObject = function (obj) {
    wickEditor.inspector.clearSpecialMode();
    for ( var i = 0; i < this._selection.length; i++ ) {
        var uuid = this._selection[i];
        if(obj.uuid === uuid) {
            this._selection[i] = null;
        }
    }
}

WickProject.prototype.deselectObjectType = function (type) {
    var deselectionHappened = false;
    
    for ( var i = 0; i < this._selection.length; i++ ) {
        var uuid = this._selection[i];
        var obj = this.getObjectByUUID(uuid) 
               || this.getFrameByUUID(uuid);
        if(obj instanceof type) {
            this._selection[i] = null;
            deselectionHappened = true;
        }
    }

    this._selection = this._selection.filter(function (obj) {
        return obj !== null;
    });

    return deselectionHappened;
}

WickProject.prototype.loadBuiltinFunctions = function (contextObject) {

    if(contextObject.wickScript === '') return;

    var objectScope = null;
    if(contextObject instanceof WickObject) {
        objectScope = contextObject.parentObject;
    } else if (contextObject instanceof WickFrame) {
        objectScope = contextObject.parentLayer.parentWickObject;
    }

    window.project = wickPlayer.project || wickEditor.project;
    window.parentObject = contextObject.parentObject;
    window.root = project.rootObject;

    window.play           = function ()      { objectScope.play(); }
    window.stop           = function ()      { objectScope.stop(); }
    window.movePlayheadTo = function (frame) { objectScope.movePlayheadTo(frame); }
    window.gotoAndStop    = function (frame) { objectScope.gotoAndStop(frame); }
    window.gotoAndPlay    = function (frame) { objectScope.gotoAndPlay(frame); }
    window.gotoNextFrame  = function ()      { objectScope.gotoNextFrame(); }
    window.gotoPrevFrame  = function ()      { objectScope.gotoPrevFrame(); }

    window.keyIsDown      = function (keyString) { return wickPlayer.inputHandler.keyIsDown(keyString); };
    window.keyJustPressed = function (keyString) { return wickPlayer.inputHandler.keyJustPressed(keyString); }
    window.mouseX = wickPlayer.inputHandler.getMouse().x;
    window.mouseY = wickPlayer.inputHandler.getMouse().y;
    window.mouseMoveX = wickPlayer.inputHandler.getMouseDiff().x;
    window.mouseMoveY = wickPlayer.inputHandler.getMouseDiff().y;
    window.hideCursor = function () { wickPlayer.inputHandler.hideCursor(); };
    window.showCursor = function () { wickPlayer.inputHandler.showCursor(); };

    // WickObjects in same frame (scope) are accessable without using root./parent.
    if(objectScope) {
        objectScope.getAllChildObjects().forEach(function(child) {
            if(child.name) window[child.name] = child;
        });
    }
    if(objectScope) {
        objectScope.getAllActiveChildObjects().forEach(function(child) {
            if(child.name) window[child.name] = child;
        });
    }

}

var WickObjectBuiltins = [
    'load',
    'update',
    'mousePressed',
    'mouseDown',
    'mouseReleased',
    'mouseHover',
    'mouseEnter',
    "mouseLeave",
    "keyPressed",
    "keyDown",
    "keyReleased",
];

WickProject.prototype.loadScriptOfObject = function (obj) {

    if(obj.wickScript === '') return;

    if(!window.cachedWickScripts) window.cachedWickScripts = {};

    var dummyInitScript = "";
    var dummyLoaderScript = "";
    WickObjectBuiltins.forEach(function (builtinName) {
        dummyInitScript += 'function ' + builtinName + ' (){return;};\n';
        dummyLoaderScript += '\nthis.'+builtinName+"="+builtinName+";";
    });

    var scriptEventsReplaced = obj.wickScript;
    var onEventFinderRegex = /^ *on *\( *[a-zA-Z]+ *\)/gm
    var m;
    do {
        m = onEventFinderRegex.exec(scriptEventsReplaced, 'g');
        if (m) {
            eventName = m[0].split('(')[1].split(')')[0]
            scriptEventsReplaced = scriptEventsReplaced.replace(m[0], 'function ' + eventName + '()')
        }
    } while (m);

    var evalScriptTag = 
        '<script>\nwindow.cachedWickScripts["'+obj.uuid+'"] = function () {\n' + 
        dummyInitScript + 
        scriptEventsReplaced + 
        dummyLoaderScript + 
        '\n}\n<'+'/'+'script>';
    $('head').append(evalScriptTag);
}

WickProject.prototype.initScript = function (obj) {
    window.errorCausingObject = obj;

    if(!window.cachedWickScripts) window.cachedWickScripts = {};
    
    if(!obj.cachedWickScript) {
        if(obj.sourceUUID) {
            obj.cachedWickScript = window.cachedWickScripts[obj.sourceUUID];
        } else {
            obj.cachedWickScript = window.cachedWickScripts[obj.uuid];
        }
    }

    if(obj.cachedWickScript) {
        this.loadBuiltinFunctions(obj);
        try {
            obj.cachedWickScript();
            //obj.cachedWickScript.call(obj instanceof WickObject ? obj : obj.parentObject);
        } catch (e) {
            this.handleWickError(e,obj);
        }
    }
}

WickProject.prototype.runScript = function (obj, fnName, arg1, arg2, arg3) {

    window.errorCausingObject = obj;

    try {
        if(obj[fnName]) {
            this.loadBuiltinFunctions(obj);
            obj[fnName](arg1, arg2, arg3);
        }
    } catch (e) {
        this.handleWickError(e,obj);
    }

}

WickProject.prototype.regenAssetReferences = function () {

    var self = this;

    self.getAllObjects().forEach(function (obj) {
        obj.asset = self.library.getAsset(obj.assetUUID);
    });

}

WickProject.prototype.loadFonts = function (callback) {
    var self = this;
    var fontsInProject = [];
    self.getAllObjects().forEach(function (o) {
        if(o.isText && o.textData.fontFamily !== 'Arial' && fontsInProject.indexOf(o.textData.fontFamily))
            fontsInProject.push(o.textData.fontFamily);
    });
    if(fontsInProject.length === 0 && callback) {
        callback()
    } else {
        loadGoogleFonts(fontsInProject, function () {
            if(window.wickEditor) {
                wickEditor.canvas.getInteractiveCanvas().needsUpdate = true;
                wickEditor.syncInterfaces();
            }
            if(callback) {
                callback();
            }
        });
    }   
}

WickProject.prototype.prepareForPlayer = function () {
    var self = this;

    self.regenAssetReferences();

    self.rootObject.prepareForPlayer();
    if(window.WickEditor) self.loadFonts();

    self.getAllObjects().forEach(function (obj) {
        self.loadScriptOfObject(obj);
    });
    self.getAllFrames().forEach(function (obj) {
        self.loadScriptOfObject(obj);
    });
}

WickProject.prototype.tick = function () {
    var allObjectsInProject = this.rootObject.getAllChildObjectsRecursive();

    // Make sure all playhead positions are up to date 
    // (this is deferred to outside the main tick code so timeline changes happen all at once right here)
    allObjectsInProject.forEach(function (obj) {
        if(obj._newPlayheadPosition !== undefined)
            obj.playheadPosition = obj._newPlayheadPosition;
    });

    allObjectsInProject.forEach(function (obj) {
        obj._newPlayheadPosition = undefined;
    });
    allObjectsInProject.forEach(function (obj) {
        obj.getAllFrames().forEach(function (frame) {
            frame._wasActiveLastTick = frame._active;
            frame._active = frame.isActive();
        });
    });
    allObjectsInProject.forEach(function (obj) {
        obj._wasActiveLastTick = obj._active;
        obj._active = obj.isActive();
    });
    
    this.rootObject.tick();
    this.updateCamera();
    this.applyTweens();
}

WickProject.prototype.applyTweens = function () {
    this.getAllFrames().forEach(function (frame) {
        frame.applyTween();
    });
}

WickProject.prototype.updateCamera = function () {
    var camera = window.camera;
    if(!camera) return;

    camera.update();

    var camPos = camera.getPosition();
    this.rootObject.x = -camPos.x+this.width/2;
    this.rootObject.y = -camPos.y+this.height/2;
}
