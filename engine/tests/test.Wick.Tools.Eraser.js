describe('Wick.Tools.Eraser', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.tools.eraser.activate();
    });

    it('should erase a path', function(done) {
        var project = new Wick.Project();
        var eraser = project.tools.eraser;

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(2);
            done();
        });

        var json = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var path = new Wick.Path({json:json});
        project.activeFrame.addPath(path);
        project.view.render();

        eraser.activate();
        eraser.onMouseMove();
        eraser.onMouseDown({point: new paper.Point(0,0), modifiers: {}});
        eraser.onMouseDrag({point: new paper.Point(50,50), modifiers: {}});
        eraser.onMouseDrag({point: new paper.Point(100,100), modifiers: {}});
        eraser.onMouseUp({point: new paper.Point(150,150)});
    });
});
