describe('Wick.GIFAsset', function() {
    describe('#fromImages', function () {
        it('should create a ClipAsset with given images', function(done) {
            var project = new Wick.Project();

            var image1 = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            var image2 = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            var image3 = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });

            project.addAsset(image1);
            project.addAsset(image2);
            project.addAsset(image3);

            project.loadAssets(() => {
                Wick.GIFAsset.fromImages([image1, image2, image3], project, gifAsset => {
                    project.addAsset(gifAsset);
                    gifAsset.createInstance(instance => {
                        expect(instance instanceof Wick.Clip).to.equal(true);
                        var layer = instance.timeline.layers[0];
                        expect(layer.frames.length).to.equal(3);
                        var frame1 = layer.getFrameAtPlayheadPosition(1);
                        var frame2 = layer.getFrameAtPlayheadPosition(2);
                        var frame3 = layer.getFrameAtPlayheadPosition(3);
                        console.log(frame1.paths[0])
                        //expect(instance.timeline.layers[0].frames[0].paths[0]).to.equal(3);
                        done();
                    }, project);
                });
            });
        });
    });
});
