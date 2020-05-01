describe('Wick.ImageAsset', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var image = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });

            expect(image instanceof Wick.Asset).to.equal(true);
            expect(image instanceof Wick.ImageAsset).to.equal(true);
            expect(image.classname).to.equal('ImageAsset');
        });
    });

    describe('#MIMEType', function () {
        it('get MIMEType should return correct MIME type', function() {
            var image = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            expect(image.MIMEType).to.equal('image/png');
        });
    });

    describe('#fileExtension', function () {
        it('get fileExtension should return correct file extension', function() {
            var image = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            expect(image.fileExtension).to.equal('png');
        });
    });

    describe('#copy', function () {
        it('should copy correctly', function () {
            var image = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });

            var copy = image.copy();

            expect(copy.src).to.equal(image.src);
            expect(copy.filename).to.equal('foo.png');
            expect(copy.fileExtension).to.equal('png');
            expect(copy.MIMEType).to.equal('image/png');
        });
    });

    describe('#createInstance', function () {
        it('should create image path without errors', function (done) {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(imageAsset);

            imageAsset.createInstance(path => {
                expect(path.view.item.bounds.width).to.equal(100);
                done();
            });
        });
    })

    describe('#getInstances', function () {
        it('should return all instances of a given ImageAsset', function (done) {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(imageAsset);

            imageAsset.createInstance(path => {
                expect(imageAsset.hasInstances()).to.equal(false);
                project.activeFrame.addPath(path);
                expect(imageAsset.hasInstances()).to.equal(true);
                expect(imageAsset.getInstances()[0]).to.equal(path);
                done();
            });
        });
    })
});
