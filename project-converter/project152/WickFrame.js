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

var WickFrame = function () {
    // Identifier so we can do e.g. movePlayheadTo("menu") 
    this.name = "New Frame";

    // Store all objects in frame. 
    this.wickObjects = [];

    this.tweens = [];

    // All path data of the frame (Stored as SVG)
    this.pathData = null;

    // Where this frame exists on the timeline
    this.playheadPosition = null;

    // Frame length for long frames
    this.length = 1;

    // Should the frame reset on being entered?
    this.alwaysSaveState = false;

    // Generate unique id
    this.uuid = random.uuid4();

    // The layer that this frame belongs to
    this.parentLayer = null;

    // Set script to default
    this.wickScript = "";

    this.audioAssetUUID = null;
};
    
WickFrame.prototype.tick = function () {
    var self = this;
    
    // Inactive -> Inactive
    // Do nothing, frame is still inactive
    if (!this._wasActiveLastTick && !this._active) {

    }
    // Inactive -> Active
    // Frame just became active! It's fresh!
    else if (!this._wasActiveLastTick && this._active) {
        if(this.hasScript()) {
            (wickPlayer || wickEditor).project.initScript(this);
            
            (wickPlayer || wickEditor).project.runScript(this, 'load');
            (wickPlayer || wickEditor).project.runScript(this, 'update');
        }

        if(this.hasSound()) {
            this._wantsToPlaySound = true;
        }
    }
    // Active -> Active
    // Frame is still active!
    else if (this._wasActiveLastTick && this._active) {
        if(this.hasScript()) {
            (wickPlayer || wickEditor).project.runScript(this, 'update');
        }
    }    
    // Active -> Inactive
    // Frame just stopped being active. Clean up!
    else if (this._wasActiveLastTick && !this._active) {
        if(this.hasSound()) {
            this._wantsToStopSound = true;
        }
    }

    if(this.hasScript()) {
        if(this._wasClicked) {
            (wickPlayer || wickEditor).project.runScript(this, 'mousePressed');
            this._wasClicked = false;
        }

        if(this._beingClicked) {
            (wickPlayer || wickEditor).project.runScript(this, 'mouseDown');
        }

        if(this._wasHoveredOver) {
            (wickPlayer || wickEditor).project.runScript(this, 'mouseHover');
            this._wasHoveredOver = false;
        }

        if(this._mouseJustLeft) {
            (wickPlayer || wickEditor).project.runScript(this, 'mouseLeave');
            this._mouseJustLeft = false;
        }

        if(this._wasClickedOff) {
            (wickPlayer || wickEditor).project.runScript(this, 'mouseReleased');
            this._wasClickedOff = false;
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
    }

    this.wickObjects.forEach(function (wickObject) {
        wickObject.tick();
    });
}

WickFrame.prototype.isActive = function () {
    var parent = this.parentLayer.parentWickObject;

    //if(parent.isRoot) console.log(parent.playheadPosition)

    /*console.log("---")
    console.log("ph "+(parent.playheadPosition))
    console.log("s  "+(this.playheadPosition))
    console.log("e  "+(this.playheadPosition+this.length))
    console.log("---")*/

    return parent.playheadPosition >= this.playheadPosition
        && parent.playheadPosition < this.playheadPosition+this.length
        && parent.isActive();
}

WickFrame.prototype.hasScript = function () {
    return this.wickScript !== "";
}

// Extend our frame to encompass more frames. 
WickFrame.prototype.extend = function(length) {
    this.length += length; 
}

// Reduce the number of frames this WickFrame Occupies. 
WickFrame.prototype.shrink = function(length) {
    // Never "shrink" by a negative amount. 
    if (length <= 0) {
        return;
    }

    originalLength = this.length; 
    this.length -= length; 

    // determine and return the actual change in frames. 
    if (this.length <= 0) {
        this.length = 1;
        return originalLength - 1;
    } else {
        return length; 
    }
}

WickFrame.prototype.copy = function () {

    var copiedFrame = new WickFrame();

    copiedFrame.name = this.name;
    copiedFrame.playheadPosition = this.playheadPosition;
    copiedFrame.length = this.length;
    copiedFrame.wickScript = this.wickScript;
    copiedFrame.uuid = random.uuid4();
    copiedFrame.sourceUUID = this.uuid;

    this.wickObjects.forEach(function (wickObject) {
        copiedFrame.wickObjects.push(wickObject.copy());
    })

    this.tweens.forEach(function (tween) {
        copiedFrame.tweens.push(tween.copy());
    })

    return copiedFrame;

}

WickFrame.prototype.remove = function () {
    this.parentLayer.removeFrame(this);
}

WickFrame.prototype.getFramesDistance = function (frame) {
    var A = this;
    var B = frame;

    if(A._beingMoved || B._beingMoved) return false;

    var AStart = A.playheadPosition;
    var AEnd = A.playheadPosition + A.length;

    var BStart = B.playheadPosition;
    var BEnd = B.playheadPosition + B.length;

    var distA = BStart-AEnd;
    var distB = BEnd-AStart;

    return {
        distA: distA,
        distB: distB
    };
}

WickFrame.prototype.touchesFrame = function (frame) {
    var framesDist = this.getFramesDistance(frame);
    return framesDist.distA < 0 && framesDist.distB > 0;
}

WickFrame.prototype.encodeStrings = function () {

    if(this.wickScripts) {
        for (var key in this.wickScripts) {
            this.wickScripts[key] = WickProject.Compressor.encodeString(this.wickScripts[key]);
        }
    }
    if(this.wickScript) {
        this.wickScript = WickProject.Compressor.encodeString(this.wickScript);
    }

    if(this.pathData) this.pathData = WickProject.Compressor.encodeString(this.pathData);

}

WickFrame.prototype.decodeStrings = function () {

    if(this.wickScripts) {
        for (var key in this.wickScripts) {
            this.wickScripts[key] = WickProject.Compressor.decodeString(this.wickScripts[key]);
        }
    }
    if(this.wickScript) {
        this.wickScript = WickProject.Compressor.decodeString(this.wickScript);
    }

    if(this.pathData) this.pathData = WickProject.Compressor.decodeString(this.pathData);

}

WickFrame.prototype.getFrameEnd = function () {
    return this.playheadPosition + this.length; 
}

WickFrame.prototype.getObjectByUUID = function () {

    var foundWickObject;

    this.wickObjects.forEach(function (wickObject) {
        if(wickObject.uuid === uuid) {
            foundWickObject = wickObject;
        }
    });

    return foundWickObject;

}

WickFrame.prototype.getAsJSON = function () {
    this.wickObjects.forEach(function (wickObject) {
        wickObject.encodeStrings();
    });

    var frameJSON = JSON.stringify(this, WickProject.Exporter.JSONReplacerObject);

    this.wickObjects.forEach(function (wickObject) {
        wickObject.decodeStrings();
    });

    return frameJSON;
}

WickFrame.fromJSON = function (frameJSON) {
    var frame = JSON.parse(frameJSON);
    frame.__proto__ = WickFrame.prototype;
    if(frame.tweens) {
        frame.tweens.forEach(function (tween) {
            tween.__proto__ = WickTween.prototype;
        });
    }
    frame.uuid = random.uuid4();
    frame.wickObjects.forEach(function (wickObject) {
        WickObject.addPrototypes(wickObject);
        wickObject.generateParentObjectReferences();
        wickObject.decodeStrings();
        wickObject.uuid = random.uuid4();
    })
    return frame;
}

WickFrame.fromJSONArray = function (jsonArrayObject) {
    var frames = [];

    var framesJSONArray = jsonArrayObject.wickObjectArray;
    framesJSONArray.forEach(function (frameJSON) {
        var newframe = WickFrame.fromJSON(frameJSON)
        frames.push(newframe)
    });

    return frames;
}

WickFrame.prototype.getNextOpenPlayheadPosition = function () {
    return this.parentLayer.getNextOpenPlayheadPosition(this.playheadPosition);
}

WickFrame.prototype.addTween = function (newTween) {
    var self = this;

    var replacedTween = false;
    self.tweens.forEach(function (tween) {
        if (tween.playheadPosition === newTween.playheadPosition) {
            self.tweens[self.tweens.indexOf(tween)] = newTween;
            replacedTween = true;
        }
    });

    if(!replacedTween)
        self.tweens.push(newTween);
}

WickFrame.prototype.removeTween = function (tweenToDelete) {
    var self = this;

    var deleteTweenIndex = null;
    self.tweens.forEach(function (tween) {
        if(deleteTweenIndex) return;
        if (tweenToDelete === tween) {
            deleteTweenIndex = self.tweens.indexOf(tween);
        }
    });

    if(deleteTweenIndex !== null) {
        self.tweens.splice(deleteTweenIndex, 1);
    }
}

WickFrame.prototype.getCurrentTween = function () {
    return this.getTweenAtFrame(this.parentObject.playheadPosition-this.playheadPosition)
}

WickFrame.prototype.getTweenAtPlayheadPosition = function (playheadPosition) {
    var foundTween;
    this.tweens.forEach(function (tween) {
        if(foundTween) return;
        if(tween.playheadPosition === playheadPosition) foundTween = tween;
    })
    return foundTween;
}

WickFrame.prototype.hasTweenAtFrame = function () {
    var playheadPosition = this.parentObject.playheadPosition-this.playheadPosition;

    var foundTween = false
    this.tweens.forEach(function (tween) {
        if(foundTween) return;
        if(tween.playheadPosition === playheadPosition) foundTween = true;
    })
    return foundTween;
}

WickFrame.prototype.getTweenAtFrame = function (playheadPosition) {
    var playheadPosition = this.parentObject.playheadPosition-this.playheadPosition;
    
    var foundTween;
    this.tweens.forEach(function (tween) {
        if(foundTween) return;
        if(tween.playheadPosition === playheadPosition) foundTween = tween;
    })
    return foundTween;
}

WickFrame.prototype.getFromTween = function () {
    var foundTween = null;

    var relativePlayheadPosition = this.parentObject.playheadPosition-this.playheadPosition;

    var seekPlayheadPosition = relativePlayheadPosition;
    while (!foundTween && seekPlayheadPosition >= 0) {
        this.tweens.forEach(function (tween) {
            if(tween.playheadPosition === seekPlayheadPosition) {
                foundTween = tween;
            }
        });
        seekPlayheadPosition--;
    }

    return foundTween;
}

WickFrame.prototype.getToTween = function () {
    var foundTween = null;

    var relativePlayheadPosition = this.parentObject.playheadPosition-this.playheadPosition;

    var seekPlayheadPosition = relativePlayheadPosition;
    var parentFrameLength = this.length;
    while (!foundTween && seekPlayheadPosition < parentFrameLength) {
        this.tweens.forEach(function (tween) {
            if(tween.playheadPosition === seekPlayheadPosition) {
                foundTween = tween;
            }
        });
        seekPlayheadPosition++;
    }

    return foundTween;
}

WickFrame.prototype.applyTween = function () {

    var self = this;

    var tweenToApply;

    if(self.tweens.length === 1) {
        tweenToApply = self.tweens[0];
    } else if (self.tweens.length > 1) {
        var tweenFrom = self.getFromTween();
        var tweenTo = self.getToTween();

        if (tweenFrom && tweenTo) {
            var A = tweenFrom.playheadPosition;
            var B = tweenTo.playheadPosition;
            var L = B-A;
            var P = (this.parentObject.playheadPosition-this.playheadPosition)-A;
            var T = P/L;
            if(B-A === 0) T = 1;
            
            tweenToApply = WickTween.interpolateTweens(tweenFrom, tweenTo, T);
        }
        if (!tweenFrom && tweenTo) {
            tweenToApply = tweenTo;
        }
        if (!tweenTo && tweenFrom) {
            tweenToApply = tweenFrom;
        }
    }

    if(!tweenToApply) return;
    self.wickObjects.forEach(function (wickObject) {
        tweenToApply.applyTweenToWickObject(wickObject);
    });

}

WickFrame.prototype.hasSound = function () {
    return this.audioAssetUUID;
}
