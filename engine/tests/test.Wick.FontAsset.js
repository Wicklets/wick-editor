describe('Wick.FontAsset', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function(done) {
            var font = new Wick.FontAsset({
                filename: 'ABeeZee.ttf',
                fontFamily: 'ABeeZee',
                src: TestUtils.TEST_FONT_SRC_TTF,
            });

            font.load(() => {
                expect(font.MIMEType).to.equal('font/ttf');
                expect(font.fileExtension).to.equal('ttf');
                expect(document.fonts.check("12px ABeeZee")).to.equal(true);
                done();
            });
        });
    });

    describe('#MIMEType', function () {
        it('get MIMEType should return correct MIME type', function() {

        });
    });

    describe('#fileExtension', function () {
        it('get fileExtension should return correct file extension', function() {

        });
    });

    describe('#copy', function () {
        it('should copy correctly', function () {

        });
    });

    describe('#removeAllInstances', function () {
        it('should delete all instances of the asset in the project', function () {
            var project = new Wick.Project();
            var fontAsset = new Wick.FontAsset({
                filename: 'ABeeZee.ttf',
                src: TestUtils.TEST_FONT_SRC_TTF
            });
            project.addAsset(fontAsset);

            expect(fontAsset.hasInstances()).to.equal(false);
            project.activeFrame.addPath(TestUtils.paperToWickPath(new paper.PointText()))
            project.activeFrame.paths[0].fontFamily = 'ABeeZee';
            expect(fontAsset.hasInstances()).to.equal(true);

            project.removeAsset(fontAsset);
            expect(project.activeFrame.paths[0].fontFamily).to.equal(Wick.FontAsset.MISSING_FONT_DEFAULT);
        });
    });
});
