describe('Wick.WickFile', function () {
    describe('#exportAsWickFile/fromWickFile', function () {
        it('should create and load a project from a wick file correctly with no assets', function (done) {
            Wick.ObjectCache.removeAllObjects();

            var project = new Wick.Project();

            Wick.WickFile.toWickFile(project, wickFile => {
                Wick.ObjectCache.removeAllObjects();
                //saveAs(wickFile, 'wickproject.zip')
                Wick.WickFile.fromWickFile(wickFile, loadedProject => {
                    expect(loadedProject instanceof Wick.Project).to.equal(true);
                    expect(loadedProject.selection.parent).to.equal(loadedProject);
                    expect(loadedProject.selection.project).to.equal(loadedProject);
                    expect(loadedProject.root.parent).to.equal(loadedProject);
                    expect(loadedProject.root.project).to.equal(loadedProject);
                    expect(loadedProject.getAssets().length).to.equal(0);
                    done();
                });
            });
        });

        it('should create and load a project from a wick file correctly with assets', function (done) {
            Wick.ObjectCache.removeAllObjects();
            Wick.FileCache.clear();

            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(imageAsset);

            var soundAsset = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV,
            });
            project.addAsset(soundAsset);

            Wick.WickFile.toWickFile(project, function (wickFile) {
                Wick.FileCache.clear();
                Wick.ObjectCache.removeAllObjects();
                //saveAs(wickFile, 'wickproject.zip')
                Wick.WickFile.fromWickFile(wickFile, function (loadedProject) {
                    expect(loadedProject instanceof Wick.Project).to.equal(true);
                    expect(loadedProject.getAssets().length).to.equal(project.getAssets().length);
                    expect(loadedProject.getAssets()[0].uuid).to.equal(project.getAssets()[0].uuid);
                    expect(loadedProject.getAssets()[1].uuid).to.equal(project.getAssets()[1].uuid);
                    expect(loadedProject.getAssets()[0].src).to.equal(project.getAssets()[0].src);
                    expect(loadedProject.getAssets()[1].src).to.equal(project.getAssets()[1].src);
                    done();
                });
            });
        });

        it('should create and load a project from a wick file correctly with image paths', function (done) {
            Wick.ObjectCache.removeAllObjects();
            Wick.FileCache.clear();

            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(imageAsset);

            project.createImagePathFromAsset(imageAsset, 0, 0, () => {
                Wick.WickFile.toWickFile(project, function (wickFile) {
                    Wick.FileCache.clear();
                    Wick.ObjectCache.removeAllObjects();
                    //saveAs(wickFile, 'wickproject.zip')
                    Wick.WickFile.fromWickFile(wickFile, function (loadedProject) {
                        expect(loadedProject instanceof Wick.Project).to.equal(true);
                        expect(loadedProject.getAssets().length).to.equal(project.getAssets().length);
                        expect(loadedProject.getAssets()[0].uuid).to.equal(project.getAssets()[0].uuid);
                        expect(loadedProject.getAssets()[0].src).to.equal(project.getAssets()[0].src);
                        done();
                    });
                });
            });
        });
    });
});
