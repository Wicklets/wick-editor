describe('Wick.WickFile', function () {
    describe('#exportAsWickFile/fromWickFile', function () {
        it('should create and load a project from a wick file correctly with no assets', function (done) {
            Wick.ObjectCache.clear();

            var project = new Wick.Project();

            Wick.WickFile.toWickFile(project, wickFile => {
                Wick.ObjectCache.clear();
                //saveAs(wickFile, 'wickproject.zip')
                Wick.WickFile.fromWickFile(wickFile, loadedProject => {
                    expect(loadedProject instanceof Wick.Project).to.equal(true);
                    expect(loadedProject.selection.parentBase).to.equal(loadedProject);
                    expect(loadedProject.selection.project).to.equal(loadedProject);
                    expect(loadedProject.root.parentBase).to.equal(loadedProject);
                    expect(loadedProject.root.project).to.equal(loadedProject);
                    expect(loadedProject.getAssets().length).to.equal(0);
                    done();
                });
            });
        });

        it('should create and load a project from a wick file correctly with assets', function (done) {
            Wick.ObjectCache.clear();
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
                Wick.ObjectCache.clear();
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

        it('should ignore selection, zoom, and pan when saving wick files', function (done) {
            Wick.ObjectCache.clear();

            var project = new Wick.Project();
            project.selection.select(project.activeFrame);
            project.zoom = 2;
            project.pan.x = 100;
            project.pan.y = 200;

            Wick.WickFile.toWickFile(project, wickFile => {
                // Original project definitely should not have changed.
                expect(project.zoom).to.equal(2);
                expect(project.pan.x).to.equal(100);
                expect(project.pan.y).to.equal(200);
                expect(project.selection.numObjects).to.equal(1);

                Wick.ObjectCache.clear();
                //saveAs(wickFile, 'wickproject.zip')
                Wick.WickFile.fromWickFile(wickFile, loadedProject => {
                    expect(loadedProject.zoom).to.equal(1);
                    expect(loadedProject.pan.x).to.equal(0);
                    expect(loadedProject.pan.y).to.equal(0);
                    expect(loadedProject.selection.numObjects).to.equal(0);

                    done();
                });
            });
        });

        it('should reset focus and playhead positions when saving wick files', function (done) {
            Wick.ObjectCache.clear();
            Wick.FileCache.clear();

            var project = new Wick.Project();
            project.activeLayer.addFrame(new Wick.Frame({start:2}));
            project.root.timeline.playheadPosition = 2;
            var clip = new Wick.Clip();
            clip.activeLayer.addFrame(new Wick.Frame({start:2}));
            clip.timeline.playheadPosition = 2;
            project.activeFrame.addClip(clip);
            project.focus = clip;

            Wick.WickFile.toWickFile(project, wickFile => {
                // Original project definitely should not have changed.
                expect(project.focus).to.equal(clip);
                expect(clip.timeline.playheadPosition).to.equal(2);

                Wick.ObjectCache.clear();
                //saveAs(wickFile, 'wickproject.zip')
                Wick.WickFile.fromWickFile(wickFile, loadedProject => {
                    expect(loadedProject.focus).to.equal(loadedProject.root);
                    expect(loadedProject.focus.timeline.playheadPosition).to.equal(1);
                    expect(loadedProject.activeLayer.frames[1].clips[0].timeline.playheadPosition).to.equal(1);

                    done();
                });
            });
        });

        it('should load fonts into the page on project load', function (done) {
            Wick.ObjectCache.clear();
            Wick.FileCache.clear();

            var project = new Wick.Project();

            var fontAsset = new Wick.FontAsset({
                filename: 'ABeeZee.ttf',
                src: TestUtils.TEST_FONT_SRC_TTF,
            });
            project.addAsset(fontAsset);

            Wick.WickFile.toWickFile(project, function (wickFile) {
                Wick.FileCache.clear();
                Wick.ObjectCache.clear();
                //saveAs(wickFile, 'wickproject.zip')
                Wick.WickFile.fromWickFile(wickFile, function (loadedProject) {
                    expect(loadedProject instanceof Wick.Project).to.equal(true);
                    expect(loadedProject.getAssets().length).to.equal(1);
                    expect(loadedProject.getAssets()[0] instanceof Wick.FontAsset).to.equal(true);
                    expect(document.fonts.check("12px ABeeZee")).to.equal(true);
                    done();
                });
            });
        });
    });
});
