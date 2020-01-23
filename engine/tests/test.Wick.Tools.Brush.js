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

        project.tools.brush.activate();

        destroyDummyCanvasContainer(project);
    });

    it('should draw a brush stroke', function(done) {
        var project = new Wick.Project();
        var brush = project.tools.brush;
        buildDummyCanvasContainer(project);

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].view.item.bounds.width).to.be.closeTo(50, 10);
            expect(project.activeFrame.paths[0].view.item.bounds.height).to.be.closeTo(50, 10);
            expect(project.activeFrame.paths[0].view.item.bounds.x).to.be.closeTo(200, 10);
            expect(project.activeFrame.paths[0].view.item.bounds.y).to.be.closeTo(200, 10);
            destroyDummyCanvasContainer(project);
            done();
        });

        brush.activate();
        brush.onMouseMove();
        brush.onMouseDown({point: new paper.Point(200,200)});
        brush.onMouseDrag({point: new paper.Point(210,210)});
        brush.onMouseDrag({point: new paper.Point(220,220)});
        brush.onMouseDrag({point: new paper.Point(230,230)});
        brush.onMouseDrag({point: new paper.Point(240,240)});
        brush.onMouseUp({point: new paper.Point(250,250)});
    });

    it('should create a new frame if the user drew on an empty space in the timeline', function(done) {
        var project = new Wick.Project();
        var brush = project.tools.brush;
        buildDummyCanvasContainer(project);

        project.activeTimeline.playheadPosition = 2;

        project.view.on('canvasModified', function (e) {
            expect(project.activeLayer.frames.length).to.equal(2);
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].view.item.bounds.width).to.be.closeTo(50, 10);
            expect(project.activeFrame.paths[0].view.item.bounds.height).to.be.closeTo(50, 10);
            expect(project.activeFrame.paths[0].view.item.bounds.x).to.be.closeTo(200, 10);
            expect(project.activeFrame.paths[0].view.item.bounds.y).to.be.closeTo(200, 10);
            destroyDummyCanvasContainer(project);
            done();
        });

        brush.activate();
        brush.onMouseMove();
        brush.onMouseDown({point: new paper.Point(200,200)});
        brush.onMouseDrag({point: new paper.Point(210,210)});
        brush.onMouseDrag({point: new paper.Point(220,220)});
        brush.onMouseDrag({point: new paper.Point(230,230)});
        brush.onMouseDrag({point: new paper.Point(240,240)});
        brush.onMouseUp({point: new paper.Point(250,250)});
    });

    it('should add the brush stroke to the frame where the stroke was originally started.', function(done) {
        var project = new Wick.Project();
        var brush = project.tools.brush;
        buildDummyCanvasContainer(project);

        project.view.on('canvasModified', function (e) {
            var frame1 = project.activeLayer.getFrameAtPlayheadPosition(1);
            var frame2 = project.activeLayer.getFrameAtPlayheadPosition(2);
            expect(frame2.paths.length).to.equal(0);
            expect(frame1.paths.length).to.equal(1);
            expect(frame1.paths[0].view.item.bounds.width).to.be.closeTo(20, 10);
            expect(frame1.paths[0].view.item.bounds.height).to.be.closeTo(20, 10);
            expect(frame1.paths[0].view.item.bounds.x).to.be.closeTo(200, 10);
            expect(frame1.paths[0].view.item.bounds.y).to.be.closeTo(200, 10);
            destroyDummyCanvasContainer(project);
            done();
        });

        brush.activate();
        brush.onMouseMove();

        // Start drawing
        brush.onMouseDown({point: new paper.Point(200,200)});
        brush.onMouseDrag({point: new paper.Point(210,210)});
        brush.onMouseDrag({point: new paper.Point(220,220)});
        // Move to different frame
        project.activeTimeline.playheadPosition = 2;
        project.view.render();
        // Keep drawing
        brush.onMouseDrag({point: new paper.Point(230,230)});
        brush.onMouseDrag({point: new paper.Point(240,240)});
        // Finish drawing on the new frame.
        brush.onMouseUp({point: new paper.Point(250,250)});
    });
});
