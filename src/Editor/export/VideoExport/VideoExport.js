var b64toBuff = require('base64-arraybuffer');
var toWav = require('audiobuffer-to-wav')

class VideoExport {
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
      var wav = toWav(mergedAudioBuffer);
      callback(wav);

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

          console.log(buffer)

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
            console.log(audioArraybuffer)
            window.saveAs(new Blob([audioArraybuffer], { type: "audio/wav" }), 'test.wav');
            //let testaudioDataCleanBase64 = base64.split(',')[1];
            //let testaudioBuffer = b64toBuff.decode(testaudioDataCleanBase64);
            let testaudio_memfs_obj = {name: 'audiotrack.wav', data: audioArraybuffer};
            workerMemoryFiles.push(testaudio_memfs_obj);

            // Build ffmpeg argument list.
            let ffmpegArgs = [
              '-r', project.framerate + '', // Framerate
              '-f', 'image2', // Format Type
              '-s', project.width + "x" + project.height, // Video Resolution
              '-i', 'frame%12d.jpeg', // File names for images
              '-i', 'audiotrack.wav',
              '-c:v', 'libvpx',  // Codec
              '-q:v', args.quality || 20, // Quality, Lower is better, 1-100.
              '-pix_fmt', 'yuv420p', // Pixel format, use -pix_fmts to see all supported.
              // '-vf', 'showinfo', // Spit out intermediate info.
              'out.webm', // Filename
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
        console.log(blob);
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
