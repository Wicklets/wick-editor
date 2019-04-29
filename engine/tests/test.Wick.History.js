describe('Wick.History', function() {
    it('should save and recover frame contents', function () {
        Wick.ObjectCache.removeAllObjects();

        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path());
        var path2 = TestUtils.paperToWickPath(new paper.Path());
        var path3 = TestUtils.paperToWickPath(new paper.Path());

        expect(project.history.popState()).to.equal(false);

        // initial history push is required (should we do this automatically?)
        project.history.pushState();
        
        expect(project.history.popState()).to.equal(false);

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

        expect(project.history.popState()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(2);
        expect(project.activeFrame.paths[0]).to.equal(path1);
        expect(project.activeFrame.paths[1]).to.equal(path2);

        expect(project.history.popState()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0]).to.equal(path1);

        expect(project.history.popState()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(0);

        expect(project.history.popState()).to.equal(false);

        expect(project.history.recoverState()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0]).to.equal(path1);

        expect(project.history.recoverState()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(2);
        expect(project.activeFrame.paths[0]).to.equal(path1);
        expect(project.activeFrame.paths[1]).to.equal(path2);

        expect(project.history.recoverState()).to.equal(true);
        expect(project.activeFrame.paths.length).to.equal(3);
        expect(project.activeFrame.paths[0]).to.equal(path1);
        expect(project.activeFrame.paths[1]).to.equal(path2);
        expect(project.activeFrame.paths[2]).to.equal(path3);

        expect(project.history.recoverState()).to.equal(false);
    });
});
