describe('Wick.Tools.Zoom', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.tools.zoom.activate();
    });

    it('Should zoom the canvas', function(done) {
        var project = new Wick.Project();
        var zoom = project.tools.zoom;

        project.view.render();

        project.view.on('canvasModified', function (e) {
            expect(project.zoom).to.equal(1.25);
            done();
        });

        zoom.activate();
        zoom.onMouseDown({point: new paper.Point(0,0), modifiers: {}});
        zoom.onMouseUp({point: new paper.Point(0,0), modifiers: {}});
    });
});
