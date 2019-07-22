describe('Wick.History', function() {
    it('should save and recover frame contents', function () {
        Wick.ObjectCache.clear();

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
        expect(project.activeFrame.paths[0].project).to.equal(project);
        expect(project.activeFrame.paths[0].parentBase).to.equal(project.activeFrame);

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
        Wick.ObjectCache.clear();

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
        Wick.ObjectCache.clear();

        var project = new Wick.Project();
        var cursor = project.tools.cursor;

        var pathJson1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var pathJson2 = ["Path",{"segments":[[50,100],[50,50],[100,50],[100,100]],"closed":true,"fillColor":[1,0,0]}];

        var path1 = new Wick.Path({json: pathJson1});
        var path2 = new Wick.Path({json: pathJson2});
        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);
        project.selection.select(path1);

        project.history.pushState();
        expect(project.selection.getSelectedObject().uuid).to.equal(path1.uuid);

        expect(project.undo()).to.equal(true);
        expect(project.selection.numObjects).to.equal(0);

        expect(project.redo()).to.equal(true);
        expect(project.selection.getSelectedObject().uuid).to.equal(path1.uuid);

        // TODO
        //throw new Error('check selection position + bounds in this test too, please');
    });

    it('should save and recover focus', function () {
        var project = new Wick.Project();
        var main = new Wick.Clip({identifier: 'main'});
        var other = new Wick.Clip({identifier: 'other'});

        project.activeFrame.addClip(main);
        project.activeFrame.addClip(other);

        project.history.pushState();
        project.focus = main;

        expect(project.focus.identifier).to.equal('main');
        project.undo();
        expect(project.focus.identifier).to.equal('Project');

        project.focus = main;
        project.history.pushState();
        project.focus = other;
        project.history.pushState();
        project.focus = project.root;
        project.history.pushState();

        expect(project.focus.identifier).to.equal('Project');
        project.undo();
        expect(project.focus.identifier).to.equal('other');
        project.undo();
        expect(project.focus.identifier).to.equal('main');
    });

    it('should save and load snapshots', function () {
        Wick.ObjectCache.clear();

        var project = new Wick.Project();

        var pathJson1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var pathJson2 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[0,1,0]}];
        var pathJson3 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[0,0,1]}];

        var path1 = new Wick.Path({json: pathJson1});
        var path2 = new Wick.Path({json: pathJson2});
        var path3 = new Wick.Path({json: pathJson3});

        project.activeFrame.addPath(path1);
        project.view.render();
        project.history.saveSnapshot('red-path');

        project.activeFrame.paths[0].remove();
        project.activeFrame.addPath(path2);
        project.view.render();
        project.history.saveSnapshot('green-path');

        project.activeFrame.paths[0].remove();
        project.activeFrame.addPath(path3);
        project.view.render();
        project.history.saveSnapshot('blue-path');

        project.activeFrame.paths[0].remove();

        project.history.loadSnapshot('red-path');
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths[0].view.item.fillColor.toCSS(true)).to.equal('#ff0000');

        project.history.loadSnapshot('green-path');
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].uuid).to.equal(path2.uuid);
        expect(project.activeFrame.paths[0].view.item.fillColor.toCSS(true)).to.equal('#00ff00');

        project.history.loadSnapshot('blue-path');
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].uuid).to.equal(path3.uuid);
        expect(project.activeFrame.paths[0].view.item.fillColor.toCSS(true)).to.equal('#0000ff');
    });

    it('(bug) snapshots should save all objects, not just active objects', function () {
        Wick.ObjectCache.clear();

        var project = new Wick.Project();
        var inactiveFrame = new Wick.Frame({start:2});
        var inactiveClip = new Wick.Clip();
        inactiveFrame.addClip(inactiveClip);
        project.activeLayer.addFrame(inactiveFrame);
        inactiveClip.identifier = 'foo';
        project.history.saveSnapshot('foo');
        inactiveClip.identifier = 'bar';
        project.history.loadSnapshot('foo');
        expect(inactiveClip.identifier).to.equal('foo');
    });

    // fix for crash on frame delete undo
    it('(bug) parent references should remain after delete undo', function () {
        var project = new Wick.Project();
        project.history.pushState();
        project.activeFrame.remove();
        project.undo();
        expect(project.activeFrame.parentBase).to.equal(project.activeLayer);
    });

    // fix for redo reverting project to old state
    it('(bug) redo should not revert to old project state', function () {
        var project = new Wick.Project();
        project.history.pushState();

        project.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Ellipse({
            fillColor: 'red',
            point: [50,50],
            radius: [50,50],
        })));
        project.history.pushState();

        project.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Ellipse({
            fillColor: 'green',
            point: [50,50],
            radius: [50,50],
        })));
        project.history.pushState();

        project.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Ellipse({
            fillColor: 'blue',
            point: [50,50],
            radius: [50,50],
        })));
        project.history.pushState();

        expect(project.activeFrame.paths.length).to.equal(3);

        project.undo();
        expect(project.activeFrame.paths.length).to.equal(2);

        project.undo();
        expect(project.activeFrame.paths.length).to.equal(1);

        project.undo();
        expect(project.activeFrame.paths.length).to.equal(0);

        project.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Ellipse({
            fillColor: 'yellow',
            point: [50,50],
            radius: [50,50],
        })));
        project.history.pushState();

        expect(project.redo()).to.equal(false);
    });

    it('numUndoStates should work correctly', function () {
        var project = new Wick.Project();
        expect(project.history.numUndoStates).to.equal(1);
        project.history.pushState();
        expect(project.history.numUndoStates).to.equal(2);
        project.history.pushState();
        expect(project.history.numUndoStates).to.equal(3);
        project.history.pushState();
        expect(project.history.numUndoStates).to.equal(4);
    });

    it('numRedoStates should work correctly', function () {
        var project = new Wick.Project();
        expect(project.history.numRedoStates).to.equal(0);
        project.history.pushState();
        expect(project.history.numRedoStates).to.equal(0);
        project.history.pushState();
        expect(project.history.numRedoStates).to.equal(0);
        project.history.pushState();
        expect(project.history.numRedoStates).to.equal(0);
        project.undo();
        expect(project.history.numRedoStates).to.equal(1);
        project.undo();
        expect(project.history.numRedoStates).to.equal(2);
        project.undo();
        expect(project.history.numRedoStates).to.equal(3);
    });
});
