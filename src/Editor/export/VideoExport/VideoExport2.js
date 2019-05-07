import InspectorColorNumericInput from '../../Panels/Inspector/InspectorRow/InspectorRowTypes/InspectorColorNumericInput';

/**
 * PLEASE READ THIS BEFORE CONTINUING
 * 
 * The video exporter relies on a browser based version of ffmpeg called ffmpeg.js
 * originally converted by the user Kagami on Github. The repo can be found here:
 * https://github.com/Kagami/ffmpeg.js/
 * 
 * We currently use a Web Assembly compiled version of ffmpeg.js converted by
 * user picitujeromanov on Github. An original discussion of how this compilation came
 * to be can be found here: https://github.com/Kagami/ffmpeg.js/issues/10. This thread
 * should have links to compiled versions of the WASM ffmpeg.js.
 * 
 * A fork of picitujeromanov's Web Assembly repo of ffmpeg.js can be found at
 * https://github.com/Wicklets/wasm-ffmpeg.js. This repo may be private, so please
 * contact the Wick Editor staff (specifically, Luca) with any questions about it!
 */

var b64toBuff = require('base64-arraybuffer');

class VideoExport {
  constructor(args) {
    console.log("construct"); 
    this.video = null;
    this.audio = null;
    this.final = null;
    this.args = args;
    this.worker = new Worker(process.env.PUBLIC_URL + "corelibs/video/ffmpeg-worker-wasm-webm.js");
  }

  // Callback to set video element. If audio exists, combineAudioVideo is called.
  setVideo = (blob) => {
    this.video = blob; 

    VideoExport.createAudioFromProject(this.args, this);
  }

  // Callback to set audio element. If video exists, combineAudioVideo is called.
  setAudio = (blob) => {
    this.audio = blob;
    if (this.video) this.combineAudioVideo(); 
  }

  /** 
   * Will combine audio and video if they exist. When completed, the finished file will
   *  be passed to the onDone callback.
   */
  combineAudioVideo() {
    console.log("COMBINE");
    if (!this.video || !this.audio || !this.args.onDone) return;

    this.args.onDone(this.audio);
    // VideoExport.combineAudioAndVideo(this.args);
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
    console.log("renderVideo")
    let exporter = new VideoExport(args);

    console.log(exporter); 

    // Start video export process
    VideoExport.createVideoFromProject(args, exporter);
  }

  /**
   * Prepares a web worker for use with the video exporter API.
   * @param {WebWorker} worker web worker to prepare.
   * @param {Object}    args project arguments.
   * @param {Object}    opts optional values provided to web worker. Should contain:
   * action {function} required: callback which will be passed args on ready. If no action is provided, the worker will terminate on ready.
   * output {function} optional: callback which will be passed final product of action. If no output function is provided, the 
   * final product is passed to args.onDone.
   */
  static prepareWorker (worker, args, opts) {
    if (!worker || !args) return;

    // Tell the worker what to do on message.
    worker.onmessage = function(e) {
      var msg = e.data;
      switch (msg.type) {
        case "ready":
          if (opts && opts.action) {
            opts.action(args);
          } else {
            worker.terminate(); // If there's no action to complete, terminate the worker.
          }
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
          let valueOut = (msg.data.MEMFS && msg.data.MEMFS[0]) ? msg.data.MEMFS[0].data : null;
          if (opts && opts.output) {
            opts.output(valueOut);
          } else {
            args.onDone(valueOut);
          }
          break;
        case "exit":
          worker.terminate();
          break;
        case "error":
          if (args.onError) {
            args.onError(msg.data);
          }
          break; 
        }
      };
  }

  /**
   * Renders a video from the given project. This will only generate the visual elements of the video with no
   * audio.
   * @param {Object} args Project args.
   * @param {VideoExporter} exporter VideoExporter object to render to.
   */
  static createVideoFromProject (args, exporter) {
    if (!args || !args.project) return null;

    // Build ffmpeg argument list to generate a video from an array of images.
    let ffmpegArgs =     ['-r', args.project.framerate + '', // Framerate 
    '-f', 'image2', // Format Type
    '-s', args.project.width + "x" + args.project.height, // Video Resolution
    '-i', 'frame%12d.jpeg', // File naming scheme
    '-c:v', 'libvpx',  // Codec
    '-q:v', args.quality || 20, // Quality, Lower is better, 1-100.
    '-pix_fmt', 'yuv420p', // Pixel format, use -pix_fmts to see all supported.
    // '-vf', 'showinfo', // Spit out intermediate info.
    'out.webm']; // Filename

    let renderVideo = function (args) {
      // Get frame images from project, to send to the video worker.
      args.project.generateImageSequence({imageType: 'image/jpeg'}, images => {
        let frames = []; // Frame images stored as ArrayBuffers
        let frameNumber = 0;

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
          frames.push(memfs_obj);
        });

        // Tell worker to generate video when frames are ready.
        exporter.worker.postMessage({
          type: "run", 
          MEMFS: frames, 
          arguments: ffmpegArgs, 
        });
      });
    }

    // Prepare the worker to run all commands.
    VideoExport.prepareWorker(exporter.worker, args, {action: renderVideo, output: exporter.setVideo});
}

  /**
   * Renders an audio file of the given project. This will only generate audible elements of the project with
   * no visuals.
   * @param {Object} args Given project args.
   * @param {VideoExporter} exporter VideoExporter to export to.
   */
  static createAudioFromProject (args, exporter) {
    if (!args || !args.project) return null;

    let renderAudio = function (args) {
      // Get audo elements from project, to send to the video worker.
      args.project.generateAudioSequence({}, audioFiles => {
        console.log("AUDIO Generation"); 
        
        let audioNumber = 0;

        let audio = []; // Audio elements stored as ArrayBuffers
        let inputs = [] // input commands
        let delays = [] // delay commands
        let trims = [] // trim commands
        let variables = [] // variable names of everything to combine 

        audioFiles.forEach(audioFile => {
          // Create Name and array buffer of audio object.
          let paddedNum = (audioNumber + '').padStart(12, '0');
          let name = "audio" + paddedNum; 
          // Get the base 64 value and convert it to an array buffer.
          let cleanBase64 = audioFile.src.split(',')[1]; 
          let buffer = b64toBuff.decode(cleanBase64);
          // Store name and buffer in memfs appropriate object.
          let memfs_obj = {name: name, data:buffer};

          // Add audio to list
          audio.push(memfs_obj)

          //Add input command
          inputs.push('-i');
          inputs.push(name)

          // add delay command
          let delayVariable = 'a' + audioNumber;
          let defaultDelayString = '[<INDEX>]adelay=<DELAY>|<DELAY>[<INDEX_VARIABLE>]'; 
          let modDelayString = defaultDelayString.replace('<INDEX>', audioNumber);
          modDelayString = modDelayString.replace('<INDEX_VARIABLE>', delayVariable);
          modDelayString = modDelayString.replace(/<DELAY>/g, audioFile.start);
          delays.push(modDelayString);


          // add trim command
          let trimVariable = 'b' + audioNumber;
          let defaultTrimString = '[<DELAY_VARIABLE>]atrim=<START_SECOND>:<END_SECOND>[<TRIM_VARIABLE>]'
          let modTrimString = defaultTrimString.replace("<DELAY_VARIABLE>", delayVariable);
          modTrimString = modTrimString.replace('<START_SECOND>', audioFile.offset/1000);
          modTrimString = modTrimString.replace('<END_SECOND>', (audioFile.end - audioFile.start)/1000);
          modTrimString = modTrimString.replace('<TRIM_VARIABLE>', trimVariable);
          trims.push(modTrimString);


          // add variables
          variables.push('[' + trimVariable + ']');

          // Increase audio number. 
          audioNumber += 1;
        });


        let filterComplexCommand = '"' + delays.concat(trims).join('; ') + variables.join('') + 'amix=' + variables.length+',volume='+variables.length+'"';
        
        let output = 'out.ogg';

        // Build ffmpeg argument list to generate a video from an array of images.
        let ffmpegArgs = inputs.concat([
          '-filter_complex', filterComplexCommand,
          'out.ogg',
        ]);

        console.log(ffmpegArgs);

        // Tell worker to generate single audio file when audio is ready.
        exporter.worker.postMessage({
          type: "run", 
          MEMFS: audio, 
          arguments: ffmpegArgs, 
        });
      });
    }

    // Prepare the worker to run all commands.
    VideoExport.prepareWorker(exporter.worker, args, {action: renderAudio, output: exporter.setAudio});
  }
}

export default VideoExport;
