describe('Wick.WickObjectFile', function () {
    it('should create and load a wickobject file for a simple clip', function (done) {
        var project = new Wick.Project();
        var clip = new Wick.Clip();
        clip.identifier = 'testclip';
        clip.activeFrame.identifier = 'testframe';

        Wick.WickObjectFile.toWickObjectFile(clip, wickObjectFile => {
            //saveAs(wickObjectFile, 'wickobject.json')
            Wick.WickObjectFile.fromWickObjectFile(wickObjectFile, clipData => {
                var clipCopy = Wick.Base.import(clipData, project).copy();
                project.addObject(clipCopy);
                expect(clipCopy.activeFrame.identifier).to.equal('testframe');
                done();
            });
        });
    });
});
