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

var WickObject = function () {

    this.uuid = random.uuid4();
    this.name = undefined;
    this.x = 0;
    this.y = 0;
    this.width = undefined;
    this.height = undefined;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
    this.flipX = false;
    this.flipY = false;
    this.opacity = 1;
    this.wickScript = "";
    this.assetUUID = null;
    this.loop = false;
    this.isText = false;
    this.isImage = false;
    this.isSymbol = false;
    this.isButton = false;
    this.isGroup = false;
    this.playheadPosition = null;
    this.currentLayer = null;
    this.layers = undefined;

    this._renderDirty = false;  // Tell the renderer if this object has changed. 

};

WickObject.fromJSON = function (jsonString) {
    // Parse JSON
    var newWickObject = JSON.parse(jsonString);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    WickObject.addPrototypes(newWickObject);

    // Decode scripts back to human-readble and eval()-able format
    newWickObject.decodeStrings();

    return newWickObject;
}

WickObject.fromJSONArray = function (jsonArrayObject) {
    var newWickObjects = [];

    var wickObjectJSONArray = jsonArrayObject.wickObjectArray;
    for (var i = 0; i < wickObjectJSONArray.length; i++) {
        
        var newWickObject = WickObject.fromJSON(wickObjectJSONArray[i]);
        
        if(wickObjectJSONArray.length > 1) {
            newWickObject.x += jsonArrayObject.groupPosition.x;
            newWickObject.y += jsonArrayObject.groupPosition.y;
        }

        newWickObjects.push(newWickObject);
    }

    return newWickObjects;
}

WickObject.createPathObject = function (svg) {
    var obj = new WickObject();
    obj.isPath = true;
    obj.pathData = svg;

    return obj;
}

WickObject.createTextObject = function (text) {
    var obj = new WickObject();

    obj.isText = true;
    obj.width = 400;
    obj.textData = {
        fontFamily: 'Arial',
        fontSize: 40,
        fontStyle: 'normal',
        fontWeight: 'normal',
        lineHeight: 1.0,
        fill: '#000000',
        textAlign: 'left',
        text: text
    };

    return obj;
}

WickObject.createNewSymbol = function (name) {

    var symbol = new WickObject();

    symbol.isSymbol = true;
    symbol.playheadPosition = 0;
    symbol.currentLayer = 0;
    symbol.layers = [new WickLayer()];
    symbol.name = name;

    return symbol;

}

// Create a new symbol and add every object in wickObjects as children
WickObject.createSymbolFromWickObjects = function (wickObjects) {

    var symbol = WickObject.createNewSymbol();

    // Calculate center of all WickObjects
    var topLeft = {x:Number.MAX_SAFE_INTEGER, y:Number.MAX_SAFE_INTEGER};
    var bottomRight = {x:-Number.MAX_SAFE_INTEGER,y:-Number.MAX_SAFE_INTEGER};
    wickObjects.forEach(function (wickObj) {
        topLeft.x = Math.min(topLeft.x, wickObj.x - wickObj.width /2);
        topLeft.y = Math.min(topLeft.y, wickObj.y - wickObj.height/2);
        bottomRight.x = Math.max(bottomRight.x, wickObj.x + wickObj.width /2);
        bottomRight.y = Math.max(bottomRight.y, wickObj.y + wickObj.height/2);
    });

    var center = {
        x: topLeft.x + (bottomRight.x - topLeft.x)/2,
        y: topLeft.y + (bottomRight.y - topLeft.y)/2
    }
    symbol.x = center.x;
    symbol.y = center.y;

    var firstFrame = symbol.layers[0].frames[0];
    for(var i = 0; i < wickObjects.length; i++) {
        firstFrame.wickObjects[i] = wickObjects[i];

        firstFrame.wickObjects[i].x = wickObjects[i].x - symbol.x;
        firstFrame.wickObjects[i].y = wickObjects[i].y - symbol.y;
    }

    symbol.width  = firstFrame.wickObjects[0].width;
    symbol.height = firstFrame.wickObjects[0].height;

    return symbol;

}

WickObject.prototype.copy = function () {

    var copiedObject = new WickObject();

    copiedObject.name = this.name;
    copiedObject.x = this.x;
    copiedObject.y = this.y;
    copiedObject.width = this.width;
    copiedObject.height = this.height;
    copiedObject.scaleX = this.scaleX;
    copiedObject.scaleY = this.scaleY;
    copiedObject.rotation = this.rotation;
    copiedObject.flipX = this.flipX;
    copiedObject.flipY = this.flipY;
    copiedObject.opacity = this.opacity;
    copiedObject.uuid = random.uuid4();
    copiedObject.sourceUUID = this.uuid;
    copiedObject.assetUUID = this.assetUUID;
    copiedObject.svgX = this.svgX;
    copiedObject.svgY = this.svgY;
    copiedObject.pathData = this.pathData;
    copiedObject.isImage = this.isImage;
    copiedObject.isPath = this.isPath;
    copiedObject.isText = this.isText;
    copiedObject.isButton = this.isButton;
    copiedObject.isGroup = this.isGroup;
    copiedObject.cachedAbsolutePosition = this.getAbsolutePosition();
    copiedObject.svgStrokeWidth = this.svgStrokeWidth;

    if(this.isText)
        copiedObject.textData = JSON.parse(JSON.stringify(this.textData));

    copiedObject.wickScript = this.wickScript

    if(this.isSymbol) {
        copiedObject.isSymbol = true;

        copiedObject.playheadPosition = 0;
        copiedObject.currentLayer = 0;

        copiedObject.layers = [];
        this.layers.forEach(function (layer) {
            copiedObject.layers.push(layer.copy());
        });
    } else {
        copiedObject.isSymbol = false;
    }

    return copiedObject;

}

WickObject.prototype.getAsJSON = function () {
    var oldX = this.x;
    var oldY = this.y;

    var absPos = this.getAbsolutePosition();
    this.x = absPos.x;
    this.y = absPos.y;

    // Encode scripts to avoid JSON format problems
    this.encodeStrings();

    var JSONWickObject = JSON.stringify(this, WickProject.Exporter.JSONReplacerObject);

    // Put prototypes back on object ('class methods'), they don't get JSONified on project export.
    WickObject.addPrototypes(this);

    // Decode scripts back to human-readble and eval()-able format
    this.decodeStrings();

    this.x = oldX;
    this.y = oldY;

    return JSONWickObject;
}

WickObject.prototype.downloadAsFile = function () {

    var filename = this.name || "wickobject";

    if(this.isSymbol) {
        var blob = new Blob([this.getAsJSON()], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename+".json");
        return;
    }

    var asset = wickEditor.project.library.getAsset(this.assetUUID);

    if(asset.type === 'image') {
        var ext = asset.getData().split("/")[1].split(';')[0];
        saveAs(dataURItoBlob(asset.getData()), filename+"."+ext);
        return;
    }

    console.error("export not supported for this type of wickobject yet");

}

WickObject.addPrototypes = function (obj) {

    // Put the prototype back on this object
    obj.__proto__ = WickObject.prototype;

    if(obj.isSymbol) {
        obj.layers.forEach(function (layer) {
            layer.__proto__ = WickLayer.prototype;
            layer.frames.forEach(function(frame) {
                frame.__proto__ = WickFrame.prototype;

                if(frame.tweens) {
                    frame.tweens.forEach(function (tween) {
                        tween.__proto__ = WickTween.prototype;
                    });
                }
            });
        });

        obj.getAllChildObjects().forEach(function(currObj) {
            WickObject.addPrototypes(currObj);
        });
    }
}

/* Encodes scripts and strings to avoid JSON format problems */
WickObject.prototype.encodeStrings = function () {

    if(this.wickScript) {
        this.wickScript = WickProject.Compressor.encodeString(this.wickScript);
    }

    if(this.textData) {
        this.textData.text = WickProject.Compressor.encodeString(this.textData.text);
    }

    if(this.pathData) {
        this.pathData = WickProject.Compressor.encodeString(this.pathData);
    }

    if(this.isSymbol) {
        this.getAllFrames().forEach(function (frame) {
            frame.encodeStrings();
        });

        this.getAllChildObjects().forEach(function(child) {
            child.encodeStrings();
        });
    }

}

/* Decodes scripts and strings back to human-readble and eval()-able format */
WickObject.prototype.decodeStrings = function () {
    
    if(this.wickScript) {
        this.wickScript = WickProject.Compressor.decodeString(this.wickScript);
    }

    if(this.textData) {
        this.textData.text = WickProject.Compressor.decodeString(this.textData.text);
    }

    if(this.pathData) {
        this.pathData = WickProject.Compressor.decodeString(this.pathData);
    }

    if(this.isSymbol) {
        this.getAllFrames().forEach(function (frame) {
            frame.decodeStrings();
        });

        this.getAllChildObjects().forEach(function(child) {
            child.decodeStrings();
        });
    }

}

WickObject.prototype.generateParentObjectReferences = function() {

    var self = this;

    if(!self.isSymbol) return;

    self.layers.forEach(function (layer) {
        layer.parentWickObject = self;

        layer.frames.forEach(function (frame) {
            frame.parentLayer = layer;
            frame.parentObject = self;

            frame.wickObjects.forEach(function (wickObject) {
                wickObject.parentObject = self;
                wickObject.parentFrame = frame;

                wickObject.generateParentObjectReferences();
            });
        });
    });

}

WickObject.prototype.generateObjectNameReferences = function () {

    var that = this;

    this.getAllChildObjects().forEach(function(child) {
        that[child.name] = child;

        if(child.isSymbol) {
            child.generateObjectNameReferences();
        }
    });
    this.getAllActiveChildObjects().forEach(function(child) {
        that[child.name] = child;
    });

}

WickObject.prototype.getCurrentLayer = function() {
    return this.layers[this.currentLayer];
}

WickObject.prototype.addLayer = function (layer) {
    var currentLayerNum = 0;

    this.layers.forEach(function (layer) {
        var splitName = layer.identifier.split("Layer ")
        if(splitName && splitName.length > 1) {
            layerNum = parseInt(splitName[1]);
            if(layerNum > currentLayerNum) {
                currentLayerNum = layerNum;
            }
        }
    });

    layer.identifier = "Layer " + (currentLayerNum+1);

    this.layers.push(layer);
}

WickObject.prototype.removeLayer = function (layer) {
    var that = this;
    this.layers.forEach(function (currLayer) {
        if(layer === currLayer) {
            that.layers.splice(that.layers.indexOf(layer), 1);
        }
    });
}

WickObject.prototype.getTotalTimelineLength = function () {
    var longestLayerLength = 0;

    this.layers.forEach(function (layer) {
        var layerLength = layer.getTotalLength();
        if(layerLength > longestLayerLength) {
            longestLayerLength = layerLength;
        }
    });

    return longestLayerLength;

}

WickObject.prototype.updateFrameTween = function (relativePlayheadPosition) {
    var frame = this.parentFrame;
    var tween = frame.getTweenAtFrame(relativePlayheadPosition);

    if(tween) {
        tween.updateFromWickObjectState(this);
    }
}

WickObject.prototype.getActiveFrames = function () {
    if(!this.isSymbol) {
        return [];
    }
    
    var activeFrames = [];

    this.layers.forEach(function (layer) {
        var frame = layer.getCurrentFrame();
        if(frame)
            activeFrames.push(frame);
    });

    return activeFrames;
}

/* Return all child objects of a parent object */
WickObject.prototype.getAllChildObjects = function () {

    if (!this.isSymbol) {
        return [];
    }

    var children = [];
    for(var l = this.layers.length-1; l >= 0; l--) {
        var layer = this.layers[l];
        for(var f = 0; f < layer.frames.length; f++) {
            var frame = layer.frames[f];
            for(var o = 0; o < frame.wickObjects.length; o++) {
                children.push(frame.wickObjects[o]);
            }
        }
    }
    return children;
}

/* Return all child objects in the parent objects current frame. */
WickObject.prototype.getAllActiveChildObjects = function () {

    if (!this.isSymbol) {
        return [];
    }

    var children = [];
    for (var l = this.layers.length-1; l >= 0; l--) {
        var layer = this.layers[l];
        var frame = layer.getFrameAtPlayheadPosition(this.playheadPosition);
        if(frame) {
            frame.wickObjects.forEach(function (obj) {
                children.push(obj);
            });
        }
    }
    return children;
}

/* Return all child objects of a parent object (and their children) */
WickObject.prototype.getAllChildObjectsRecursive = function () {

    if (!this.isSymbol) {
        return [this];
    }

    var children = [this];
    this.layers.forEachBackwards(function (layer) {
        layer.frames.forEach(function (frame) {
            frame.wickObjects.forEach(function (wickObject) {
                children = children.concat(wickObject.getAllChildObjectsRecursive());
            });
        });
    });
    return children;
}

/* Return all active child objects of a parent object (and their children) */
WickObject.prototype.getAllActiveChildObjectsRecursive = function (includeParents) {

    if (!this.isSymbol) {
        return [];
    }

    var children = [];
    for (var l = this.layers.length-1; l >= 0; l--) {
        var frame = this.layers[l].getFrameAtPlayheadPosition(this.playheadPosition);
        if(frame) {
            for(var o = 0; o < frame.wickObjects.length; o++) {
                var obj = frame.wickObjects[o];
                if(includeParents || !obj.isSymbol) children.push(obj);
                children = children.concat(obj.getAllActiveChildObjectsRecursive(includeParents));
            }
        }
    }
    return children;

}

/* Return all child objects in the parent objects current layer. */
WickObject.prototype.getAllActiveLayerChildObjects = function () {

    if (!this.isSymbol) {
        return [];
    }

    var children = [];
    var layer = this.getCurrentLayer();
    var frame = layer.getFrameAtPlayheadPosition(this.playheadPosition);
    if(frame) {
        frame.wickObjects.forEach(function (obj) {
            children.push(obj);
        });
    }
    return children;
}

// Use this to get objects on other layers
WickObject.prototype.getAllInactiveSiblings = function () {

    if(!this.parentObject) {
        return [];
    }

    var that = this;
    var siblings = [];
    this.parentObject.getAllActiveChildObjects().forEach(function (child) {
        if(child !== that) {
            siblings.push(child);
        }
    });
    siblings = siblings.concat(this.parentObject.getAllInactiveSiblings());

    return siblings;

}

// Use this for onion skinning
WickObject.prototype.getNearbyObjects = function (numFramesBack, numFramesForward) {

    // Get nearby frames

    var nearbyFrames = [];

    var startPlayheadPosition = Math.max(0, this.playheadPosition - numFramesBack);
    var endPlayheadPosition = this.playheadPosition + numFramesForward;
    var tempPlayheadPosition = startPlayheadPosition;

    while(tempPlayheadPosition <= endPlayheadPosition) {
        var frame = this.getCurrentLayer().getFrameAtPlayheadPosition(tempPlayheadPosition);

        if(frame && tempPlayheadPosition !== this.playheadPosition && nearbyFrames.indexOf(frame) == -1) {
            nearbyFrames.push(frame);
        }
        
        tempPlayheadPosition ++;
    }

    // Get objects in nearby frames

    var nearbyObjects = [];

    nearbyFrames.forEach(function(frame) {
        nearbyObjects = nearbyObjects.concat(frame.wickObjects);
    });

    return nearbyObjects;

}

//
WickObject.prototype.getObjectsOnFirstFrame = function () {

    var objectsOnFirstFrame = [];

    this.layers.forEach(function (layer) {
        layer.frames[0].wickObjects.forEach(function (wickObj) {
            objectsOnFirstFrame.push(wickObj);
        });
    });

    return objectsOnFirstFrame;

}

WickObject.prototype.getParents = function () {
    if(!this.isSymbol) {
        return [];
    } else if(this.isRoot) {
        return [this];
    } else {
        return this.parentObject.getParents().concat([this]);
    }
}

/* Excludes children of children */
WickObject.prototype.getTotalNumChildren = function () {
    var count = 0;
    for(var l = 0; l < this.layers.length; l++) {
        for(var f = 0; f < this.layers[l].frames.length; f++) {
            for(var o = 0; o < this.layers[l].frames[f].wickObjects.length; o++) {
                count++;
            }
        }
    }
    return count;
}

WickObject.prototype.getAllFrames = function () {

    if(!this.isSymbol) return [];

    var allFrames = [];

    this.layers.forEach(function (layer) {
        layer.frames.forEach(function (frame) {
            allFrames.push(frame);
        });
    });

    return allFrames;
}

WickObject.prototype.getAllFramesWithSound = function () {
    return this.getAllFrames().filter(function (frame) {
        return frame.hasSound();
    });
}

WickObject.prototype.getFrameWithChild = function (child) {

    var foundFrame = null;

    this.layers.forEach(function (layer) {
        layer.frames.forEach(function (frame) {
            frame.wickObjects.forEach(function (wickObject) {
                if(wickObject.uuid === child.uuid) {
                    foundFrame = frame;
                }
            });
        });
    });

    return foundFrame;
}

WickObject.prototype.getLayerWithChild = function (child) {

    var foundLayer = null;

    this.layers.forEach(function (layer) {
        layer.frames.forEach(function (frame) {
            if(frame.wickObjects.indexOf(child) !== -1) {
                foundLayer = layer;
            }
        });
    });

    return foundLayer;
}

WickObject.prototype.remove = function () {
    this.parentObject.removeChild(this);
}

WickObject.prototype.removeChild = function (childToRemove) {

    if(!this.isSymbol) {
        return;
    }

    var that = this;
    this.getAllChildObjects().forEach(function(child) {
        if(child == childToRemove) {
            var index = child.parentFrame.wickObjects.indexOf(child);
            child.parentFrame.wickObjects.splice(index, 1);
        }
    });
}

WickObject.prototype.getZIndex = function () {
    return this.parentFrame.wickObjects.indexOf(this);
}

/* Get the absolute position of this object (the position not relative to the parents) */
WickObject.prototype.getAbsolutePosition = function () {
    if(this.isRoot) {
        return {
            x: this.x,
            y: this.y
        };
    } else if (!this.parentObject) {
        return this.cachedAbsolutePosition;
    } else {
        var parent = this.parentObject;
        var parentPosition = parent.getAbsolutePosition();
        return {
            x: this.x + parentPosition.x,
            y: this.y + parentPosition.y
        };
    }
}

/* Get the absolute position of this object taking into account the scale of the parent */
WickObject.prototype.getAbsolutePositionTransformed = function () {
    if(this.isRoot) {
        return {
            x: this.x,
            y: this.y
        };
    } else {
        var parent = this.parentObject;
        var parentPosition = parent.getAbsolutePositionTransformed();
        var parentScale = parent.getAbsoluteScale()
        var parentFlip = parent.getAbsoluteFlip();
        var rotatedPosition = {x:this.x*parentScale.x, y:this.y*parentScale.y};
        if(parentFlip.x) rotatedPosition.x *= -1;
        if(parentFlip.y) rotatedPosition.y *= -1;
        rotatedPosition = rotate_point(rotatedPosition.x, rotatedPosition.y, 0, 0, parent.getAbsoluteRotation());
        return {
            x: rotatedPosition.x + parentPosition.x,
            y: rotatedPosition.y + parentPosition.y
        };
    }
}

WickObject.prototype.getAbsoluteScale = function () {
    if(this.isRoot) {
        return {
            x: this.scaleX,
            y: this.scaleY
        };
    } else {
        var parentScale = this.parentObject.getAbsoluteScale();
        return {
            x: this.scaleX * parentScale.x,
            y: this.scaleY * parentScale.y
        };
    }
}

WickObject.prototype.getAbsoluteRotation = function () {
    if(this.isRoot) {
        return this.rotation;
    } else {
        var parentRotation = this.parentObject.getAbsoluteRotation();
        return this.rotation + parentRotation;
    }
}

WickObject.prototype.getAbsoluteOpacity = function () {
    if(this.isRoot) {
        return this.opacity;
    } else {
        var parentOpacity = this.parentObject.getAbsoluteOpacity();
        return this.opacity * parentOpacity;
    }
}

WickObject.prototype.getAbsoluteFlip = function () {
    if(this.isRoot) {
        return {
            x: this.flipX,
            y: this.flipY
        };
    } else {
        var parentFlip = this.parentObject.getAbsoluteFlip();
        return {
            x: this.flipX !== parentFlip.x,
            y: this.flipY !== parentFlip.y
        };
    }
}

WickObject.prototype.getAbsoluteTransformations = function () {
    return {
        position: this.getAbsolutePositionTransformed(),
        scale: this.getAbsoluteScale(),
        rotation: this.getAbsoluteRotation(),
        opacity: this.getAbsoluteOpacity(),
        flip: this.getAbsoluteFlip(),
    }
}

WickObject.prototype.isOnActiveLayer = function (activeLayer) {

    return this.parentFrame.parentLayer === activeLayer;

}

WickObject.prototype.play = function () {

    this._playing = true;
}

WickObject.prototype.stop = function () {

    this._playing = false;
}

WickObject.prototype.getFrameById = function (identifier) {
    var foundFrame = null;

    this.getAllFrames().forEach(function (frame) {
        if(frame.name === identifier) {
            foundFrame = frame;
        }
    });

    return foundFrame;
}

WickObject.prototype.getFrameByPlayheadPosition = function (php) {
    var foundFrame = null;

    this.getAllFrames().forEach(function (frame) {
        if(frame.playheadPosition === php) {
            foundFrame = frame;
        }
    });

    return foundFrame;
}


WickObject.prototype.gotoAndStop = function (frame) {
    this.movePlayheadTo(frame);
    this.stop();
}

WickObject.prototype.gotoAndPlay = function (frame) {
    this.movePlayheadTo(frame);
    this.play();
}

WickObject.prototype.movePlayheadTo = function (frame) {

    var oldFrame = this.getCurrentLayer().getCurrentFrame();

    // Frames are zero-indexed internally but start at one in the editor GUI, so you gotta subtract 1.
    if (typeof frame === 'number') {
        var actualFrame = frame-1;

        var endOfFrames = this.getFramesEnd(); 
        // Only navigate to an integer frame if it is nonnegative and a valid frame
        if(actualFrame < endOfFrames) {
            this._newPlayheadPosition = actualFrame;
        } else {
            throw (new Error("Failed to navigate to frame \'" + actualFrame + "\': is not a valid frame."));
        }

    } else if (typeof frame === 'string') {

        var foundFrame = this.getFrameById(frame)

        if (foundFrame) {
            if(this.playheadPosition < foundFrame.playheadPosition || this.playheadPosition >= foundFrame.playheadPosition+foundFrame.length-1) {
                this._newPlayheadPosition = foundFrame.playheadPosition;
            }
        } else {
            throw (new Error("Failed to navigate to frame. \'" + frame + "\' is not a valid frame."));
        }

    }

}

WickObject.prototype.gotoNextFrame = function () {

    var nextFramePos = this.playheadPosition+1;
    var totalLength = this.getTotalTimelineLength();
    if(nextFramePos >= totalLength) {
        nextFramePos = 0;
    }

    this._newPlayheadPosition = nextFramePos;

}

WickObject.prototype.gotoPrevFrame = function () {

    var nextFramePos = this.playheadPosition-1;
    if(nextFramePos < 0) {
        nextFramePos = this.layers[this.currentLayer].getTotalLength()-1;
    }

    this._newPlayheadPosition = nextFramePos;

}

WickObject.prototype.getFramesEnd = function() {
    endFrame = 0; 

    this.layers.forEach(function (layer) {
        layer.frames.forEach( function (frame) {
            endFrame = Math.max (frame.getFrameEnd(), endFrame); 
        })
    });

    return endFrame;

}

WickObject.prototype.hitTest = function (otherObj) {
    this.regenBounds();
    otherObj.regenBounds();

    return intersectRect(this.bounds, otherObj.bounds);
}

WickObject.prototype.regenBounds = function () {
    var self = this;
    if(this.isSymbol) {
        this.bounds = {
            left: Infinity,
            right: -Infinity,
            top: Infinity,
            bottom: -Infinity,
        }
        this.getAllActiveChildObjects().forEach(function (child) {
            child.regenBounds();
            self.bounds.left = Math.min(child.bounds.left, self.bounds.left)
            self.bounds.right = Math.max(child.bounds.right, self.bounds.right)
            self.bounds.top = Math.min(child.bounds.top, self.bounds.top)
            self.bounds.bottom = Math.max(child.bounds.bottom, self.bounds.bottom)
        });
    } else {
        var absPos = this.getAbsolutePosition();
        this.bounds = {
            left: absPos.x - this.width/2,
            right: absPos.x + this.width/2,
            top: absPos.y - this.height/2,
            bottom: absPos.y + this.height/2,
        };
    }
}

WickObject.prototype.isPointInside = function(point) {

    var objects = this.getAllActiveChildObjectsRecursive(false);
    if(!this.isSymbol) {
        objects.push(this);
    }

    var hit = false;

    objects.forEach(function(object) {
        if(hit) return;

        var transformedPosition = object.getAbsolutePositionTransformed();
        var transformedPoint = {x:point.x, y:point.y};
        var transformedScale = object.getAbsoluteScale();
        var transformedWidth = (object.width+object.svgStrokeWidth)*transformedScale.x;
        var transformedHeight = (object.height+object.svgStrokeWidth)*transformedScale.y;

        transformedPoint = rotate_point(
            transformedPoint.x, 
            transformedPoint.y, 
            transformedPosition.x, 
            transformedPosition.y,
            -object.getAbsoluteRotation()
        );

        // Bounding box check
        if ( transformedPoint.x >= transformedPosition.x - transformedWidth /2 &&
             transformedPoint.y >= transformedPosition.y - transformedHeight/2 &&
             transformedPoint.x <= transformedPosition.x + transformedWidth /2 &&
             transformedPoint.y <= transformedPosition.y + transformedHeight/2 ) {

            if(!object.alphaMask) {
                hit = true;
                return;
            }

            var relativePoint = {
                x: transformedPoint.x - transformedPosition.x + transformedWidth /2,
                y: transformedPoint.y - transformedPosition.y + transformedHeight/2
            }

            // Alpha mask check
            var objectAlphaMaskIndex =
                (Math.floor(relativePoint.x/transformedScale.x)%Math.floor(object.width+object.svgStrokeWidth)) +
                (Math.floor(relativePoint.y/transformedScale.y)*Math.floor(object.width+object.svgStrokeWidth));
            if(!object.alphaMask[(objectAlphaMaskIndex)] && 
               objectAlphaMaskIndex < object.alphaMask.length &&
               objectAlphaMaskIndex >= 0) {
                hit = true;
                return;
            }
        }
    });

    return hit;
}

WickObject.prototype.clone = function (args) {
    return wickPlayer.cloneObject(this, args);
};

WickObject.prototype.delete = function () {
    return wickPlayer.deleteObject(this);
};

WickObject.prototype.setCursor = function (cursor) {
    this.cursor = cursor;
}

WickObject.prototype.isHoveredOver = function () {
    return this.hoveredOver;
}

WickObject.prototype.prepareForPlayer = function () {
    // Set all playhead vars
    if(this.isSymbol) {
        // Set this object to it's first frame
        this.playheadPosition = 0;

        this.clones = [];

        // Start the object playing
        this._playing = true;
        this._active = false;
        this._wasActiveLastTick = false;

        this.layers.forEach(function (layer) {
            layer.hidden = false;
        })

        this.getAllFrames().forEach(function (frame) {
            //frame.prepareForPlayer();
        });
        this.getAllChildObjects().forEach(function (o) {
            o.prepareForPlayer();
        })
    }

    // Reset the mouse hovered over state flag
    this.hoveredOver = false;
}

WickObject.prototype.regenerateAssetLinkedSymbols = function () {
    if(this.assetUUID && this.isSymbol && this !== wickEditor.project.getCurrentObject()) {
        var asset = wickEditor.project.library.getAsset(this.assetUUID)
        var source = WickObject.fromJSON(asset.data);
        for(key in source) {
            if(key !== 'x' && 
               key !== 'y' && 
               key !== 'scaleX' && 
               key !== 'scaleY' && 
               key !== 'flipX' && 
               key !== 'flipY' && 
               key !== 'rotation' &&
               key !== 'opacity' &&
               key !== 'name' &&
               key !== 'uuid' && 
               key !== 'assetUUID') {
                this[key] = source[key];
            }
        }
        var self = this;
        this.getAllChildObjectsRecursive().forEach(function (child) {
            if(self !== child) child.uuid = random.uuid4();
            (child.layers||[]).forEach(function (layer) {
                layer.frames.forEach(function (frame) {
                    frame.uuid = random.uuid4();
                })
            });
        });
        this.getAllFrames().forEach(function (frame) {
            frame.uuid = random.uuid4();
        });
    }

    this.getAllChildObjects().forEach(function (o) {
        o.regenerateAssetLinkedSymbols();
    })
}

/* Generate alpha mask for per-pixel hit detection */
WickObject.prototype.generateAlphaMask = function (imageData) {

    var that = this;

    var alphaMaskSrc = imageData || that.asset.getData();
    if(!alphaMaskSrc) return;

    //window.open(alphaMaskSrc)

    ImageToCanvas(alphaMaskSrc, function (canvas,ctx) {
        //if(window.wickPlayer) window.open(canvas.toDataURL())
        var w = canvas.width;
        var h = canvas.height;
        var rgba = ctx.getImageData(0,0,w,h).data;
        that.alphaMask = [];
        for (var y = 0; y < h; y ++) {
            for (var x = 0; x < w; x ++) {
                var alphaMaskIndex = x+y*w;
                that.alphaMask[alphaMaskIndex] = rgba[alphaMaskIndex*4+3] <= 10;
            }
        }
    }, {width:Math.floor(that.width+that.svgStrokeWidth), height:Math.floor(that.height+that.svgStrokeWidth)} );

}

WickObject.prototype.getCurrentFrames = function () {
    var currentFrames = [];

    this.layers.forEach(function (layer) {
        var frame = layer.getCurrentFrame();
        if(frame) currentFrames.push(frame)
    });

    return currentFrames;
}

WickObject.prototype.tick = function () {
    var self = this;

    if(this.isSymbol) {
        this.layers.forEach(function (layer) {
            layer.frames.forEach(function (frame) {
                frame.tick();
            });
        });
    }

    if(this.isButton) {
        this.stop();
        if(this._beingClicked) {
            if(this.getFrameByPlayheadPosition(2))
                this.movePlayheadTo(3);
        } else if (this.hoveredOver) {
            if(this.getFrameByPlayheadPosition(1))
                this.movePlayheadTo(2);
        } else {
            if(this.getFrameByPlayheadPosition(0))
                this.movePlayheadTo(1);
        }
    }

    if(this.isSymbol) {
        if(true) {
            if(this._wasClicked) {
                (wickPlayer || wickEditor).project.runScript(this, 'mousePressed');
                this._wasClicked = false;
            }

            if(this._beingClicked) {
                (wickPlayer || wickEditor).project.runScript(this, 'mouseDown');
                this._wasClicked = false;
            }

            if(this._wasClickedOff) {
                (wickPlayer || wickEditor).project.runScript(this, 'mouseReleased');
                this._wasClickedOff = false;
            }

            if(this.isHoveredOver()) {
                (wickPlayer || wickEditor).project.runScript(this, 'mouseHover');
            }

            if(this._wasHoveredOver) {
                (wickPlayer || wickEditor).project.runScript(this, 'mouseEnter');
                this._wasHoveredOver = false;
            }

            if(this._mouseJustLeft) {
                (wickPlayer || wickEditor).project.runScript(this, 'mouseLeave');
                this._mouseJustLeft = false;
            }

            wickPlayer.inputHandler.getAllKeysJustReleased().forEach(function (key) {
                (wickPlayer || wickEditor).project.runScript(self, 'keyReleased', key);
            });

            wickPlayer.inputHandler.getAllKeysJustPressed().forEach(function (key) {
                (wickPlayer || wickEditor).project.runScript(self, 'keyPressed', key);
            });

            wickPlayer.inputHandler.getAllKeysDown().forEach(function (key) {
                (wickPlayer || wickEditor).project.runScript(self, 'keyDown', key);
            });

            // Inactive -> Inactive
            if (!this._wasActiveLastTick && !this._active) {
                
            }
            // Inactive -> Active
            else if (!this._wasActiveLastTick && this._active) {
                (wickPlayer || wickEditor).project.initScript(this);

                (wickPlayer || wickEditor).project.runScript(this, 'load');
                (wickPlayer || wickEditor).project.runScript(this, 'update');

                // Force playhead update on first tick to fix:
                // https://github.com/zrispo/wick-editor/issues/810
                if(this._newPlayheadPosition) {
                    this.playheadPosition = this._newPlayheadPosition;
                    this._newPlayheadPosition = undefined;
                }
            }
            // Active -> Active
            else if (this._wasActiveLastTick && this._active) {
                (wickPlayer || wickEditor).project.runScript(this, 'update');
            }
            // Active -> Inactive
            else if (this._wasActiveLastTick && !this._active) {
                if(!this.parentFrame.alwaysSaveState) {
                    wickPlayer.resetStateOfObject(this);
                }
            }
        }

        if(this.isSymbol) {
            if(this._active) {
                this.advanceTimeline();
            }
        
            this.currentFrameNumber = this.playheadPosition+1;
            var self = this;
            this.getActiveFrames().forEach(function (frame) {
                self.currentFrameName = frame.name;
            });
        }
    }

}

WickObject.prototype.advanceTimeline = function () {
    if(this._playing && this.isSymbol && this._newPlayheadPosition === undefined) {
        this._newPlayheadPosition = this.playheadPosition+1;
        if(this._newPlayheadPosition >= this.getTotalTimelineLength()) {
            this._newPlayheadPosition = 0;
        }
    }
}

WickObject.prototype.isActive = function () {
    if(this.isRoot) return true;

    return this.parentFrame._active;
}

WickObject.prototype.setText = function (text) {
    this.textData.text = String(text); // Convert to a string, just in case.
    this._renderDirty = true;  
}

WickObject.prototype.pointTo = function ( x2, y2 ) {
    var dx = this.x - x2,
        dy = this.y - y2;
    
    this.rotation = Math.atan2(dy,dx) * 180 / Math.PI - 90;
};

WickObject.prototype.moveUp = function ( d ) {
    this.y -= d === undefined ? 1 : d;
}

WickObject.prototype.moveDown = function ( d ) {
    this.y += d === undefined ? 1 : d;
}

WickObject.prototype.moveLeft = function ( d ) {
    this.x -= d === undefined ? 1 : d;
}

WickObject.prototype.moveRight = function ( d ) {
    this.x += d === undefined ? 1 : d;
}

WickObject.prototype.getSourceInside = function () {
    if(this.isRoot) {
        return null;
    } else if(this.assetUUID && this.isSymbol) {
        return this;
    } else {
        return this.parentObject.getSourceInside();
    }
}
