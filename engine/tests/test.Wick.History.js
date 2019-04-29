describe('Wick.History', function() {
    it('should save and recover frame contents', function () {
        Wick.ObjectCache.removeAllObjects();

        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path());
        var path2 = TestUtils.paperToWickPath(new paper.Path());
        var path3 = TestUtils.paperToWickPath(new paper.Path());

        expect(project.undo()).to.equal(false);

        project.activeFrame.addPath(path1);
        project.history.pushState();
        project.activeFrame.addPath(path2);
        project.history.pushState();
        project.activeFrame.addPath(path3);
        project.history.pushState();

        expect(project.activeFrame.paths.length).to.equal(3);
        expect(project.activeFrame.paths[0]).to.equal(path1);
        expect(project.activeFrame.paths[1]).to.equal(path2);
        expect(project.activeFrame.paths[2]).to.equal(path3);

        expect(project.undo()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(2);
        expect(project.activeFrame.paths[0]).to.equal(path1);
        expect(project.activeFrame.paths[1]).to.equal(path2);

        expect(project.undo()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0]).to.equal(path1);

        expect(project.undo()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(0);

        expect(project.undo()).to.equal(false);

        expect(project.redo()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0]).to.equal(path1);

        expect(project.redo()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(2);
        expect(project.activeFrame.paths[0]).to.equal(path1);
        expect(project.activeFrame.paths[1]).to.equal(path2);

        expect(project.redo()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(3);
        expect(project.activeFrame.paths[0]).to.equal(path1);
        expect(project.activeFrame.paths[1]).to.equal(path2);
        expect(project.activeFrame.paths[2]).to.equal(path3);

        expect(project.redo()).to.equal(false);
    });

    it('should save and recover playhead position', function () {
        Wick.ObjectCache.removeAllObjects();

        var project = new Wick.Project();

        expect(project.undo()).to.equal(false);

        project.focus.timeline.playheadPosition = 2;
        project.history.pushState();
        project.focus.timeline.playheadPosition = 3;
        project.history.pushState();
        project.focus.timeline.playheadPosition = 4;
        project.history.pushState();

        expect(project.focus.timeline.playheadPosition).to.equal(4);

        expect(project.undo()).to.equal(true);
        expect(project.focus.timeline.playheadPosition).to.equal(3);

        expect(project.undo()).to.equal(true);
        expect(project.focus.timeline.playheadPosition).to.equal(2);

        expect(project.undo()).to.equal(true);
        expect(project.focus.timeline.playheadPosition).to.equal(1);

        expect(project.undo()).to.equal(false);

        expect(project.redo()).to.equal(true);
        expect(project.focus.timeline.playheadPosition).to.equal(2);

        expect(project.redo()).to.equal(true);
        expect(project.focus.timeline.playheadPosition).to.equal(3);

        expect(project.redo()).to.equal(true);
        expect(project.focus.timeline.playheadPosition).to.equal(4);

        expect(project.redo()).to.equal(false);
    });

    it('should save and recover selection', function () {
        Wick.ObjectCache.removeAllObjects();

        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;

        var pathJson1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var pathJson2 = ["Path",{"segments":[[50,100],[50,50],[100,50],[100,100]],"closed":true,"fillColor":[1,0,0]}];

        var path1 = new Wick.Path({json: pathJson1});
        var path2 = new Wick.Path({json: pathJson2});
        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);
        project.view.render();

        project.history.pushState();

        cursor.activate();

        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(25,25),
            delta: new paper.Point(0,0),
        });

        project.history.pushState();
        expect(project.selection.getSelectedObject().uuid).to.equal(path1.uuid);

        expect(project.undo()).to.equal(true);
        expect(project.selection.numObjects).to.equal(0);

        expect(project.redo()).to.equal(true);
        expect(project.selection.getSelectedObject().uuid).to.equal(path1.uuid);
        expect(project.selection.width).to.equal(50);
    });
});
