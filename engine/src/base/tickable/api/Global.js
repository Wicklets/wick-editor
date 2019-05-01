/*
 * Copyright 2019 WICKLETS LLC
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
     *
     */
    constructor (scriptOwner) {
        this.scriptOwner = scriptOwner;
    }

    /**
     *
     */
    get apiMemberNames () {
        var allNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        var names = allNames.filter(name => {
            return ['constructor', 'apiMemberNames', 'apiMembers'].indexOf(name) === -1;
        });
        return names;
    }

    /**
     *
     */
    get apiMembers () {
        var members = this.apiMemberNames.map(name => {
            return this[name];
        });

        var boundFunctions = members.map(fn => {
            if(fn instanceof Function) {
                return fn.bind(this);
            } else {
                return fn;
            }
        });

        return boundFunctions;
    }

    /**
     *
     */
    stop () {
        this.scriptOwner.parentClip.stop();
    }

    /**
     *
     */
    play () {
        this.scriptOwner.parentClip.play();
    }
    /**
     *
     */
    gotoAndStop (frame) {
        this.scriptOwner.parentClip.gotoAndStop(frame);
    }
    /**
     *
     */
    gotoAndPlay (frame) {
        this.scriptOwner.parentClip.gotoAndPlay(frame);
    }

    /**
     *
     */
    gotoNextFrame () {
        this.scriptOwner.parentClip.gotoNextFrame();
    }

    /**
     *
     */
    gotoPrevFrame () {
        this.scriptOwner.parentClip.gotoPrevFrame();
    }

    /**
     *
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
     *
     */
    get parent () {
        return this.scriptOwner.parentClip;
    }

    /**
     * @deprecated
     * Legacy item which returns the parent object. Use 'parent' instead.
     */
    get parentObject () {
        return this.parent;
    }

    /**
     *
     */
    isMouseDown () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.isMouseDown;
    }

    /**
     *
     */
    get key () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.currentKey;
    }

    /**
     *
     */
    get keys () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.keysDown;
    }

    /**
     *
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
     *
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
     *
     */
    get mouseX () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.mousePosition.x;
    }

    /**
     *
     */
    get mouseY () {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.mousePosition.y;
    }

    /**
     *
     */
    get random () {
        return new GlobalAPI.Random();
    }

    /**
     *
     */
    playSound (assetName) {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.playSound(assetName);
    }

    /**
     *
     */
    stopAllSounds (assetName) {
        if(!this.scriptOwner.project) return null;
        return this.scriptOwner.project.stopAllSounds();
    }
}

GlobalAPI.Random = class {
    constructor () {

    }

    //https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
    integer(min,max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    }

    float(min, max) {
        return (Math.random()*(max-min+1)+min);
    }

    //https://stackoverflow.com/questions/4550505/getting-a-random-value-from-a-javascript-array
    choice(array) {
        return array[Math.floor(Math.random() * myArray.length)]
    }
}
