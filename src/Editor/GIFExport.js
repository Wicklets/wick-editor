class GIFExport {
  static createAnimatedGIFFromProject (project, done) {
    // Prepare separate project to render GIF frames
    let p = project.clone();
    let container = window.document.createElement('div');
    container.style.width = p.width+'px';
    container.style.height = p.height+'px';
    window.document.body.appendChild(container);
    p.view.setCanvasContainer(container);
    p.view.resize();
    p.focus = p.root;
    p.focus.timeline.playheadPosition = 1;
    p.zoom = 1 / window.devicePixelRatio;
    p.pan = {x:p.width/2*window.devicePixelRatio, y:p.height/2*window.devicePixelRatio};

    // Render GIF from project
    let gif = new window.GIF({
      workers: 2,
      quality: 10,
      width: p.width,
      height: p.height,
      workerScript: process.env.PUBLIC_URL + "/corelibs/gif/gif.worker.js",
    });
    gif.on('finished', done);

    var imgs = [];
    function renderFrame () {
      var img = new Image();
      img.onload = function(){
        p.focus.timeline.playheadPosition++;
        imgs.push(img);
        if(p.focus.timeline.playheadPosition > p.focus.timeline.length) {
          renderGIF();
        } else {
          renderFrame();
        }
      }
      window.paper.view.autoUpdate = false;
      p.view.render();
      window.paper.view.update();
      img.src = p.view.canvas.toDataURL();
    }
    renderFrame();

    function renderGIF () {
      window.paper.view.autoUpdate = true;
      imgs.forEach(img => {
        gif.addFrame(img, {delay: 1000/p.framerate});
      });
      gif.render();
    }

  }
}

export default GIFExport;
