describe('Wick.ImageAsset', function() {
    var TEST_IMG_SRC_PNG = 'data:image/png;base64,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';

    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var image = new Wick.ImageAsset('test.png', TEST_IMG_SRC_PNG);

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
            var image = new Wick.ImageAsset('test.png', TEST_IMG_SRC_PNG);
            expect(image.MIMEType).to.equal('image/png');
        });
    });

    describe('#fileExtension', function () {
        it('get fileExtension should return correct file extension', function() {
            var image = new Wick.ImageAsset('test.png', TEST_IMG_SRC_PNG);
            expect(image.fileExtension).to.equal('png');
        });
    });

    describe('#removeAllInstances', function (done) {
        it('should delete all instances of the asset in the project', function () {
            var project = new Wick.Project();
            var asset = new Wick.ImageAsset('test.png', TEST_IMG_SRC_PNG);
            project.addAsset(asset);

            asset.createInstance((path) => {
                project.activeFrame.addPath(path);
                expect(project.activeFrame.paths.length).to.equal(1);
                project.removeAsset(asset);
                expect(project.activeFrame.paths.length).to.equal(0);
            });
        });
    });
});
