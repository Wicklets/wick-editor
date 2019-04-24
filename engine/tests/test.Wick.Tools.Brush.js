describe('Wick.Tools.Brush', function() {
    // NOTE: Croquis functionality requires a canvas with a proper size existing in the document somewhere.
    // These helper functions provide the project with working canvas. Make sure to use them in the brush tests.
    function buildDummyCanvasContainer (project) {
        var dummyContainer = document.createElement('div');
        document.body.appendChild(dummyContainer);
        dummyContainer.style.width = '500px';
        dummyContainer.style.height = '500px';
        project.view.canvasContainer = dummyContainer;
        project.view.resize();
        project.view.render();
    }

    function destroyDummyCanvasContainer (project) {
        document.body.removeChild(project.view.canvasContainer);
    }

    it('should activate without errors', function() {
        var project = new Wick.Project();
        buildDummyCanvasContainer(project);

        project.view.tools.brush.activate();

        destroyDummyCanvasContainer(project);
    });

    it('should draw a brush stroke', function(done) {
        var project = new Wick.Project();
        var brush = project.view.tools.brush;
        buildDummyCanvasContainer(project);

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].view.item.bounds.area).to.be.closeTo(1316, 100);
            done();
        });

        brush.activate();
        brush.onMouseMove();
        brush.onMouseDown({point: new paper.Point(100,100)});
        brush.onMouseDrag({point: new paper.Point(120,100)});
        brush.onMouseDrag({point: new paper.Point(120,120)});
        brush.onMouseDrag({point: new paper.Point(140,120)});
        brush.onMouseDrag({point: new paper.Point(140,140)});
        brush.onMouseUp({point: new paper.Point(140,140)});

        destroyDummyCanvasContainer(project);
    });
});
