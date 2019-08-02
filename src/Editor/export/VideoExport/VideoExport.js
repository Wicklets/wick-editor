var b64toBuff = require('base64-arraybuffer');
var toWav = require('audiobuffer-to-wav')

let testwav = 'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=';

class VideoExport {
  // Convert a audio-buffer segment to a Blob using WAVE representation
  static bufferToWave(abuffer, offset, len) {

    var numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this demo)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while(pos < length) {
      for(i = 0; i < numOfChan; i++) {             // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true);          // update data chunk
        pos += 2;
      }
      offset++                                     // next source sample
    }

    return buffer;

    // create Blob
    //return new Blob([buffer], {type: "audio/wav"});

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }

  static bufferToRawPCM(abuffer, offset, len) {

    var numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        pos = 0;

    // write interleaved data
    for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

    while(pos < length) {
      for(i = 0; i < numOfChan; i++) {             // interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true);          // update data chunk
        pos += 2;
      }
      offset++                                     // next source sample
    }

    return buffer;

    //window.saveAs(new Blob([buffer], {type: "audio/wav"}, 'test.raw'));

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  }

  //https://github.com/meandavejustice/merge-audio-buffers/blob/master/index.js
  static mergeBuffers(buffers, ac) {
    var maxChannels = 0;
    var maxDuration = 0;
    for (var i = 0; i < buffers.length; i++) {
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
        for (var i = 0; i < inn.length; i++) {
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

  static testPlayAudiobuffer (buffer, ctx) {
      // Create a source node from the buffer
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      // Connect to the final output node (the speakers)
      source.connect(ctx.destination);
      // Play immediately
      source.start(0);
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
      //var wav = toWav(mergedAudioBuffer);
      //callback(wav);

      /*
      setTimeout(() => {
        var base64wav = b64toBuff.encode(wav);
        console.log('asndandkajdnksjad')
        this.base64ToAudioBuffer('data:audio/wav;base64,'+base64wav, ctx, test => {
          this.testPlayAudiobuffer(test, ctx)
        });
      },2000);
      */

      /*var base64wav = 'data:audio/wav;base64,'+b64toBuff.encode(wav);
      callback(base64wav)*/

      //window.saveAs(new Blob([wav], { type: "audio/wav" }), 'test.wav');
    }

    prepareNextAudioInfo();
  }

  /**
   * Create a video from a Wick project.
   * @param {Object} args - contains all arguments to be used throughout video.
   * Options include
   * project {object} [required] the project to build a video from.
   * onDone {function} [required] will be called with a blob of the video on success.
   * onRun {function} [optional] called when the project starts to render.
   * onError {function} [optional] will be called on error from worker with a string.
   * onMessage {function} [optional] will be called on message from worker with a string.
   * onPercent {function} [optional] will be called everytime an update occurs with a percentage value of completion from 0 to 1.
   * quality {number} [optional] 1-100, where 1 is highest quality. Defaults to 20
   */
  static renderProjectAsVideo (args) {
    // Create Worker
    var worker = new Worker(process.env.PUBLIC_URL + "corelibs/video/ffmpeg-worker-wasm-webm.js");

    // Create video.
    let createVideo = (project) => {
      let workerMemoryFiles = [];

      // Get frame images from project, send to the video worker.
      let frameNumber = 0;
      project.generateImageSequence({imageType: 'image/jpeg'}, images => {
        // Load frame images into the web worker's memory
        images.forEach(image => {
          // Create Name and array buffer of frame image.
          let paddedNum = (frameNumber + '').padStart(12, '0');
          let name = "frame" + paddedNum + ".jpeg";

          // Get the base 64 value and convert it to an array buffer.
          let cleanBase64 = image.src.split(',')[1];
          let buffer = b64toBuff.decode(cleanBase64);

          // Store name and buffer in memfs appropriate object.
          let memfs_obj = {name: name, data:buffer};

          // Increase frame number.
          frameNumber += 1;

          // Add frame to frame list.
          workerMemoryFiles.push(memfs_obj);
        });

        // Merge audio into single WAV file
        project.generateAudioSequence({}, audioInfo => {
          this.mergeAudio(audioInfo, audioArraybuffer => {

            var pcmBuffer = this.bufferToRawPCM(audioArraybuffer, 0, audioArraybuffer.length);
            //window.saveAs(new Blob([wavBuffer], { type: "audio/wav" }), 'broken-wav.wav');
            //return;

            //var wavBuffer = this.bufferToWave(audioArraybuffer, 0, audioArraybuffer.length);
            //window.saveAs(wav, 'test2.wav');
            //window.saveAs(new Blob([wavBuffer], { type: "audio/wav" }), 'test.wav');
            /*let testaudioDataCleanBase64 = testwav.split(',')[1];
            let testaudioBuffer = b64toBuff.decode(testaudioDataCleanBase64);
            let testaudio_memfs_obj = {name: 'audiotrack.wav', data: testaudioBuffer};
            workerMemoryFiles.push(testaudio_memfs_obj);*/

            //var wavBuffer = this.bufferToWave(audioArraybuffer, 0, audioArraybuffer.length);
            let audiotrack_memfs_obj = {name: 'audiotrack.pcm', data: pcmBuffer};
            workerMemoryFiles.push(audiotrack_memfs_obj);

            // Build ffmpeg argument list.
            /*let ffmpegArgs = [
              '-r', project.framerate + '', // Framerate
              '-f', 'image2', // Format Type
              '-s', project.width + "x" + project.height, // Video Resolution
              '-i', 'frame%12d.jpeg', // File names for images
              '-i', 'audiotrack.wav',
              '-c:v', 'libvpx',  // Codec
              '-q:v', args.quality || 20, // Quality, Lower is better, 1-100.
              '-pix_fmt', 'yuv420p', // Pixel format, use -pix_fmts to see all supported.
              'out.webm', // Filename
            ];*/
            let ffmpegArgs = [
              /*'-f', 's16le',
              '-ar', '44.1k',
              '-ac', '2',
              '-i', 'audiotrack.pcm',
              'audiotrack.ogg',
              '-v', '100'*/
              '-formats',
            ];

            // Run the ffmpeg command.
            worker.postMessage({
              type: "run",
              MEMFS: workerMemoryFiles,
              arguments: ffmpegArgs,
            });
          });
        });
      });
    }

    // Tell the worker what to do on message.
    worker.onmessage = function(e) {
      var msg = e.data;
      switch (msg.type) {
      case "ready":
        createVideo(args.project);
        break;
      case "run":
        if (args.onRun) {
          args.onRun();
        }
        break;
      case "stdout":
        if (args.onMessage) {
          args.onMessage("stdout: " + msg.data)
        }
        break;
      case "stderr":
        if (args.onMessage) {
          args.onMessage("stderr: " + msg.data)
        }
        break;
      case "done":
        let vid = msg.data.MEMFS[0].data
        let blob = new Blob([new Uint8Array(vid)]);
        if (args.onDone) {
          args.onDone(blob);
        }
        break;
      case "exit":
        worker.terminate();
        break;
      case "error":
        if (args.onError) {
          args.onError(msg.data)
        }
        break;
      default:
        break;
      }
    };

  }
}

export default VideoExport;
