var b64toBuff = require('base64-arraybuffer');
var toWav = require('audiobuffer-to-wav')

class FFMPEG {
  get onMessage () {
      return this._onMessage || (() => {});
  }

  set onMessage (onMessage) {
      this._onMessage = onMessage;
  }

  get onDone () {
      return this._onDone || (() => {});
  }

  set onDone (onDone) {
      this._onDone = onDone;
  }

  constructor () {
    this._isReady = false;

    this._worker = new Worker(process.env.PUBLIC_URL + "corelibs/video/worker-asm.js");
    this._worker.onmessage = (e) => {
      var msg = e.data;
      console.log(msg)
      switch (msg.type) {
        case "ready":
          this._isReady = true;
          break;
        case "run":
          break;
        case "stdout":
          break;
        case "stderr":
          break;
        case "done":
          this.onDone(msg.data[0].data);
          break;
        case "exit":
          this._worker.terminate();
          break;
        case "error":
          break;
        default:
          break;
      }
    };
  }

  run (ffmpegArgs, workerMemoryFiles, commandName) {
    this._waitUntilReady(() => {
      this._worker.postMessage({
        type: "command",
        arguments: ffmpegArgs,
        files: workerMemoryFiles,
        commandName: 'video_render',
      });
    });
  }

  _waitUntilReady (callback) {
    var waitUntilReadyInterval = setInterval(() => {
      if(this._isReady) {
        clearInterval(waitUntilReadyInterval);
        callback();
      }
    }, 10);
  }
}

class VideoExport {
  static get ffmpeg () {
    // lazily create ffmpeg instance
    if(!this._ffmpeg) {
      this._ffmpeg = new FFMPEG();
    }
    return this._ffmpeg;
  }

  static renderVideo (project, callback) {
    this.generateImageFiles(project, imageFiles => {
      this.ffmpeg.onDone = videoData => {
        console.log('images->video');
        console.log(videoData);

        // TODO: Add audio track to video:
        this.generateAudioFiles(project, audioFiles => {
          audioFiles = [];
          if(audioFiles.length === 0) {
            let blob = new Blob([new Uint8Array(videoData)]);
            window.saveAs(blob, 'result.mp4');
            callback();
          } else {
            let videoFiles = [{
              name: 'video-no-sound.mp4',
              data: new Uint8Array(videoData),
            }]
            let videoAndAudioFiles = audioFiles.concat(videoFiles)
            this.ffmpeg.onDone = videoWithSoundData => {
              console.log('add audio track:');
              console.log(videoWithSoundData)
              let blob = new Blob([new Uint8Array(videoWithSoundData)]);
              window.saveAs(blob, 'result.mp4');
            };
            //ffmpeg -i input.mp4 -i input.wav -c:v copy -map 0:v:0 -map 1:a:0 -c:a aac -b:a 192k output.mp4
            //ffmpeg -i input.mp4 -i input.mp3 -c copy -map 0:v:0 -map 1:a:0 output.mp4
            this.ffmpeg.run([
              '-i', 'video-no-sound.mp4',
              //'-i', 'audiotrack.wav',
              //'-c', 'copy',
              //'-map', '0:v:0',
              //'-map', '1:a:0',
              //'-c', 'aac',
              //'-b:a', '192k',
              'out.mp4',
            ], videoAndAudioFiles, 'add_audio_track');
          }
        });
        callback();
      };
      this.ffmpeg.run([
        '-r', project.framerate + '',
        '-f', 'image2',
        '-s', project.width + "x" + project.height,
        '-i', 'frame%12d.jpeg',
        '-vcodec', 'mpeg4',
        '-q:v', '10', //10=good quality, 31=bad quality
        'out.mp4',
      ], imageFiles, 'images_to_video');
    });
  }

  static generateAudioFiles (project, callback) {
    project.generateAudioTrack({}, audioBuffer => {
      if(!audioBuffer) {
        callback([]);
      } else {
        var wavBuffer = toWav(audioBuffer);
        let memfs_obj = {name: 'audiotrack.wav', data: new Uint8Array(wavBuffer)};
        callback([memfs_obj]);
      }
    });
  }

  static generateImageFiles (project, callback) {
    var imageFiles = [];

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
        let memfs_obj = {name: name, data:new Uint8Array(buffer)};

        // Increase frame number.
        frameNumber += 1;

        // Add frame to frame list.
        imageFiles.push(memfs_obj);
      });

      callback(imageFiles);
    });
  }
}

export default VideoExport;
