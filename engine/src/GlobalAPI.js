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

GlobalAPI = class {
    /**
     * Defines all api members such as functions and properties.
     * @type {string[]}
     */
    static get apiMemberNames () {
        return [
            'stop','play','gotoAndStop','gotoAndPlay','gotoNextFrame','gotoPrevFrame',
            // These are currently disabled, they are very slow for some reason.
            // They are currently hacked in inside Tickable._runFunction
            //'project','root','parent','parentObject',
            'isMouseDown','mouseX','mouseY','mouseMoveX','mouseMoveY',
            'key','keys','isKeyDown','keyIsDown','isKeyJustPressed','keyIsJustPressed',
            'random',
            'playSound','stopAllSounds',
            'onEvent',
            'hideCursor','showCursor',
            'hitTestOptions',
        ];
    }

    /**
     * @param {object} scriptOwner The tickable object which owns the script being evaluated.
     */
    constructor (scriptOwner) {
        this.scriptOwner = scriptOwner;
    }

    /**
     * Returns a list of api members bound to the script owner.
     * @returns {object[]} Array of functions, properties, and api members.
     */
    get apiMembers () {
        var members = [];

        GlobalAPI.apiMemberNames.forEach(name => {
            var fn = this[name];
            if(fn instanceof Function) {
                fn = fn.bind(this);
            }
            members.push({
                name: name,
                fn: fn,
            })
        });

        return members;
    }

    /**
     * Stops the timeline of the object's parent clip.
     */
    stop () {
        this.scriptOwner.parentClip.stop();
    }

    /**
     * Plays the timeline of the object's parent clip.
     */
    play () {
        this.scriptOwner.parentClip.play();
    }

    /**
     * Moves the plahead of the parent clip to a frame and stops the timeline of that parent clip.
     * @param {string | number} frame Frame name or number to move playhead to.
     */
    gotoAndStop (frame) {
        this.scriptOwner.parentClip.gotoAndStop(frame);
    }

    /**
     * Moves the plahead of the parent clip to a frame and plays the timeline of that parent clip.
     * @param {string | number} frame Frame name or number to move playhead to.
     */
    gotoAndPlay (frame) {
        this.scriptOwner.parentClip.gotoAndPlay(frame);
    }

    /**
     * Moves the playhead of the parent clip of the object to the next frame.
     */
    gotoNextFrame () {
        this.scriptOwner.parentClip.gotoNextFrame();
    }

    /**
     * Moves the playhead of the parent clip of this object to the previous frame.
     */
    gotoPrevFrame () {
        this.scriptOwner.parentClip.gotoPrevFrame();
    }

    hitTestOptions (options) {
        this.scriptOwner.project.hitTestOptions = options;
    }

    /**
     * Returns an object representing the project with properties such as width, height, framerate, background color, and name.
     * @returns {object} Project object.
     */
    get project () {
        var project = this.scriptOwner.project && this.scriptOwner.project.root;
        if(project) {
            // Attach some aliases to the project settings
            project.width = this.scriptOwner.project.width;
            project.height = this.scriptOwner.project.height;
            project.framerate = this.scriptOwner.project.framerate;
            project.backgroundColor = this.scriptOwner.project.backgroundColor;
            project.name = this.scriptOwner.project.name;
            project.hitTestOptions = this.scriptOwner.project.hitTestOptions;
        }
        return project;
    }

    /**
     * @deprecated
     * Legacy item which returns the project. Use 'project' instead.
     */
    get root () {
        return this.project;
    }

    /**
     * Returns a reference to the current object's parent.
     * @returns Current object's parent.
     */
    get parent () {
        return this.scriptOwner.parentClip;
    }

    /**
     * @deprecated
     * Legacy item which returns the parent clip. Use 'parent' instead.
     */
    get parentObject () {
        return this.scriptOwner.parentClip;
    }

    /**
     * Returns the last key pressed down.
     * @returns {string | null} Returns null if no key has been pressed yet.
     */
    get key () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.currentKey;
    }

    /**
     * Returns a list of all keys currently pressed down.
     * @returns {string[]} All keys represented as strings. If no keys are pressed, an empty array is returned.
     */
    get keys () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.keysDown;
    }

    /**
     * Returns true if the given key is currently down.
     * @param {string} key
     * @returns {bool}
     */
    isKeyDown (key) {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.isKeyDown(key);
    }

    /**
     * @deprecated
     * Legacy item, use 'isKeyDown' instead.
     */
    keyIsDown (key) {
        return this.isKeyDown(key.toLowerCase());
    }

    /**
     * Returns true if the given key was just pressed within the last tick.
     * @param {string} key
     * @returns {bool}
     */
    isKeyJustPressed (key) {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.isKeyJustPressed(key);
    }

    /**
     * @deprecated
     * Legacy item, use 'isKeyJustPressed' instead.
     */
    keyIsJustPressed (key) {
        return this.keyIsJustPressed(key.toLowerCase());
    }

    /**
     * Returns true if the mouse is currently held down.
     * @returns {bool | null} Returns null if the object does not have a project.
     */
    isMouseDown () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.isMouseDown;
    }

    /**
     * Returns the current x position of the mouse in relation to the canvas.
     * @returns {number}
     */
    get mouseX () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.mousePosition.x;
    }

    /**
     * Returns the current y position of the mouse in relation to the canvas.
     * @returns {number}
     */
    get mouseY () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.mousePosition.y;
    }

    /**
     * Returns the amount the mouse moved in the last tick on the x axis.
     * @returns {number}
     */
    get mouseMoveX () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.mouseMove.x;
    }

    /**
     * Returns the amount the mouse moved in the last tick on the y axis.
     * @returns {number}
     */
    get mouseMoveY () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.mouseMove.y;
    }

    /**
     * Returns a new random object.
     * @returns {GlobalAPI.Random}
     */
    get random () {
        return new GlobalAPI.Random();
    }

    /**
     * Plays a sound which is currently in the asset library.
     * @param {string} name - name of the sound asset in the library.
     * @param {Object} options - options for the sound. See Wick.SoundAsset.play
     * @returns {object} object representing the sound which was played.
     */
    playSound (assetName, options) {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.playSound(assetName, options);
    }

    /**
     * Stops sound(s) currently playing.
     * @param {string} assetName - The name of the SoundAsset to stop.
     * @param {number} id - (optional) The ID of the sound to stop. Returned by playSound. If an ID is not given, all instances of the given sound asset will be stopped.
     */
    stopSound (assetName, id) {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.stopSound(assetName, id);
    }
    
    /**
     * Stops all currently playing sounds.
     */
    stopAllSounds () {
        if(!this.scriptOwner.project) return null;
        this.scriptOwner.project.stopAllSounds();
    }

    /**
     * Attach a function to an event with a given name.
     * @param {string} name - the name of the event to attach the function to
     * @param {function} fn - the function to attach to the event
     */
    onEvent (name, fn) {
        this.scriptOwner.onEvent(name, fn);
    }

    /**
     * Hide the cursor while the project is running.
     */
    hideCursor () {
        if(!this.scriptOwner.project) return null;
        this.scriptOwner.project.hideCursor = true;
    }

    /**
     * Don't hide the cursor while the project is running.
     */
    showCursor () {
        if(!this.scriptOwner.project) return null;
        this.scriptOwner.project.hideCursor = false;
    }
}

GlobalAPI.Random = class {
    constructor () {

    }

    /**
     * Returns a random integer (whole number) between two given numbers, 0 and a given number, or 0 and 1.
     * @param {number} num1 The minimum of the returned intege, or the maximum of the returned number if it is the only argument.
     * @param {number} max The maximum of the returned integer.
     * @returns {number} A random number between num1 and num2, 0 and num1, or 0 and 1.
     * https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
     */
    integer(num1,num2) {
		if ((typeof num1 !== "undefined") && (typeof num2 !== "undefined")) {
			return Math.floor(Math.random()*(num2-num1)+num1);
		} else if ((typeof num1 !== "undefined") && (typeof num2 == "undefined")) {
			return Math.floor(Math.random()*num1);
		} else {
			return Math.floor(Math.random() * 2);
		}
    }

    /**
     * Returns a random floating point (decimal) number between two given numbers, 0 and a given number, or 0 and 1.
     * @param {number} num1 The minimum of the returned number, or the maximum of the returned number if it is the only argument.
     * @param {number} num2 The maximum of the returned number.
     * @returns {number} A random number between num1 and num2, 0 and num1, or 0 and 1.
     * https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
     */
    float(num1, num2) {
		if ((typeof num1 !== "undefined") && (typeof num2 !== "undefined")) {
			return (Math.random()*(num2-num1)+num1);
		} else if ((typeof num1 !== "undefined") && (typeof num2 == "undefined")) {
			return Math.random()*num1;
		} else {
			return Math.random();
		}
    }

    /**
     * Returns a random item from an array of items.
     * @param {array} An array of objects.
     * @returns {object | null} A random item contained in the array. Returns null if the given array has no items.
     * https://stackoverflow.com/questions/4550505/getting-a-random-value-from-a-javascript-array
     */
    choice(array) {
        if (array.length <= 0) return null;
        return array[Math.floor(Math.random() * array.length)]
    }
}
