const { createWorker } = require('@ffmpeg/ffmpeg');
var b64toBuff = require('base64-arraybuffer');
var toWav = require('audiobuffer-to-wav')

class VideoExport {
    /**
     * project, onProgress, onError, onFinish;
     */
    static renderVideo = async (args) => {
      const worker = createWorker({
          logger: ({ message }) => console.log(message),
      });

      args.worker = worker;

      await worker.load();
      let audio = await VideoExport._generateAudioFile(args);
      let images = await VideoExport._generateProjectImages(args);
      await VideoExport._generateVideo({images:images, audio:audio, args});
    }

    static _generateAudioFile = async (args) => {

      let {project, onProgress} = args;

      onProgress && onProgress('Generating Audio Track...', 10);

      return new Promise (resolve => {
          project.generateAudioTrack({}, audioBuffer => {
              if(!audioBuffer) {
                resolve();
              } else {
                var wavBuffer = toWav(audioBuffer);
                resolve(new Uint8Array(wavBuffer));
              }
            });
      });
    }

    /**
     * Stores all frames of the project in the ffmpegjs memfs filesystem.
     */
    static _generateProjectImages = async (args) => {
        
      let { project, onProgress } = args;

      onProgress && onProgress('Rendering Images', 33);

      return new Promise( resolve => {
          let imageData = [];

          // Get frame images from project, send to the video worker.
          let frameNumber = 0;
          project.generateImageSequence({
              imageType: 'image/jpeg',

              onProgress: (currentFrame, numTotalFrames) => {
                let progress = 33 + (currentFrame/numTotalFrames) * 20;
                onProgress('Rendering Frame ' + currentFrame + '/' + numTotalFrames, progress);
              },

              onFinish: (images) => {
                // Load frame images into the web worker's memory
                onProgress('Converting Frames' , 70);
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

      onProgress("Rendering Final Video", 85);

      for (let i=0; i<images.length; i++) {
          let image = images[i]; 
          let { name, data } = image;
          await worker.write(name, data);
      }

      if (audio) {
          await worker.write('audio.wav', audio);
      }

      // Slow down the video if the framerate is less than 6 (framerate <6 causes a corrupted video to render)
      let filterv = 'showinfo';
      if(project.framerate < 6) {
          filterv = 'setpts='+(6/project.framerate)+'*PTS, ' + filterv;
      }

      let command = [
          '-r', '' + Math.max(6, project.framerate),
          '-f', 'image2',
          '-s', project.width + "x" + project.height,
          '-i', 'frame%12d.jpeg',
          '-i', 'audio.wav',
          '-vcodec', 'mpeg4',
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
        onProgress("Video Render Complete", 100);
        onFinish();

        window.saveAs(blob, project.name+'.mp4');
    }
}

export default VideoExport;