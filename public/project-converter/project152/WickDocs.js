window.wickDocs = 
    [{
      "name": "Timeline",
      "properties": [
        {
          "name": "play()",
          "description": "Plays the timeline. ",
          "example": "play();",
          "snippet": "play()",
          "return": null,
          "args": []
        },
        {
          "name": "stop()",
          "description": "Stops the timeline.",
          "example": "stop();",
          "snippet": "stop()",
          "return": null,
          "args": []
        },
        {
          "name": "gotoAndStop(frame)",
          "description": "Moves the timeline to a frame number or name and stops that timeline.",
          "example": "gotoAndStop(2);\ngotoAndStop('menu');",
          "snippet": "gotoAndStop(1)",
          "args": [
            {
              "name": "frame",
              "type": "Number",
              "description": "frame number or name to jump to"
            }
          ]
        },
        {
          "name": "gotoAndPlay(frame)",
          "description": "Moves the timeline to a frame number or name and stops that timeline.",
          "example": "gotoAndPlay(2);\ngotoAndPlay('menu');",
          "snippet": "gotoAndPlay(1)",
          "args": [
            {
              "name": "frame",
              "type": "Number",
              "description": "frame number or name to jump to"
            }
          ]
        },
        {
          "name": "gotoNextFrame()",
          "description": "Moves the timeline forward one frame.",
          "example": "gotoNextFrame();",
          "snippet": "gotoNextFrame()",
          "args": []
        },
        {
          "name": "gotoPrevFrame()",
          "description": "Moves the timeline backwards one frame.",
          "example": "gotoPrevFrame();",
          "snippet": "gotoPrevFrame()",
          "args": []
        }
      ]
    },
    {
      "name": "Events",
      "properties": [
        {
          "name": "load",
          "description": "Gets called as soon as the object appears on screen.",
          "example": "// Define some variables and set them on load\nvar points;\nvar dead;\n\nfunction load() {\n    points = 0;\n    dead = false;\n}",
          "snippet": "function load() {\n    // Do something here!\n}\n",
          "return": null,
          "args": []
        },
        {
          "name": "update",
          "description": "Gets called every tick.",
          "example": "// This will move the object slowly to the left\nfunction update() {\n    this.x --;\n}",
          "snippet": "function update() {\n    // Do something here!\n}\n",
          "return": null,
          "args": []
        },
        {
          "name": "mousePressed",
          "description": "Gets called once when the object is pressed",
          "example": "// Delete this object when it's pressed.\nfunction mousePressed() {\n    this.delete();\n}",
          "snippet": "function mousePressed() {\n    // Do something here!\n}\n",
          "return": null,
          "args": []
        },
        {
          "name": "mouseDown",
          "description": "Gets called every tick if the mouse is down and hovered over the object.",
          "example": "\nfunction mouseDown() {\n    this.x = mouseX;\n    this.y = mouseY\n}",
          "snippet": "function mouseDown() {\n    // Do something here!\n}\n",
          "return": null,
          "args": []
        },
        {
          "name": "mouseReleased",
          "description": "Gets called once when the mouse is released over the object.",
          "example": "// Delete this object when it's clicked.\nfunction mouseReleased() {\n    this.delete();\n}",
          "snippet": "function mouseReleased() {\n    // Do something here!\n}\n",
          "return": null,
          "args": []
        },
        {
          "name": "mouseHover",
          "description": "Gets called every update when the mouse hovers over the object.",
          "example": "// Move this object when the mouse hovers over it\nfunction mouseHover() {\n    this.x ++;\n}",
          "snippet": "function mouseHover() {\n    // Do something here!\n}\n",
          "return": null,
          "args": []
        },
        {
          "name": "mouseEnter",
          "description": "Gets called once when the mouse enters the object",
          "example": "// Delete the object if the mouse touches it.\nfunction mouseEnter() {\n    this.delete();\n}",
          "snippet": "function mouseEnter() {\n    // Do something here!\n}\n",
          "return": null,
          "args": []
        },
        {
          "name": "mouseLeave",
          "description": "Gets called once when the mouse leaves the object",
          "example": "// Delete the object if the mouse ever leaves.\nfunction mouseLeave() {\n    this.delete();\n}",
          "snippet": "function mouseLeave() {\n    // Do something here!\n}\n",
          "return": null,
          "args": []
        },
        {
          "name": "keyPressed",
          "description": "Gets called once when a key is first pressed.",
          "example": "function keyPressed(key) {\n    if (key == 'UP') {\n        this.x += 20; //Move 20 pixels to the right\n    }\n}",
          "snippet": "function keyPressed(key) {\n    // Do something here!\n}\n",
          "return": null,
          "args": []
        },
        {
          "name": "keyReleased",
          "description": "Gets called once when a key is released.",
          "example": "function keyReleased(key) {\n    if (key == 'z') {\n        //user is no longer pressing z\n    }\n}",
          "snippet": "function keyReleased(key) {\n    // Do something here!\n}\n",
          "return": null,
          "args": []
        },
        {
          "name": "keyDown",
          "description": "Gets called once every update while a key is down.",
          "example": "function keyDown(key) {\n    if (key == 'UP') {\n        this.x += 20; //Move 20 pixels to the right\n    }\n}",
          "snippet": "function keyDown(key) {\n    // Do something here!\n}\n",
          "return": null,
          "args": []
        }
      ]
    },
    {
      "name": "Object",
      "properties": [
        {
          "name": "x",
          "type": "Number",
          "description": "Refers to the x-location (left-to-right) of the object.",
          "example": "this.x += 1; // Moves the object to the right by 1 pixel",
          "snippet": "this.x",
          "args": [],
          "return": null
        },
        {
          "name": "y",
          "type": "Number",
          "description": "Refers to the y-location (top-to-bottom) of the object. Y values increase as you go down on the canvas.",
          "example": "this.y += 1; // Moves the object down by one pixel",
          "snippet": "this.y",
          "args": [],
          "return": null
        },
        {
          "name": "scaleX",
          "type": "Number",
          "description": "Scales the width of the object. By default scaleX is set to 1.",
          "example": "this.scaleX = 2; // Doubles the width of this object.",
          "snippet": "this.scaleX",
          "args": [],
          "return": null
        },
        {
          "name": "scaleY",
          "type": "Number",
          "description": "Scales the height of the object. By default scaleY is set to 1.",
          "example": "this.scaleY = 2; // Doubles the height of this object.",
          "snippet": "this.scaleY",
          "args": [],
          "return": null
        },
        {
          "name": "rotation",
          "type": "Number",
          "description": "Controls the angle of rotation on the object in degrees.",
          "example": "this.rotation += 10; // Rotate this object 10 degrees to the right",
          "snippet": "this.rotation",
          "args": [],
          "return": null
        },
        {
          "name": "flipX",
          "type": "Boolean",
          "description": "A boolean which determines whether or not to flip the object horizontally. By default flipX is set to false.",
          "example": "this.flipX = true; // Flip this object horizontally.",
          "snippet": "this.flipX",
          "args": [],
          "return": null
        },
        {
          "name": "flipY",
          "type": "Boolean",
          "description": "A boolean which determines whether or not to flip the object vertically. By default flipY is set to false.",
          "example": "this.flipY = true; // Flip this object vertically.",
          "snippet": "this.flipY",
          "args": [],
          "return": null
        },
        {
          "name": "opacity",
          "type": "Number",
          "description": "A value between 0 and 1 which determines how transparent an object is. 1 is completely opaque while 0 is completely transparent. By default opacity is set to 1.",
          "example": "this.opacity = 0.8; // Make this object slightly transparent.",
          "snippet": "this.opacity",
          "args": [],
          "return": null
        },
        {
          "name": "name",
          "type": "Number",
          "description": "The name of the object, can be set in the inspector.",
          "example": "console.log('My name is ' + this.name)",
          "snippet": "this.name",
          "args": [],
          "return": null
        },
        {
          "name": "clone()",
          "description": "Makes a clone of the WickObject.",
          "example": "// Creates a clone of the current wick object and stores it in the variable myClone\nvar myClone = this.clone();",
          "snippet": "var clone = this.clone()",
          "args": [],
          "return": {
            "type": "WickObject",
            "description": "A clone of the object that called clone()."
          }
        },
        {
          "name": "clones",
          "description": "An array of all of the clones of the WickObject.",
          "example": "// This will delete all of the clones of this Wick Object.\nfor (var i = 0; i < this.clones.length; i++) {\n    this.clones[i].delete();\n}",
          "snippet": "for (var i = 0; i < this.clones.length; i++) {\n    \n}",
          "args": [],
          "return": null,
        },
        {
          "name": "delete()",
          "description": "Deletes the object completely.",
          "example": "this.delete(); // Removes the object from the scene.",
          "snippet": "this.delete()",
          "args": [],
          "return": null
        },
        {
          "name": "hitTest(otherObject)",
          "description": "Checks for a collision with another object.",
          "example": "// If this object collides with objectTwo delete this object\nif (this.hitTest(objectTwo)) {\n    this.delete(); \n} ",
          "snippet": "if(this.hitTest(other_object_name)) {\n    // Do something here!\n}",
          "args": [
            {
              "name": "otherObject",
              "type": "WickObject",
              "description": "Wick Object to check for collision with."
            }
          ],
          "return": {
            "type": "Boolean",
            "description": "True if the objects collide, false otherwise."
          }
        },
        { //TODO
          "name": "hits(that, options)",
          "description": "Checks for a collision with another object, returns information about the collision.",
          "example": "// "
        },
        /*{
          "name": "getHitInfo(otherObject)",
          "description": "Returns information about a collision between two objects if they are touching.",
          "example": "// If there's a collision, move this object so that the objects are no longer touching.\nvar hitInfo = this.getHitInfo(other_object_name);\nif (hitInfo.hit) {\n      this.x -= hitInfo.overlapX\n      this.y -= hitInfo.overlapY\n}",
          "snippet": "var hitInfo = this.getHitInfo(other_object_name)",
          "args": [
            {
              "name": "otherObject",
              "type": "WickObject",
              "description": "Wick Object to check for collision with."
            }
          ],
          "return": {
            "type": "HitInfo",
            "description": "An object holdng the information about the collision."
          }
        },*/
        /*{
          "name": "pointTo(x,y)",
          "description": "Rotates this object so that it is facing in the direction of the given point (x,y)",
          "example": "// Make this object point towards the mouse\nthis.pointTo(mouseX, mouseY)",
          "snippet": "this.pointTo(x,y)",
          "args": [
            {
              "name": "x",
              "type": "Number",
              "description": "The x-coordinate of the point to rotate towards."
            },
            {
              "name": "y",
              "type": "Number",
              "description": "The y-coordinate of the point to rotate towards."
            }
          ],
          "return": null
        },*/
        {
          "name": "play()",
          "description": "Plays this objects timeline (only usable for Clips). ",
          "example": "this.play();",
          "snippet": "this.play()",
          "return": null,
          "args": []
        },
        {
          "name": "stop()",
          "description": "Stops this objects timeline (only usable for Clips).",
          "example": "this.stop();",
          "snippet": "this.stop()",
          "return": null,
          "args": []
        },
        {
          "name": "gotoAndStop(frame)",
          "description": "Moves this objects timeline to a frame number or name and stops that timeline (only usable for Clips).",
          "example": "this.gotoAndStop(2);\nthis.gotoAndStop('menu');",
          "snippet": "this.gotoAndStop(1)",
          "args": [
            {
              "name": "frame",
              "type": "Number",
              "description": "frame number or name to jump to"
            }
          ]
        },
        {
          "name": "gotoAndPlay(frame)",
          "description": "Moves the object's timeline to a frame number or name and stops the object's timeline (only usable for Clips).",
          "example": "this.gotoAndPlay(2);\nthis.gotoAndPlay('menu');",
          "snippet": "this.gotoAndPlay(1)",
          "args": [
            {
              "name": "frame",
              "type": "Number",
              "description": "frame number or name to jump to"
            }
          ]
        },
        {
          "name": "currentFrameNumber",
          "description": "The position of the playhead of the object (only works on Clips).",
          "example": "if(this.currentFrameNumber === 10) {\n    alert('On frame 10!')\n}",
          "snippet": "this.currentFrameNumber",
          "args": [],
          "return": null
        },
        {
          "name": "currentFrameName",
          "description": "The name of the current frame of the object (only works on Clips).",
          "example": "if(this.currentFrameName === 'walking') {\n    alert('On walking frame!')\n}",
          "snippet": "this.currentFrameName",
          "args": [],
          "return": null
        },
        { "name": "setText(text)",
          "description": "Changes the text of a text object.",
          "example": "//Update with mouse position\nfunction update () {\n this.setText('mouseX:' + mouseX);\n}",
          "snippet": "this.setText('update text here')",
          "args": [
            {
              "name": "text",
              "type": "String",
              "description": "The string to update the textbox with."
            }
          ]
        }
      ]
    },
    {
      "name": "Project",
      "properties": [
        {
          "name": "project.getObject(name)",
          "description": "Returns the object with the requested name.",
          "example": "// Returns the object named 'The Bee'\nproject.getObject('The Bee')",
          "snippet": "project.getObject(object_name)",
          "args": [],
          "return": {
            "type": "WickObject",
            "description": "The object with the requested name."
          }
        },
        {
          "name": "project.width",
          "description": "The width of the project",
          "example": "project.width",
          "snippet": "project.width",
          "args": [],
          "return": null
        },
        {
          "name": "project.height",
          "description": "The height of the project",
          "example": "project.height",
          "snippet": "project.height",
          "args": [],
          "return": null
        }
      ]
    },
    {
      "name": "Sounds",
      "properties": [
        {
          "name": "playSound(filename)",
          "description": "Plays the sound in the asset library with the specified filename.",
          "example": "playSound('something.mp3');",
          "snippet": "playSound('something.mp3');",
          "args": [
            {
              "name": "filename",
              "type": "String",
              "description": "The filename of the sound to play."
            }
          ],
          "return": null
        },
        {
          "name": "stopAllSounds()",
          "description": "Stops any sounds currently being played.",
          "example": "stopAllSounds();",
          "snippet": "stopAllSounds()",
          "args": [],
          "return": null
        },
        {
          "name": "mute()",
          "description": "Mutes the entire project (no sounds will play).",
          "example": "mute();",
          "snippet": "mute()",
          "args": [],
          "return": null
        },
        {
          "name": "unmute()",
          "description": "Unmutes the enite project (sounds will play again).",
          "example": "unmute();",
          "snippet": "unmute()",
          "args": [],
          "return": null
        }
      ]
    },
    {
      "name": "Input",
      "properties": [
        {
          "name": "mouseX",
          "description": "The x-location of the mouse on the project canvas. The origin (0,0) is the upper-left corner of the canvas.",
          "example": "// Sets the object's x-position to the mouse's x-position.\nthis.x = mouseX",
          "snippet": "mouseX",
          "args": [],
          "return": null
        },
        {
          "name": "mouseY",
          "description": "The y-location of the mouse on the project canvas. The origin (0,0) is the upper-left corner of the canvas.",
          "example": "// Sets the object's y-position to the mouse's y-position.\nthis.y = mouseY",
          "snippet": "mouseY",
          "args": [],
          "return": null
        },
        {
          "name": "mouseMoveX",
          "description": "The amount the mouse moved on the x-axis during the last tick.",
          "example": "// Make a clone that follows you around!\n// Add this to a picture or circle! \nvar clone = this.clone();\nfunction update () {\n    this.x = mouseX;\n    this.y = mouseY;\n    clone.x = this.x - mouseMoveX;\n    clone.y = this.y - mouseMoveY;\n}",
          "snippet": "mouseMoveX",
          "args": [],
          "return": null
        },
        {
          "name": "mouseMoveY",
          "description": "The amount the mouse moved on the y-axis during the last tick.",
          "example": "// Make a clone that follows you around!\n// Add this to a picture or circle! \nvar clone = this.clone();\nfunction update () {\n    this.x = mouseX;\n    this.y = mouseY;\n    clone.x = this.x - mouseMoveX;\n    clone.y = this.y - mouseMoveY;\n}",
          "snippet": "mouseMoveY",
          "args": [],
          "return": null
        },
        {
          "name": "keyIsDown(key)",
          "description": "Returns true if 'key' is currently down and false otherwise. Casing does not matter i.e. keyIsDown('a') is equivalent to keyIsDown('A').",
          "example": "// If SPACE is pressed, move this object right by 10 pixels\nif (keyIsDown('SPACE')) { \n    this.x += 10;\n}",
          "snippet": "if(keyIsDown(key)) {\n    // Do something here!\n}\n",
          "args": [
            {
              "name": "key",
              "type": "String",
              "description": "Any character such as 'A' or special characters including 'SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'BACKSPACE', 'TAB', 'ENTER', 'SHIFT', 'CTRL', 'COMMAND', 'ALT', 'WINDOWS', 'F1', 'NUM 0', 'NUM LOCK'"
            }
          ],
          "return": {
            "type": "Boolean",
            "description": "true if key is down, false otherwise."
          }
        },
        {
          "name": "keyJustPressed(key)",
          "description": "Returns true if 'key' was just pressed and false otherwise. Casing does not matter i.e. keyJustPressed('a') is equivalent to keyJustPressed('A').",
          "example": "// If SPACE is pressed, move this object right by 10 pixels\nif (keyJustPressed('SPACE')) { \n    this.x += 10;\n}",
          "snippet": "if(keyJustPressed(key)) {\n    // Do something here!\n}\n",
          "args": [
            {
              "name": "key",
              "type": "String",
              "description": "Any character such as 'A' or special characters including 'SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'BACKSPACE', 'TAB', 'ENTER', 'SHIFT', 'CTRL', 'COMMAND', 'ALT', 'WINDOWS', 'F1', 'NUM 0', 'NUM LOCK'"
            }
          ],
          "return": {
            "type": "Boolean",
            "description": "true if key was just pressed, false otherwise."
          }
        },
        {
          "name": "hideCursor()",
          "description": "Makes the cursor invisible.",
          "example": "hideCursor();",
          "snippet": "hideCursor()",
          "args": [],
          "return": null
        },
        {
          "name": "showCursor()",
          "description": "Makes the cursor visible.",
          "example": "showCursor();",
          "snippet": "showCursor()",
          "args": [],
          "return": null
        }
      ]
    },
    /*{
      "name": "Camera",
      "properties": [
        {
          "name": "camera.setPosition(x,y)",
          "description": "Moves the camera to the given x-y coordinates.",
          "example": "camera.setPosition(0,0)",
          "snippet": "camera.setPosition(0,0)",
          "return": null,
          "args": [{
              "name": "x",
              "type": "Number",
              "description": "The x coordinate to move the camera to."
            }, {
              "name": "y",
              "type": "Number",
              "description": "The y coordinate to move the camera to."
            }]
        },
        {
          "name": "camera.followObject(wickObject, smoothness)",
          "description": "Makes the camera follow the wickObject that is passed in.",
          "example": "// Follow this object nice and smoothly.\ncamera.followObject(wickObject, 0.1)",
          "snippet": "camera.followObject(wickObject, 0.1)",
          "return": null,
          "args": [{
              "name": "wickObject",
              "type": "WickObject",
              "description": "The WickObject to follow."
            }, {
              "name": "smoothness",
              "type": "Number",
              "description": "How smoothly the camera should follow the object. The less this value is, the longer it will take the camera to catch up with the object."
            }]
        }
      ]
    },*/
    /*{
      "name": "Scope",
      "properties": [
        {
          "name": "this",
          "description": "When used inside of a script, ‘this’ refers to the symbol the script belongs to.",
          "example": "// Move the symbol which ran this script to the right by one pixel\nthis.x += 1;",
          "snippet": "this",
          "args": [],
          "return": null
        },
        {
          "name": "root",
          "description": "Refers to the 'root' object. The root object contains all other objects. The root object has no parent and holds the 'root' timeline which controls the main information being shown. The keyword root can be used in any script.",
          "example": "// Moves the playhead on the root timeline to frame 2 and stops the root timeline\nroot.gotoAndStop(2);",
          "snippet": "root",
          "args": [],
          "return": null
        },
        {
          "name": "parentObject",
          "description": "Refers to the parent of the object. 'parent' can be used to access the parent object's timeline, or other objects contained within the parent.",
          "example": "// Moves the playhead on the parent obect's timeline to frame 2 and plays that timeline\nparent.gotoAndPlay(2);",
          "snippet": "parentObject",
          "args": [],
          "return": null
        }
      ]
    },*/
    {
      "name": "Utilities",
      "properties": [
        {
          "name": "saveData(key,data)",
          "description": "Saves data that persists between sessions.",
          "example": "// Save what frame the project was at.\nsaveData('frame', root.currentFrameNumber);",
          "snippet": "saveData('name', data)",
          "return": null,
          "args": [
            {
              "name": "key",
              "type": "String",
              "description": "The name that can be used to load the data later."
            }, {
              "name": "data",
              "type": "Number, String, or Object",
              "description": "The data to save"
            }
          ]
        }, {
          "name": "loadData(key)",
          "description": "Loads data that was saved from a previous session.",
          "example": "// Go to the frame where the project was last time it was run.\nvar frameNumber = loadData('frame');\ngotoAndStop(frameNumber);",
          "snippet": "var data = loadData('name')",
          "return": null,
          "args": [
            {
              "name": "key",
              "type": "String",
              "description": "The name of the data you wish to load."
            }
          ]
        },
        {
          "name": "randomBool()",
          "description": "Generates a random boolean (true or false).",
          "example": "// Use randomBool to simulate a coin flip.\nvar coinFlip = randomBool();\nif(coinFlip == true) {\n    alert('You&#8217;re lucky!!');\n}",
          "snippet": "var randombool = randomBool()",
          "return": {
            "type": "Boolean",
            "description": "A random boolean. Will be true 50% of the time, and false 50% of the time."
          },
          "args": []
        }, {
          "name": "randomInt(min,max)",
          "description": "Generates a random whole number between min and max.",
          "example": "// Use randomInt to move to a random frame from 1-10.\nvar randomFrame = randomInt(1,10);\ngotoAndStop(randomFrame);",
          "snippet": "var randomint = randomInt(min, max)",
          "return": {
            "type": "Number",
            "description": "A random integer (whole number)."
          },
          "args": [
            {
              "name": "min",
              "type": "Number",
              "description": "The generated number will be greater than or equal to min"
            }, {
              "name": "max",
              "type": "Number",
              "description": "The generated number will be less than or equal to max"
            }
           ]
        }, {
          "name": "randomFloat(min,max)",
          "description": "Generates a random float between min and max.",
          "example": "// Use randomFloat to choose how transparent an object appears.\nthis.opacity = randomFloat(0,1);",
          "snippet": "var randomfloat = randomFloat(min, max)",
          "return": {
            "type": "Number",
            "description": "A random float (rational number)."
          },
          "args": [
            {
              "name": "min",
              "type": "Number",
              "description": "The generated number will be greater than or equal to min"
            }, {
              "name": "max",
              "type": "Number",
              "description": "The generated number will be less than or equal to max"
            }
          ]
        }
      ]
    },
  ];
  

