describe('Wick.Tools.Ellipse', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.tools.ellipse.activate();
    });

    it('should draw an ellipse', function(done) {
        var project = new Wick.Project();
        var ellipse = project.tools.ellipse;

        project.view.render();

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].view.item.bounds.width).to.be.closeTo(50, 5);
            expect(project.activeFrame.paths[0].view.item.bounds.width).to.be.closeTo(50, 5);
            done();
        });

        ellipse.activate();
        ellipse.onMouseMove();
        ellipse.onMouseDown({point: new paper.Point(100,100), modifiers: {}});
        ellipse.onMouseDrag({point: new paper.Point(100,100), modifiers: {}});
        ellipse.onMouseDrag({point: new paper.Point(120,120), modifiers: {}});
        ellipse.onMouseDrag({point: new paper.Point(140,120), modifiers: {}});
        ellipse.onMouseDrag({point: new paper.Point(140,140), modifiers: {}});
        ellipse.onMouseDrag({point: new paper.Point(150,150), modifiers: {}});
        ellipse.onMouseUp({point: new paper.Point(150,150)});
    });

    it('should draw an ellipse (shift held)', function(done) {
        var project = new Wick.Project();
        var ellipse = project.tools.ellipse;

        project.view.render();

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].view.item.bounds.width).to.be.closeTo(50, 5);
            expect(project.activeFrame.paths[0].view.item.bounds.width).to.be.closeTo(50, 5);
            done();
        });

        ellipse.activate();
        ellipse.onMouseMove();
        ellipse.onMouseDown({point: new paper.Point(100,100), modifiers: {shift: true}});
        ellipse.onMouseDrag({point: new paper.Point(100,100), modifiers: {shift: true}});
        ellipse.onMouseDrag({point: new paper.Point(120,120), modifiers: {shift: true}});
        ellipse.onMouseDrag({point: new paper.Point(140,120), modifiers: {shift: true}});
        ellipse.onMouseDrag({point: new paper.Point(140,140), modifiers: {shift: true}});
        ellipse.onMouseDrag({point: new paper.Point(150,150), modifiers: {shift: true}});
        ellipse.onMouseUp({point: new paper.Point(150,150)});
    });
});
