describe('Wick.ImageAsset', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var image = new Wick.ImageAsset({
                filename:'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });

            expect(image instanceof Wick.Asset).to.equal(true);
            expect(image instanceof Wick.ImageAsset).to.equal(true);
            expect(image.classname).to.equal('ImageAsset');
        });
    });
/*
    describe('#serialize', function () {
        it('should serialize correctly', function() {
            var asset = new Wick.ImageAsset('test.png', TEST_IMG_SRC_PNG);
            var data = asset.serialize();

            expect(data.classname).to.equal('ImageAsset');
        });
    });

    describe('#_deserialize', function () {
        it('should deserialize correctly', function() {
            var data = {
                classname: 'ImageAsset',
                src: TEST_IMG_SRC_PNG,
            };
            var asset = Wick.ImageAsset.deserialize(data);

            expect(asset instanceof Wick.ImageAsset).to.equal(true);
        });
    });
*/
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

    describe('#removeAllInstances', function () {
        it('should delete all instances of the asset in the project', function (done) {
            var project = new Wick.Project();
            var asset = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            project.addAsset(asset);

            asset.createInstance((path) => {
                project.activeFrame.addPath(path);
                expect(project.activeFrame.paths.length).to.equal(1);
                project.removeAsset(asset);
                expect(project.activeFrame.paths.length).to.equal(0);
                done();
            });
        });
    });
});
