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
     * @param {object} args - Asset constructor args. see constructor for Wick.Asset
     */
    constructor (args) {
        super(args);

        this._waveform = null;
    }

    _serialize (args) {
        var data = super._serialize(args);
        return data;
    }

    _deserialize (data) {
        super._deserialize(data);
    }

    get classname () {
        return 'SoundAsset';
    }

    /**
     * Plays this asset's sound.
     * @param {number} seekMS - the amount of time in milliseconds into the sound the sound should start at.
     * @param {number} volume - the volume of the sound, from 0.0 - 1.0
     * @param {boolean} loop - if set to true, the sound will loop
     * @return {number} The id of the sound instance that was played.
     */
    play (options) {
        if(!options) options = {};
        if(options.seekMS === undefined) options.seekMS = 0;
        if(options.volume === undefined) options.volume = 1.0;
        if(options.loop === undefined) options.loop = false;

        // don't do anything if the project is muted...
        if(this.project.muted) {
            return;
        }

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
     * @param {function} callback - function to call when the data is done being loaded.
     */
    load (callback) {
        this._generateWaveform(() => {
            this._waitForHowlLoad(() => {
                callback();
            });
        });
    }

    /**
     * Image of the waveform of this sound.
     * @type {Image}
     */
    get waveform () {
        return this._waveform;
    }

    get _howl () {
        // Lazily create howler instance
        if(!this._howlInstance) {
            // This fixes OGGs in firefox, as video/ogg is sometimes set as the MIMEType, which Howler doesn't like.
            var srcFixed = this.src;
            srcFixed = this.src.replace('video/ogg', 'audio/ogg');

            this._howlInstance = new Howl({
                src: [srcFixed]
            });
        }
        
        return this._howlInstance;
    }

    _waitForHowlLoad (callback) {
        if(this._howl.state() === 'loaded') {
            callback();
        } else {
            this._howl.on('load', () => {
                callback();
            });
        }
    }

    _generateWaveform (callback) {
        if(this._waveform) {
            callback();
            return;
        }

        var soundSrc = this.src;

        var scwf = new SCWF();
        scwf.generate(soundSrc, {
            onComplete: (png, pixels) => {
                this._waveform = new Image();
                this._waveform.onload = () => {
                    callback();
                }
                this._waveform.src = png;
            }
        });
    }
}
