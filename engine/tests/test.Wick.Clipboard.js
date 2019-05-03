describe('Wick.Clipboard', function() {
    it('should copy and paste objects (to other frame) correctly', function () {
        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(50,50),
            radius: 25,
            fillColor: 'red',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(50,50),
            radius: 25,
            fillColor: 'blue',
        }));

        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);

        // Make sure we're testing for path json with wick data
        project.view.render();
        project.view.applyChanges();

        // Nothing should happen yet:
        expect(project.copySelectionToClipboard()).to.equal(false);
        expect(project.pasteClipboardContents()).to.equal(false);

        project.selection.select(path1);
        expect(project.copySelectionToClipboard()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(2);
        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths[1].uuid).to.equal(path2.uuid);

        // Move playhead to new frame, then paste
        project.activeLayer.addFrame(new Wick.Frame({start: 2}));
        project.focus.timeline.playheadPosition = 2;
        project.view.render();

        // Paste and check that everything is OK.
        expect(project.pasteClipboardContents()).to.equal(true);
        expect(project.activeLayer.frames[0].paths.length).to.equal(2);
        expect(project.activeLayer.frames[0].paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeLayer.frames[0].paths[1].uuid).to.equal(path2.uuid);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].uuid).to.not.equal(path1.uuid);
        expect(project.activeFrame.paths[0].uuid).to.not.equal(path2.uuid);
        expect(project.selection.getSelectedObject().uuid).to.not.equal(path1.uuid);
        expect(project.selection.getSelectedObject().uuid).to.not.equal(path2.uuid);
        expect(project.selection.getSelectedObject().uuid).to.equal(project.activeFrame.paths[0].uuid);

        // Original paths should NOT have moved.
        expect(project.activeLayer.frames[0].paths[0].x).to.equal(50);
        expect(project.activeLayer.frames[0].paths[0].y).to.equal(50);
        expect(project.activeLayer.frames[0].paths[1].x).to.equal(50);
        expect(project.activeLayer.frames[0].paths[1].y).to.equal(50);
        // Pasted path should NOT BE OFFSET.
        expect(project.activeFrame.paths[0].x).to.equal(50);
        expect(project.activeFrame.paths[0].y).to.equal(50);
    });

    it('should copy and paste objects to same frame (offset) correctly', function () {
        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(50,50),
            radius: 25,
            fillColor: 'red',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(50,50),
            radius: 25,
            fillColor: 'blue',
        }));

        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);

        // Make sure we're testing for path json with wick data
        project.view.render();
        project.view.applyChanges();

        // Nothing should happen yet:
        expect(project.copySelectionToClipboard()).to.equal(false);
        expect(project.pasteClipboardContents()).to.equal(false);

        // Select path1 and copy it to clipboard
        project.selection.select(path1);
        expect(project.copySelectionToClipboard()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(2);
        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths[1].uuid).to.equal(path2.uuid);

        // paste path1!
        expect(project.pasteClipboardContents()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(3);
        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths[1].uuid).to.equal(path2.uuid);
        expect(project.activeFrame.paths[2].uuid).to.not.equal(path1.uuid);
        expect(project.activeFrame.paths[2].uuid).to.not.equal(path2.uuid);
        expect(project.selection.getSelectedObject().uuid).to.not.equal(path1.uuid);
        expect(project.selection.getSelectedObject().uuid).to.not.equal(path2.uuid);
        expect(project.selection.getSelectedObject().uuid).to.equal(project.activeFrame.paths[2].uuid);

        expect(project.activeFrame.paths[0].x).to.equal(50);
        expect(project.activeFrame.paths[0].y).to.equal(50);
        expect(project.activeFrame.paths[1].x).to.equal(50);
        expect(project.activeFrame.paths[1].y).to.equal(50);
        expect(project.activeFrame.paths[2].x).to.equal(50 + Wick.Clipboard.PASTE_OFFSET);
        expect(project.activeFrame.paths[2].y).to.equal(50 + Wick.Clipboard.PASTE_OFFSET);
    });
});
