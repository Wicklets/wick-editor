describe('Wick.AutoSave', function() {
    it('should save and load a simple project from autosave', function(done) {
        localforage.clear(() => {
            var origProject = new Wick.Project();
            origProject.width = 2000;
            origProject.height = 1000;
            Wick.AutoSave.save(origProject, () => {
                Wick.ObjectCache.clear();
                Wick.AutoSave.load(origProject.uuid, project => {
                    expect(project.width).to.equal(2000);
                    expect(project.height).to.equal(1000);
                    done();
                });
            });
        });
    });

    it('should save and load a project with assets from autosave', function(done) {
        Wick.FileCache.clear();
        localforage.clear(() => {
            var origProject = new Wick.Project();
            var asset = new Wick.SoundAsset({
                filename: 'test.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            origProject.addAsset(asset);

            Wick.AutoSave.save(origProject, () => {
                Wick.ObjectCache.clear();
                Wick.FileCache.clear();
                Wick.AutoSave.load(origProject.uuid, project => {
                    expect(project.assets.length).to.equal(origProject.assets.length);
                    expect(project.assets[0].uuid).to.equal(origProject.assets[0].uuid);
                    expect(project.assets[0].src).to.equal(origProject.assets[0].src);
                    done();
                });
            });
        });
    });

    it('should have the correct prefixes/keys for localforage', function() {
        expect(Wick.AutoSave.AUTOSAVES_LIST_KEY).to.equal('autosaveList');
        expect(Wick.AutoSave.AUTOSAVE_DATA_PREFIX).to.equal('autosave_');
    });

    it('should delete autosaves correctly', function() {
        
    });

    it('getSortedAutosavedProjects should return a sorted list of project info', function(done) {
        localforage.clear(() => {
            var project3 = new Wick.Project();
            var project1 = new Wick.Project();
            var project2 = new Wick.Project();
            Wick.AutoSave.save(project1, () => {
                Wick.AutoSave.save(project2, () => {
                    Wick.AutoSave.save(project3, () => {
                        Wick.AutoSave.getAutosavesList(autosaveList => {
                            expect(autosaveList.length).to.equal(3);
                            expect(autosaveList[0].uuid).to.equal(project3.uuid);
                            expect(autosaveList[1].uuid).to.equal(project2.uuid);
                            expect(autosaveList[2].uuid).to.equal(project1.uuid);
                            done();
                        });
                    });
                });
            });
        });
    });
});
