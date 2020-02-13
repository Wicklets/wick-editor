class GIFImport {
  static importGIFIntoProject (args) {
    let { gifFile, project, onProgress, onFinish } = args;

    onProgress('Decoding GIF', 10);
    console.log('Decoding GIF...');
    console.log(gifFile);

    var a = new FileReader();
    a.onload = (e) => {
        var arrayBuffer = e.target.result;

        var gif = new window.GIF(arrayBuffer);
        var frames = gif.decompressFrames(true);

        var frameImageData;
        var dataURLs = [];

        var tempCanvas = document.createElement('canvas');
        var tempCtx = tempCanvas.getContext('2d');
        // full gif canvas
        var gifCanvas = document.createElement('canvas');
        var gifCtx = gifCanvas.getContext('2d');

        gifCanvas.style.position = 'absolute';
        gifCanvas.style.left = '0px';
        gifCanvas.style.top = '0px';
        //document.body.appendChild(gifCanvas);

        frames.forEach(frame => {
            var dims = frame.dims;

          	if(!frameImageData || dims.width != frameImageData.width || dims.height != frameImageData.height){
            		tempCanvas.width = dims.width;
            		tempCanvas.height = dims.height;
                gifCanvas.width = dims.width;
	              gifCanvas.height = dims.height;
            		frameImageData = tempCtx.createImageData(dims.width, dims.height);
          	}

            // set the patch data as an override
          	frameImageData.data.set(frame.patch);

          	// draw the patch back over the canvas
          	tempCtx.putImageData(frameImageData, 0, 0);

          	gifCtx.drawImage(tempCanvas, dims.left, dims.top);
            dataURLs.push(gifCanvas.toDataURL());
        })

        var imageAssets = [];
        dataURLs.forEach(dataURL => {
            var imageAsset = new window.Wick.ImageAsset({
                filename: gifFile.name + '_' + dataURLs.indexOf(dataURL) + '.png',
                src: dataURL,
            });
            project.addAsset(imageAsset);
            imageAssets.push(imageAsset);
        });
        project.loadAssets(() => {
            window.Wick.GIFAsset.fromImages(imageAssets, project, gifAsset => {
                onFinish(gifAsset);
            });
        })
    }
    a.readAsArrayBuffer(gifFile);
  }
}

export default GIFImport;
