import AudioExport from './AudioExport';

const { createWorker } = require('@ffmpeg/ffmpeg');
const { setLogging } = require('@ffmpeg/ffmpeg');
var b64toBuff = require('base64-arraybuffer');

var ENABLE_LOGGING = false;
var EXPORT_IMAGE_START = 10;
var EXPORT_AUDIO_START = 40;
var EXPORT_VIDEO_START = 70;

class VideoExport {
    /**
     * project, onProgress, onError, onFinish;
     */
    static renderVideo = async (args) => {
      let fullLog = "";

      setLogging(ENABLE_LOGGING);
      const worker = createWorker({
          logger: ({message}) => {
              if(ENABLE_LOGGING) {
                  console.log(message);
              } else {
                  fullLog += message + "\n";
              }
              VideoExport._parseProgressMessage(message, args);
          },
      });

      args.worker = worker;

      await worker.load();
      let images = await VideoExport._generateProjectImages(args);

      let soundInfo = [...args.project.soundsPlayed]; // Make a deepcopy of the sound info.
      args.soundInfo = soundInfo;

      let audio = await VideoExport._generateAudioFile(args);

      await VideoExport._generateVideo({images:images, audio:audio, args});
    }

    static _generateAudioFile = async (args) => {
      let {project, onProgress} = args;

      onProgress && onProgress('Generating Audio Track...', EXPORT_AUDIO_START);

      return AudioExport.generateAudioFile(args);
    }

    /**
     * Stores all frames of the project in the ffmpegjs memfs filesystem.
     */
    static _generateProjectImages = async (args) => {

      let { project, onProgress } = args;
      let dimensions = VideoExport._ensureValidDimensions(args.width || project.width, args.height || project.height);

      onProgress && onProgress('Rendering Images', EXPORT_IMAGE_START);

      return new Promise( resolve => {
          let imageData = [];

          // Get frame images from project, send to the video worker.
          let frameNumber = 0;
          project.generateImageSequence({
              imageType: 'image/jpeg',

              width: dimensions.width,
              height: dimensions.height,

              onProgress: (currentFrame, numTotalFrames) => {
                let progress = EXPORT_IMAGE_START + (currentFrame/numTotalFrames) * 20;
                onProgress('Rendering Frame ' + currentFrame + '/' + numTotalFrames, progress);
              },

              onFinish: (images) => {
                // Load frame images into the web worker's memory
                onProgress('Converting Frames' , EXPORT_AUDIO_START);
                images.forEach(image => {
                // Create Name and array buffer of frame image.
                let paddedNum = (frameNumber + '').padStart(12, '0');
                let name = "frame" + paddedNum + ".jpeg";

                // Get the base 64 value and convert it to an array buffer.
                let cleanBase64 = image.src.split(',')[1];
                let buffer = b64toBuff.decode(cleanBase64);

                // Store name and buffer in memfs appropriate object.
                imageData.push({name:name, data:new Uint8Array(buffer)});

                // Increase frame number.
                frameNumber += 1;
              });

                resolve(imageData);
              },
          });
      });
    }

    static _generateVideo = async ({images, audio, args}) => {
      let { project, onProgress, onFinish, worker } = args;

      onProgress("Rendering Final Video", EXPORT_VIDEO_START);

      for (let i=0; i<images.length; i++) {
          let image = images[i];
          let { name, data } = image;
          await worker.write(name, data);
      }

      let inputs = '-i frame%12d.jpeg';

      if (audio) {
          await worker.write('audio.wav', audio);
          inputs += ' -i audio.wav';
      }

      // Slow down the video if the framerate is less than 6 (framerate <6 causes a corrupted video to render)
      let filterv = 'showinfo';
      if(project.framerate < 6) {
          filterv = 'setpts='+(6/project.framerate)+'*PTS, ' + filterv;
      }

      let dimensions = {
          width: args.width || project.width,
          height: args.height || project.height,
      };
      dimensions = VideoExport._ensureValidDimensions(dimensions.width, dimensions.height);

      let command = [
          '-r', '' + Math.max(6, project.framerate),
          '-s', dimensions.width + "x" + dimensions.height,
          inputs,
          '-profile:v', 'main',
          '-pix_fmt', 'yuv420p',
          '-c:v', 'libx264',
          '-q:v', '10', //10=good quality, 31=bad quality
          '-filter:v', filterv,
          'out.mp4',
        ]

        await worker.run(command.join(" "), {output: 'out.mp4'});
        const { data } = await worker.read('out.mp4');

        // Remove Data from worker when done.
        for (let i=0; i<images.length; i++) {
          let image = images[i];
          let { name } = image;
          await worker.remove(name);
        }

        if (audio) {
          await worker.remove('audio.wav', audio);
        }

        await worker.terminate();

        if(!(data instanceof Uint8Array)) {
          data = new Uint8Array(data);
        }

        let blob = new Blob([data]);
        onProgress("Video Render Complete: Downloading...", 90);
        onFinish();

        window.saveAs(blob, project.name+'.mp4');
    }

    // ffmpeg does not like odd numbers in the video width/height.
    // this chops off pixels to ensure an even width/height
    // this may be an issue specifically with the h264 codec:
    // https://stackoverflow.com/questions/20847674/ffmpeg-libx264-height-not-divisible-by-2
    static _ensureValidDimensions (width, height) {
        var newWidth = width;
        var newHeight = height;

        if(newWidth % 2 === 1) {
            newWidth -= 1;
        }
        if(newHeight % 2 === 1) {
            newHeight -= 1;
        }

        return {
            width: newWidth,
            height: newHeight
        };
    }

    static _parseProgressMessage (message, args) {
        if(!message) return
        if(!message.includes('pts_time:')) return;

        var time;

        time = message.split('pts_time');
        if(!time) return;
        time = time[1];
        if(!time) return;
        time = time.split('pos');
        if(!time) return;
        time = time[0];
        if(!time) return;
        time = time.replace(":", "");
        if(!time) return;
        let timeNumber = Number(time);
        timeNumber = timeNumber.toFixed(2);

        args.onProgress('Rendered: ' + timeNumber + ' seconds', 85);
    }
}

export default VideoExport;
