describe('Wick.Tools.Pan', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.view.tools.pan.activate();
    });

    it('should pan the view without errors', function() {
        var project = new Wick.Project();
        var pan = project.view.tools.pan;

        project.view.render();

        pan.activate();

        pan.onMouseDrag({downPoint: new paper.Point(50,50), point: new paper.Point(50,50)});
        pan.onMouseDrag({downPoint: new paper.Point(50,50), point: new paper.Point(100,100)});
        pan.onMouseDrag({downPoint: new paper.Point(50,50), point: new paper.Point(100,200)});
        pan.onMouseUp({});

        expect(project.pan.x).to.equal(100);
        expect(project.pan.y).to.equal(200);
    });
});
