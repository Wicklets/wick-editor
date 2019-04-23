/*
 * Copyright 2018 WICKLETS LLC
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

    constructor (args) {
        super(args);
    }

    deserialize (data) {
        super.deserialize(data);
        return object;
    }

    serialize () {
        var data = super.serialize();
        return data;
    }

    get classname () {
        return 'SoundAsset';
    }

    /**
     * Plays this asset's sound.
     * @param {number} seekMS - the amount of time in milliseconds to start the sound at.
     * @return {number} The id of the sound instance that was played.
     */
    play (seekMS, volume) {
        // Lazily create howl instance
        if(!this._howl) {
            this._howl = new Howl({
                src: [this.src]
            });
        }

        // Play the sound, saving the ID returned by howler
        var id = this._howl.play();

        // Skip parts of the sound if seekMS was passed in
        if(seekMS !== undefined) {
            this._howl.seek(seekMS / 1000, id);
        }

        // Set sound instance volume if volume was passed in
        if(volume !== undefined) {
            this._howl.volume(volume, id);
        }

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
     * Remove the sound from any frames in the project that use this asset as their sound.
     */
    removeAllInstances () {
        this.project.getAllFrames().forEach(frame => {
            if(frame.sound.uuid === this.uuid) {
                frame.removeSound();
            }
        });
    }
}
