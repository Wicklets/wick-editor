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
                src: TestUtils.TEST_IMG_SRC_PNG_2
            });
            var image3 = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG_3
            });

            project.addAsset(image1);
            project.addAsset(image2);
            project.addAsset(image3);

            project.loadAssets(() => {
                Wick.GIFAsset.fromImages([image1, image2, image3], project, gifAsset => {
                    project.addAsset(gifAsset);
                    gifAsset.createInstance(instance => {
                        project.activeFrame.addClip(instance);
                        expect(instance instanceof Wick.Clip).to.equal(true);
                        var layer = instance.timeline.layers[0];
                        expect(layer.frames.length).to.equal(3);
                        var frame1 = layer.getFrameAtPlayheadPosition(1);
                        var frame2 = layer.getFrameAtPlayheadPosition(2);
                        var frame3 = layer.getFrameAtPlayheadPosition(3);
                        expect(frame1).to.not.equal(frame2);
                        expect(frame2).to.not.equal(frame3);
                        expect(frame1).to.not.equal(frame3);
                        expect(frame1.paths.length).to.equal(1);
                        expect(frame2.paths.length).to.equal(1);
                        expect(frame3.paths.length).to.equal(1);
                        expect(frame1.paths[0].json[1].source).to.equal(TestUtils.TEST_IMG_SRC_PNG);
                        expect(frame2.paths[0].json[1].source).to.equal(TestUtils.TEST_IMG_SRC_PNG_2);
                        expect(frame3.paths[0].json[1].source).to.equal(TestUtils.TEST_IMG_SRC_PNG_3);
                        expect(frame1.paths[0].bounds.width).to.equal(100);
                        expect(frame1.paths[0].bounds.height).to.equal(100);
                        expect(frame2.paths[0].bounds.width).to.equal(100);
                        expect(frame2.paths[0].bounds.height).to.equal(100);
                        expect(frame3.paths[0].bounds.width).to.equal(100);
                        expect(frame3.paths[0].bounds.height).to.equal(100);
                        done();
                    }, project);
                });
            });
        });
    });

    describe('#removeAllInstances', function () {
        it('should remove ImageAssets that are part of the GIFAsset on deletion of the GIFAsset', function(done) {
            var project = new Wick.Project();

            var image1 = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            var image2 = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG_2
            });
            var image3 = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMG_SRC_PNG_3
            });

            project.addAsset(image1);
            project.addAsset(image2);
            project.addAsset(image3);

            project.loadAssets(() => {
                Wick.GIFAsset.fromImages([image1, image2, image3], project, gifAsset => {
                    project.addAsset(gifAsset);
                    gifAsset.remove();
                    expect(project.assets.length).to.equal(0);
                });
            });
        });
    });
});
