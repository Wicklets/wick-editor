class GIFExport {
  static createAnimatedGIFFromProject (project, done) {
    let gif = new window.GIF({
      workers: 2,
      quality: 10,
      width: project.width,
      height: project.height,
      workerScript: process.env.PUBLIC_URL + "/corelibs/gif/gif.worker.js",
    });
    gif.on('finished', done);

    project.generateImageSequence(project, images => {
      images.forEach(image => {
        gif.addFrame(image, {delay: 1000/project.framerate});
      });
      gif.render();
    });
  }
}

export default GIFExport;
