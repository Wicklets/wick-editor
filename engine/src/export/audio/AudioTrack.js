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
     * Can take sound information from a generated sequence.
     * @param {Object} args - callback, onProgress, soundInfo
     */
    toAudioBuffer (args) {
        if (!args) args = {}; 
        if (!args.callback) args.callback = () => {}
        if (!args.onProgress) args.onProgress = (frame, maxFrames) => {}

        let genBuffer = (audioInfo) => {
            if (!audioInfo) args.callback(null);

            if(audioInfo.length === 0) {
                // No audio in the project, no AudioBuffer to create
                args.callback(null);
                return;
            }

            Wick.AudioTrack.generateProjectAudioBuffer(audioInfo, audioArraybuffer => {
                args.callback(audioArraybuffer);
            },
            args.onProgress);
        }

        // If audio information is passed in from a previous render, use that. Otherwise, render it again.
        if (args.soundInfo) {
            genBuffer(args.soundInfo);
        } else {
            this.project.generateAudioSequence({
                onFinish: genBuffer,
                onProgress: args.onProgress,
            });
        }
    }

    /**
     * Create an AudioBuffer from given sounds.
     * @param {object[]} projectAudioInfo - infor generated on sounds played in the project.
     * @param {Function} callback - callback to recieve the generated AudioBuffer
     * @param {Function} onProgress(message, progress) - A function which receive a message.
     */
    static generateProjectAudioBuffer (projectAudioInfo, callback, onProgress) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var ctx = new AudioContext();

        let audiobuffers = [];

        let mergeAudio = () => {
            onProgress && onProgress("Merging Audio");
            audiobuffers.sort((a,b) => {return(a.duration - b.duration)})

            let i=0;

            let mergedAudioBuffer = audiobuffers.reduce((buffer1, buffer2) => {
                let buf = this.mergeBuffers([buffer1, buffer2], ctx, onProgress);
                
                i += 1;

                return buf;
            });

            callback(mergedAudioBuffer);
        }

        for (let i=0; i<projectAudioInfo.length; i++) {

            let audioInfo = projectAudioInfo[i];

            this.base64ToAudioBuffer(audioInfo.src, ctx, audiobuffer => {
                let startSeconds = audioInfo.start / 1000;
                let endSeconds = audioInfo.end / 1000;
                let lengthSeconds = endSeconds - startSeconds;

                let croppedAudioBuffer = this.cropAudioBuffer(audiobuffer, lengthSeconds, ctx);

                let delayedAudiobuffer = this.addStartDelayToAudioBuffer(croppedAudioBuffer, startSeconds, ctx);

                onProgress && onProgress("Creating Audio " + (i+1) + "/" + projectAudioInfo.length, (i+1)/projectAudioInfo.length);

                audiobuffers.push(delayedAudiobuffer);

                if (audiobuffers.length >= projectAudioInfo.length) {
                    mergeAudio();
                }
            });

        }

    }

    /*
     * Merges multiple audiobuffers into a single audiobuffer.
     * @param {AudioBuffer[]} buffers - the AudioBuffers to merge together
     * @param {AudioContext} ac - An AudioContext instance
     */
    static mergeBuffers(buffers, ac, onProgress) {
        // original function from:
        // https://github.com/meandavejustice/merge-audio-buffers/blob/master/index.js

        var maxChannels = 0;
        var maxDuration = 0;

        // Send back an empty buffer if no information was sent in.
        if (!buffers || (buffers && buffers.length === 0)) {
            return ac.createBuffer(
                2,
                1000,
                48000,
            )
        }

        // Review the incoming audio to determine output buffer size.
        for (let i = 0; i < buffers.length; i++) {
            onProgress("Reviewing Audio " + (i+1) + "/" + buffers.length, (i+1) + "/" + buffers.length)

            if (buffers[i].numberOfChannels > maxChannels) {
                maxChannels = buffers[i].numberOfChannels;
            }

            if (buffers[i].duration > maxDuration) {
                maxDuration = buffers[i].duration;
            }
        }

        // Create new output buffer.
        var out = ac.createBuffer(
            maxChannels,
            ac.sampleRate * maxDuration,
            ac.sampleRate
        );

        for (var i = 0; i < buffers.length; i++) {
            onProgress("Merging Audio " + (i+1) + "/" + buffers.length, (i+1) + "/" + buffers.length);

            // Go through each channel of the new audio source and copy that data into the output buffer.
            for (var srcChannel = 0; srcChannel < buffers[i].numberOfChannels; srcChannel++) {
                var outt = out.getChannelData(srcChannel);
                var inn = buffers[i].getChannelData(srcChannel);

                for (let j = 0; j < inn.length; j++) {
                    let val = inn[j];

                    // Some sounds may have corrupted data... don't copy that over.
                    if (val) {
                        outt[j] += val;
                    }
                }

                out.getChannelData(srcChannel).set(outt, 0);
            }
        }

        return out;
    }

    /**
     * Crops an AudioBuffer to a given length.
     * @param {AudioBuffer} originalBuffer - the buffer to crop
     * @param {number} delaySeconds - the time, in seconds, to crop the sound at
     * @param {AudioContext} ctx - An AudioContext instance
     */
    static cropAudioBuffer (originalBuffer, lengthSeconds, ctx) {
        // Create a blank buffer with a length of the crop amount
        var croppedBuffer = ctx.createBuffer(
            originalBuffer.numberOfChannels,
            ctx.sampleRate * lengthSeconds,
            ctx.sampleRate,
        );

        // Copy data from the original buffer into the cropped buffer
        for (var srcChannel = 0; srcChannel < croppedBuffer.numberOfChannels; srcChannel++) {
            // Retrieve sample data...
            var croppedBufferChannelData = croppedBuffer.getChannelData(srcChannel);
            var originalBufferChannelData = originalBuffer.getChannelData(srcChannel);

            // Copy samples from the original buffer to the cropped buffer
            for (var i = 0; i < croppedBufferChannelData.length; i++) {
                croppedBufferChannelData[i] = originalBufferChannelData[i];
            }
            croppedBuffer.getChannelData(srcChannel).set(croppedBufferChannelData, 0);
        }

        return croppedBuffer;
    }

    /**
     * Adds silence to the beginning of an AudioBuffer with a given length.
     * @param {AudioBuffer} originalBuffer - the buffer to pad with silence
     * @param {number} delaySeconds - the amount of time, in seconds, to delay the sound
     * @param {AudioContext} ctx - An AudioContext instance
     */
    static addStartDelayToAudioBuffer (originalBuffer, delaySeconds, ctx) {

        // Create buffer with a length equal to the original buffer's length plus the requested delay

        let lengthOfDelay = ctx.sampleRate * delaySeconds;
        let lengthOfOriginalSound = ctx.sampleRate * originalBuffer.duration;

        var delayedBuffer = ctx.createBuffer(
            originalBuffer.numberOfChannels,
            lengthOfDelay + lengthOfOriginalSound,
            ctx.sampleRate,
        );

        // For each channel in the audiobuffer...
        for (var srcChannel = 0; srcChannel < originalBuffer.numberOfChannels; srcChannel++) {
            // Retrieve sample data...
            var delayedBufferChannelData = delayedBuffer.getChannelData(srcChannel);
            var originalBufferChannelData = originalBuffer.getChannelData(srcChannel);

            // Copy samples from the original buffer to the delayed buffer with an offset equal to the delay
            var delayOffset = ctx.sampleRate * delaySeconds;
            
            // Copy in the data from the original buffer into the delayed buffer, starting at the delayed position.
            delayedBuffer.getChannelData(srcChannel).set(originalBufferChannelData, delayOffset);
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
        let arraybuffer = Base64ArrayBuffer.decode(base64DataOnly);

        ctx.decodeAudioData(arraybuffer, function(audioBuffer) {
            callback(audioBuffer);
        }, (e) => {
            console.log('onError');
            console.log(e);
        });
    }
}
