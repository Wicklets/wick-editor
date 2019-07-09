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

Wick.SoundAsset = class extends Wick.FileAsset {
    /**
     * Returns valid MIME types for a Sound Asset.
     * @returns {string[]} Array of strings representing MIME types in the form audio/Subtype.
     */
    static getValidMIMETypes () {
        let mp3Types = ['audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3', 'audio/mpeg', 'video/mpeg', 'video/x-mpeg']
        let oggTypes = ['audio/ogg', 'video/ogg', 'application/ogg']
        let wavTypes = ['audio/wave', 'audio/wav', 'audio/x-wav', 'audio/x-pn-wav']
        return mp3Types.concat(oggTypes).concat(wavTypes);
    }

    /**
     * Returns valid extensions for a sound asset.
     * @returns {string[]} Array of strings representing valid
     */
    static getValidExtensions () {
        return ['.mp3', '.ogg', '.wav'];
    }

    /**
     * Creates a new SoundAsset.
     */
    constructor (args) {
        super(args);
    }

    serialize (args) {
        var data = super.serialize(args);
        return data;
    }

    deserialize (data) {
        super.deserialize(data);
    }

    get classname () {
        return 'SoundAsset';
    }

    /**
     * Plays this asset's sound.
     * @param {number} seekMS - the amount of time in milliseconds to start the sound at.
     * @param {number} volume - the volume of the sound, from 0.0 - 1.0
     * @param {boolean} loop - if set to true, the sound will loop
     * @return {number} The id of the sound instance that was played.
     */
    play (options) {
        if(!options) options = {};
        if(options.seekMS === undefined) options.seekMS = 0;
        if(options.volume === undefined) options.volume = 1.0;
        if(options.loop === undefined) options.loop = false;

        var id = this._howl.play();

        this._howl.seek(options.seekMS / 1000, id);
        this._howl.volume(options.volume, id);
        this._howl.loop(options.loop, id);

        return id;
    }

    /**
     * Stops this asset's sound.
     * @param {number} id - (optional) the ID of the instance to stop. If ID is not given, every instance of this sound will stop.
     */
    stop (id) {
        // Howl instance was never created, sound has never played yet, so do nothing
        if(!this._howl) {
            return;
        }

        if(id === undefined) {
            this._howl.stop();
        } else {
            this._howl.stop(id);
        }
    }

    /**
     * The length of the sound in seconds
     * @type {number}
     */
    get duration () {
        return this._howl.duration();
    }

    /**
     * A list of Wick Paths that use this font as their fontFamily.
     * @returns {Wick.Path[]}
     */
    getInstances () {
        var frames = [];
        this.project.getAllFrames().forEach(frame => {
            if(frame._soundAssetUUID === this.uuid) {
                frames.push(frame);
            }
        });
        return frames;
    }

    /**
     * Check if there are any objects in the project that use this asset.
     * @returns {boolean}
     */
    hasInstances () {
        return this.getInstances().length > 0;
    }

    /**
     * Remove the sound from any frames in the project that use this asset as their sound.
     */
    removeAllInstances () {
        this.getInstances().forEach(frame => {
            frame.removeSound();
        });
    }

    /**
     * Loads data about the sound into the asset.
     */
    load (callback) {
        this._howl.on('load', () => {
            callback();
        });
    }

    get _howl () {
        // Lazily create howler instance
        if(!this._howlInstance) {
            this._howlInstance = new Howl({
                src: [this.src]
            });
        }
        return this._howlInstance;
    }
}
