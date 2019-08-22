class GIFExport {
  /**
   * Create an animated GIF from a Wick project.
   * @param {Wick.Project} project - the Wick project to create a GIF out of.
   * @param {function} done - Callback that passes the GIF file as a blob when the GIF is done rendering.
   */
  static createAnimatedGIFFromProject (args) {
    let { project, onProgress, onFinish } = args;

    onProgress("Creating Gif", 10);

    // Initialize GIF.js
    let gif = new window.GIF({
      workers: 2,
      quality: 5,
      width: project.width,
      height: project.height,
      workerScript: process.env.PUBLIC_URL + "/corelibs/gif/gif.worker.js",
    });

    gif.on('finished', (gif) => {
      onFinish(gif);
    });

    let combineImageSequence = images => {
      images.forEach(image => {
        // Add frame to gif.
        gif.addFrame(image, {delay: 1000/project.framerate});
      });
      gif.render(); // Finalize gif render.
    }

    let updateProgress = (completed, maxFrames) => {
      // Change visual of the loading bar
      let message = "Rendered " + completed + "/" + maxFrames + " frames";
      let percentage = 10 + (90 * (completed/maxFrames));
      onProgress(message, percentage);
    }

    // Get frame images from project, add to GIF.js
    project.generateImageSequence({
      onFinish: combineImageSequence, 
      onProgress: updateProgress,
    });
  }
}

export default GIFExport;
