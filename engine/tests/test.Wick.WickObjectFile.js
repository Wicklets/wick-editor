describe('Wick.WickObjectFile', function () {
    it('should create and load a wickobject file for a simple clip', function (done) {
        var project = new Wick.Project();
        var clip = new Wick.Clip();
        clip.identifier = 'testclip';
        clip.activeFrame.identifier = 'testframe';

        Wick.WickObjectFile.toWickObjectFile(clip, file => {
            Wick.WickObjectFile.fromWickObjectFile(file, clipCopy => {

            });
        });
    });
});
