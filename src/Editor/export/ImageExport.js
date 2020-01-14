class ImageExport {
    /**
     * Create image archive
     * @param {Wick.Project} project - the Wick project to create a GIF out of.
     * @param {function} onProgress - Callback that passes the amount of progress back.
     * @param {function} onFinish - Callback that passes the GIF file as a blob when the GIF is done rendering.
     */
    static generateImageSequence (args) {
      let { project, onProgress, onFinish } = args;
  
      onProgress("Generating Image Sequence", 10);
  
      let updateProgress = (completed, maxFrames) => {
        // Change visual of the loading bar
        let message = "Rendered " + completed + "/" + maxFrames + " frames";
        let percentage = 10 + (90 * (completed/maxFrames));
        onProgress(message, percentage);
      }

      let completeCallback = (file) => {
        window.saveAs(file, project.name+'_imageSequence.zip');
        onFinish(file); 
      }
      
      // Get frame images from project, add to GIF.js
      project.generateImageSequence({
        onFinish: completeCallback,
        onProgress: updateProgress,
      });
    }
  }
  
  export default ImageExport;
  