var b64toBuff = require('base64-arraybuffer');

class VideoExport {
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
    let createVideo = function (project) {
      let frames = [];

      let frameNumber = 0;

      // Get frame images from project, send to the video worker.
      project.generateImageSequence({imageType: 'image/jpeg'}, images => {
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
        
        // Build ffmpeg argument list.
        let ffmpegArgs =     ['-r', project.framerate + '', // Framerate 
                        '-f', 'image2', // Format Type
                        '-s', project.width + "x" + project.height, // Video Resolution
                        '-i', 'frame%12d.jpeg', // File naming scheme
                        '-c:v', 'libvpx',  // Codec
                        '-q:v', args.quality || 20, // Quality, Lower is better, 1-100.
                        '-pix_fmt', 'yuv420p', // Pixel format, use -pix_fmts to see all supported.
                        // '-vf', 'showinfo', // Spit out intermediate info.
                        'out.webm']; // Filename
        
        // Run the ffmpeg command.
        worker.postMessage({
          type: "run", 
          MEMFS: frames, 
          arguments: ffmpegArgs, 
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
      }
    };

  }
}

export default VideoExport;
