describe('Wick.Tools.Rectangle', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.tools.rectangle.activate();
    });

    it('should draw a rectangle', function(done) {
        var project = new Wick.Project();
        var rectangle = project.tools.rectangle;

        project.view.render();

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].view.item.bounds.width).to.be.closeTo(50, 5);
            expect(project.activeFrame.paths[0].view.item.bounds.height).to.be.closeTo(50, 5);
            done();
        });

        rectangle.activate();
        rectangle.onMouseMove();
        rectangle.onMouseDown({point: new paper.Point(100,100), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(120,100), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(120,120), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(140,120), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(150,150), modifiers: {}});
        rectangle.onMouseUp({point: new paper.Point(150,150)});
    });

    it('should draw a rectangle (shift held)', function(done) {
        var project = new Wick.Project();
        var rectangle = project.tools.rectangle;

        project.view.render();

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].view.item.bounds.width).to.be.closeTo(50, 5);
            expect(project.activeFrame.paths[0].view.item.bounds.height).to.be.closeTo(50, 5);
            done();
        });

        rectangle.activate();
        rectangle.onMouseMove();
        rectangle.onMouseDown({point: new paper.Point(100,100), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(120,100), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(120,120), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(140,120), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(150,150), modifiers: {}});
        rectangle.onMouseUp({point: new paper.Point(150,150)});
    });
});
