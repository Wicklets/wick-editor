var b64toBuff = require('base64-arraybuffer');
var toWav = require('audiobuffer-to-wav')

class VideoExport {
  static renderProjectFramesAsVideo (project, worker) {
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
        let memfs_obj = {name: name, data:new Uint8Array(buffer)};

        // Increase frame number.
        frameNumber += 1;

        // Add frame to frame list.
        workerMemoryFiles.push(memfs_obj);
      });
    });

    let ffmpegArgs = [
      '-r', project.framerate + '',
      '-f', 'image2',
      '-s', project.width + "x" + project.height,
      '-i', 'frame%12d.jpeg',
      '-vcodec', 'mpeg4',
      '-q:v', '31',
      'out.mp4',
    ];

    worker.postMessage({
      type: "command",
      arguments: ffmpegArgs,
      files: workerMemoryFiles,
      commandName: 'video_render',
    });
  }

  static renderProjectAsVideo (args) {
    var worker = new Worker(process.env.PUBLIC_URL + "corelibs/video/worker-asm.js");

    // Tell the worker what to do on message.
    worker.onmessage = function(e) {
      console.log(e);

      var msg = e.data;
      switch (msg.type) {
      case "ready":
        this.renderProjectFramesAsVideo(args.project, worker);
        break;
      case "run":
        if (args.onRun) {
          args.onRun();
        }
        break;
      case "stdout":
        if (args.onMessage) {
          //args.onMessage("stdout: " + msg.data)
        }
        break;
      case "stderr":
        if (args.onMessage) {
          //args.onMessage("stderr: " + msg.data)
        }
        break;
      case "done":
        /*let vid = msg.data[0].data;
        let blob = new Blob([new Uint8Array(vid)]);
        if (args.onDone) {
          args.onDone(blob);
        }*/
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
