describe('Wick.ZIPExport', function () {
    it('should bundle an HTML file successfully', function (done) {
        Wick.ObjectCache.clear();

        var project = new Wick.Project();

        Wick.ZIPExport.bundleProject(project, zip => {
            saveAs(zip, 'project.zip');
            done();
        });
    });
});
