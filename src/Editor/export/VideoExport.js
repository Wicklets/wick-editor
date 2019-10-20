var b64toBuff = require('base64-arraybuffer');
var toWav = require('audiobuffer-to-wav')

class FFMPEG {
  get onProgress () {
      return this._onProgress || (() => {});
  }

  set onProgress (onProgress) {
      this._onProgress = onProgress;
  }

  get onError () {
    return this._onError || (() => {});
  }

  set onError (onError) {
    this._onError = onError;
  }

  get onDone () {
      return this._onDone || (() => {});
  }

  set onDone (onDone) {
      this._onDone = onDone;
  }

  constructor () {
    this._isReady = false;

    this._worker = new Worker("corelibs/video/worker-asm.js");
    this._worker.onmessage = (e) => {
      var msg = e.data;
      console.log('from worker:' + msg.type + ':');
      console.log(msg.data);
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
          this.onError(msg.data[0].data);
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
  static renderVideo (args) {
    if(!args.project) console.error('VideoExport: project is required.');
    if(!args.onProgress) console.error('VideoExport: onProgress is required.');
    if(!args.onFinish) console.error('VideoExport: onFinish is required.');

    args.onProgress('Rendering video frames', 10);
    this._generateVideoFile(args.project, videoFiles => {
      args.onProgress('Rendering audio track', 33);
      this._generateAudioFiles(args.project, audioFiles => {
        args.onProgress('Mixing video and audio', 66);
        this._mixAudioAndVideoFiles(args.project, videoFiles, audioFiles, videoWithAudio => {
          args.onProgress('Finished video export', 100);
          this._saveVideoFile(args.project, videoWithAudio);
          args.onFinish();
        });
      });
    })
  }

  static get _ffmpeg () {
    // lazily create ffmpeg instance
    if(!this._ffmpegInstance) {
      this._ffmpegInstance = new FFMPEG();
    }
    return this._ffmpegInstance;
  }

  static _generateImageFiles (project, callback) {
    var imageFiles = [];

    // Get frame images from project, send to the video worker.
    let frameNumber = 0;
    project.generateImageSequence({
      imageType: 'image/jpeg',
      onProgress: (currentFrame, numTotalFrames) => {
        console.log('rendering frame: ' + currentFrame + '/' + numTotalFrames);
      },
      onFinish: images => {
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
      },
    });
  }

  static _generateAudioFiles (project, callback) {
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

  static _generateVideoFile (project, callback) {
    this._generateImageFiles(project, imageFiles => {
      this._ffmpeg.onDone = videoData => {
        let videoFiles = [{
          name: 'video-no-sound.mp4',
          data: new Uint8Array(videoData),
        }];
        callback(videoFiles);
      };
      this._ffmpeg.run([
        '-r', project.framerate + '',
        '-f', 'image2',
        '-s', project.width + "x" + project.height,
        '-i', 'frame%12d.jpeg',
        '-vcodec', 'mpeg4',
        '-q:v', '10', //10=good quality, 31=bad quality
        '-vf', 'showinfo',
        'out.mp4',
      ], imageFiles, 'images_to_video');
    });
  }

  static _mixAudioAndVideoFiles (project, videoFiles, audioFiles, callback) {
    if(audioFiles.length === 0) {
      callback(videoFiles[0].data);
    } else {
      let videoAndAudioFiles = audioFiles.concat(videoFiles);
      this._ffmpeg.onDone = videoWithSoundData => {
        callback(videoWithSoundData);
      };
      this._ffmpeg.run([
        '-r', project.framerate,
        '-i', 'video-no-sound.mp4',
        '-i', 'audiotrack.wav',
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-strict', '-2',
        'out.mp4',
      ], videoAndAudioFiles, 'add_audio_track');
    }
  }

  static _saveVideoFile (project, data) {
    if(!(data instanceof Uint8Array)) {
      data = new Uint8Array(data);
    }

    let blob = new Blob([data]);
    window.saveAs(blob, project.name+'.mp4');
  }
}

export default VideoExport;
