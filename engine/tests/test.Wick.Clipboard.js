describe('Wick.Clipboard', function() {
    it('should copy and paste objects correctly', function () {
        var project = new Wick.Project();

        var path1 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});
        var path2 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_BLUE_SQUARE});

        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);

        expect(project.copySelectionToClipboard()).to.equal(false);
        expect(project.pasteClipboardContents()).to.equal(false);

        project.selection.select(path1);
        expect(project.copySelectionToClipboard()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(2);
        expect(project.activeFrame.paths[0]).to.equal(path1);
        expect(project.activeFrame.paths[1]).to.equal(path2);

        expect(project.pasteClipboardContents()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(3);
        expect(project.activeFrame.paths[0]).to.equal(path1);
        expect(project.activeFrame.paths[1]).to.equal(path2);
        expect(project.activeFrame.paths[2]).to.not.equal(path1);
        expect(project.activeFrame.paths[2]).to.not.equal(path2);
        expect(project.activeFrame.paths[2].uuid).to.not.equal(path1.uuid);
        expect(project.activeFrame.paths[2].uuid).to.not.equal(path2.uuid);
    });
});
