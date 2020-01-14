describe('Wick.ImageSequence', function () {
    it('should export an image sequence correctly', function (done) {
        var project = new Wick.Project();
        project.activeLayer.addFrame(new Wick.Frame({start: 2}));
        project.activeLayer.addFrame(new Wick.Frame({start: 3}));

        let path1 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});
        let path2 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_BLUE_SQUARE});
        let path3 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});

        project.activeFrame.addPath(path1);
        project.activeLayer.frames[1].addPath(path2);
        project.activeLayer.frames[2].addPath(path3);

        Wick.ImageSequence.toPNGSequence(project, file => {
            console.log(file);
            done();
        });

        /*// for testing is onProgress works (this is kind of hacky and weird to test...)
        var onProgressCallsCorrect = [[1,3],[2,3],[3,3]];
        var onProgressCallsResult = [];

        project.generateImageSequence({
            onProgress: (current, max) => {
                onProgressCallsResult.push([current,max]);
            },
            onFinish: images => {
                images.forEach(image => {
                    // TODO need more tests here
                    //console.log(image);
                });
                expect(images.length).to.equal(3);

                expect(onProgressCallsResult).to.deep.equal(onProgressCallsCorrect);

                done();
            }
        });*/
    });
});
