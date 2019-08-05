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

Wick.AudioTrack = class {
    /**
     * @type {Wick.Project}
     */
    get project () {
        return this._project;
    }

    set project (project) {
        this._project = project;
    }

    /**
     * Create a new AudioTrack
     * @param {Wick.Project} project - the project to use audio from
     */
    constructor (project) {
        this._project = project;
    }

    /**
     * Generate an AudioBuffer of all the project's sounds as one audio track.
     * @param {Function} callback -
     */
    toAudioBuffer (callback) {
        var audioInfo = project.getAudioInfo();
        Wick.AudioTrack.generateProjectAudioBuffer(audioInfo, audioArraybuffer => {
            callback(audioArraybuffer);
        });
    }

    /**
     * Create an AudioBuffer from given sounds.
     * @param {object} projectAudioInfo - info generated from Wick.Project.getAudioInfo
     * @param {Function} callback - callback to recieve the generated AudioBuffer
     */
    static generateProjectAudioBuffer (projectAudioInfo, callback) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var ctx = new AudioContext();

        let audiobuffers = [];

        let prepareNextAudioInfo = () => {
            if(projectAudioInfo.length === 0) {
                mergeAudio();
            } else {
                var audioInfo = projectAudioInfo.pop();
                this.base64ToAudioBuffer(audioInfo.src, ctx, audiobuffer => {
                    let delayedAudiobuffer = this.addStartDelayToAudioBuffer(audiobuffer, audioInfo.start / 1000, ctx);
                    audiobuffers.push(delayedAudiobuffer);
                    prepareNextAudioInfo();
                });
            }
        }

        let mergeAudio = () => {
            let mergedAudioBuffer = this.mergeBuffers(audiobuffers, ctx);
            callback(mergedAudioBuffer);
        }

        prepareNextAudioInfo();
    }

    /*
     * Merges multiple audiobuffers into a single audiobuffer.
     * @param {AudioBuffer[]} buffers - the AudioBuffers to merge together
     * @param {AudioContext} ac - An AudioContext instance
     */
    static mergeBuffers(buffers, ac) {
        // original function from:
        // https://github.com/meandavejustice/merge-audio-buffers/blob/master/index.js

        var maxChannels = 0;
        var maxDuration = 0;
        for (let i = 0; i < buffers.length; i++) {
            if (buffers[i].numberOfChannels > maxChannels) {
                maxChannels = buffers[i].numberOfChannels;
            }
            if (buffers[i].duration > maxDuration) {
                maxDuration = buffers[i].duration;
            }
        }
        var out = ac.createBuffer(
            maxChannels,
            ac.sampleRate * maxDuration,
            ac.sampleRate
        );

        for (var j = 0; j < buffers.length; j++) {
            for (var srcChannel = 0; srcChannel < buffers[j].numberOfChannels; srcChannel++) {
                var outt = out.getChannelData(srcChannel);
                var inn = buffers[j].getChannelData(srcChannel);
                for (let i = 0; i < inn.length; i++) {
                    outt[i] += inn[i];
                }
                out.getChannelData(srcChannel).set(outt, 0);
            }
        }
        return out;
    }

    /**
     * Adds silence to the beginning of an AudioBuffer with a given length.
     * @param {AudioBuffer} originalBuffer - the buffer to update
     * @param {number} delaySeconds - the amount of time, in seconds, to delay the sound
     * @param {AudioContext} ctx - An AudioContext instance
     */
    static addStartDelayToAudioBuffer (originalBuffer, delaySeconds, ctx) {
        // Create buffer with a length equal to the original buffer's length plus the requested delay
        var delayedBuffer = ctx.createBuffer(
            originalBuffer.numberOfChannels,
            ctx.sampleRate * originalBuffer.duration + ctx.sampleRate * delaySeconds,
            ctx.sampleRate,
        );

        // For each channel in the audiobuffer...
        for (var srcChannel = 0; srcChannel < originalBuffer.numberOfChannels; srcChannel++) {
            // Retrieve sample data...
            var delayedBufferChannelData = delayedBuffer.getChannelData(srcChannel);
            var originalBufferChannelData = originalBuffer.getChannelData(srcChannel);

            // Copy samples from the original buffer to the delayed buffer with an offset equal to the delay
            var delayOffset = ctx.sampleRate * delaySeconds;
            for (var i = 0; i < delayedBufferChannelData.length; i++) {
                delayedBufferChannelData[i + delayOffset] = originalBufferChannelData[i];
            }
            delayedBuffer.getChannelData(srcChannel).set(delayedBufferChannelData, 0);
        }

        return delayedBuffer;
    }

    /**
     * Convert a base64 string of an audio file into an AudioBuffer.
     * @param {string} base64 - a base64 dataURI of an audio file.
     * @param {AudioContext} ctx - an AudioContext instance.
     * @param {Function} callback - callback to recieve the generated AudioBuffer
     */
    static base64ToAudioBuffer (base64, ctx, callback) {
        let base64DataOnly = base64.split(',')[1];
        let arraybuffer = b64toBuff.decode(base64DataOnly);

        ctx.decodeAudioData(arraybuffer, function(audioBuffer) {
            callback(audioBuffer);
        }, (e) => {
            console.log('onError');
            console.log(e);
        });
    }
}
