import * as fastgif from './fastgif.js';

class GIFImport {
  static importGIFIntoProject (args) {
    let { gifFile, project, onFinish } = args;

    var a = new FileReader();
    a.onload = (e) => {
      var buf = e.target.result;

      var dataURLs = [];

      const wasmDecoder = new fastgif.Decoder();
      wasmDecoder.decode(buf).then(decoded => {
        var tempCanvas = document.createElement('canvas');
        var tempCtx = tempCanvas.getContext('2d');
        decoded.forEach(frame => {
          tempCanvas.width = frame.imageData.width;
          tempCanvas.height = frame.imageData.height;
          tempCtx.putImageData(frame.imageData, 0, 0);
          dataURLs.push(tempCanvas.toDataURL());
        });

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
                gifAsset.name = gifFile.name;
                gifAsset.filename = gifFile.name;
                onFinish(gifAsset);
            });
        })
      });
    }
    a.readAsArrayBuffer(gifFile);
  }
}

export default GIFImport;
