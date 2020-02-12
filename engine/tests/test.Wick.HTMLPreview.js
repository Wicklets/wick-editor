describe('Wick.HTMLPreview', function () {
    it('should create a popup window correctly', function (done) {
        var project = new Wick.Project();

        Wick.HTMLPreview.previewProject(project, (popupWindow) => {
            popupWindow.close();
            done();
        });
    });
});
