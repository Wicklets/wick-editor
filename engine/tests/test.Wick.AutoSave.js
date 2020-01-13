describe('Wick.AutoSave', function() {
    it('should save and load a simple project', function(done) {
        localforage.clear(() => {
            var origProject = new Wick.Project();
            origProject.width = 2000;
            origProject.height = 1000;
            Wick.AutoSave.save(origProject).then(() => {
                Wick.AutoSave.load(origProject.uuid).then(project => {
                    expect(project.width).to.equal(2000);
                    expect(project.height).to.equal(1000);
                    done();
                });
            });
        });
    });

    it('should throw an error if a project that doesnt exist in the autosave system was loaded', function(done) {
        localforage.clear(() => {
            var origProject = new Wick.Project();
            Wick.AutoSave.load(origProject.uuid)
              .then(project => {
                  throw new Error("This code should not be reached");
                  done();
              }, e => {
                  expect(e instanceof Error).to.equal(true);
                  done();
              });
        });
    });

    it('should save and load a project with assets', function(done) {
        Wick.FileCache.clear();
        localforage.clear(() => {
            var origProject = new Wick.Project();
            var asset = new Wick.SoundAsset({
                filename: 'test.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            origProject.addAsset(asset);

            Wick.AutoSave.save(origProject).then(() => {
                Wick.FileCache.clear();
                Wick.AutoSave.load(origProject.uuid).then(project => {
                    expect(project.assets.length).to.equal(origProject.assets.length);
                    expect(project.assets[0].uuid).to.equal(origProject.assets[0].uuid);
                    expect(project.assets[0].src).to.equal(origProject.assets[0].src);
                    done();
                });
            });
        });
    });

    it('should have the correct prefix for saved files', function() {
        expect(Wick.FileCache.FILE_LOCALFORAGE_KEY_PREFIX).to.equal('filesrc_');
    });
});
