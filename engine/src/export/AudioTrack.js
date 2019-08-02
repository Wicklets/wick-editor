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
  // https://github.com/meandavejustice/merge-audio-buffers/blob/master/index.js
  // Merge multiple audiobuffers into a single audiobuffer
  static mergeBuffers(buffers, ac) {
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
    var out = ac.createBuffer(maxChannels,
                                   ac.sampleRate * maxDuration,
                                   ac.sampleRate);

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

  static base64ToAudioBuffer (base64, ctx, callback) {
    let cleanBase64 = base64.split(',')[1];
    let arraybuffer = b64toBuff.decode(cleanBase64);

    ctx.decodeAudioData(arraybuffer, function(audioBuffer) {
      callback(audioBuffer)
    }, (e) => {
      console.log('onError')
      console.log(e)
    });
  }

  static mergeAudio (projectAudioInfo, callback) {
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

  static mergeProjectAudioTracks (project, callback) {
    project.generateAudioSequence({}, audioInfo => {
      this.mergeAudio(audioInfo, audioArraybuffer => {
        callback(audioArraybuffer);
      });
    });
  }
}
