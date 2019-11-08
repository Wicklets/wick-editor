describe('Wick.HTMLExport', function () {
    it('should bundle an HTML file successfully', function (done) {
        Wick.ObjectCache.clear();

        var project = new Wick.Project();

        Wick.HTMLExport.bundleProject(project, html => {
            expect(html).not.to.equal(null);
            expect(html).not.to.equal(undefined);
            expect(typeof html).to.equal('string');
            saveAs(new Blob([html], {type: "text/plain"}), 'project.html');
            done();
        });
    });
});
