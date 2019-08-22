class GIFExport {
  /**
   * Create an animated GIF from a Wick project.
   * @param {Wick.Project} project - the Wick project to create a GIF out of.
   * @param {function} done - Callback that passes the GIF file as a blob when the GIF is done rendering.
   */
  static createAnimatedGIFFromProject (args) {
    let { project, onProgress, onFinish } = args;

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
      let totalImages = images.length;
      let completed = 0;
      images.forEach(image => {
        // Change visual of the loading bar
        let message = "Rendered " + completed + "/" + totalImages + " frames";
        let percentage = 10 + (90 * (completed/totalImages));
        onProgress(message, percentage);

        // Add frame to gif.
        gif.addFrame(image, {delay: 1000/project.framerate});
      });
      gif.render(); // Finalize gif render.
    }

    // Get frame images from project, add to GIF.js
    project.generateImageSequence({
      onFinish: combineImageSequence, 
    });
  }
}

export default GIFExport;
