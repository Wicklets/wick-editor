describe('Wick.Tools.Pencil', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.tools.pencil.activate();
    });

    it('Should draw a line', function(done) {
        var project = new Wick.Project();
        var pencil = project.tools.pencil;

        project.view.render();

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].view.item.bounds.area).to.be.closeTo(50*50, 150);
            done();
        });

        pencil.activate();
        pencil.onMouseDown({point: new paper.Point(25,25), modifiers: {}});
        pencil.onMouseDown({point: new paper.Point(35,35), modifiers: {}});
        pencil.onMouseDown({point: new paper.Point(25,25), modifiers: {}});
        pencil.onMouseDown({point: new paper.Point(35,25), modifiers: {}});
        pencil.onMouseDrag({point: new paper.Point(65,55), modifiers: {}});
        pencil.onMouseUp({point: new paper.Point(75,75), modifiers: {}});
    });
});
