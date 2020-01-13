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

    it('should have the correct prefix for saved files', function() {
      expect(Wick.FileCache.PROJECTS_LIST_KEY).to.equal('autosavedProjects');
    });
});
