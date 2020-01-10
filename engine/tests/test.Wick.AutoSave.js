describe('Wick.AutoSave', function() {
    it('should save and load a simple project', function() {
        localforage.clear();

        var origProject = new Wick.Project();
        Wick.AutoSave.save(origProject);

        Wick.AutoSave.getSortedAutosavedProjects(projects => {
            expect(projects.length).to.equal(1);

            var uuid = projects[0].uuid;
            Wick.AutoSave.load(uuid, project => {

            });
        });
    });
});
