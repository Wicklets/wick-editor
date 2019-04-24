describe('Wick.Tools.Ellipse', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.view.tools.ellipse.activate();
    });

    it('should draw an ellipse', function(done) {
        var project = new Wick.Project();
        var ellipse = project.view.tools.ellipse;

        project.view.render();

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].view.item.bounds.area).to.be.closeTo(1600, 100);
            done();
        });

        ellipse.activate();
        ellipse.onMouseMove();
        ellipse.onMouseDown({point: new paper.Point(100,100), modifiers: {}});
        ellipse.onMouseDrag({point: new paper.Point(120,100), modifiers: {}});
        ellipse.onMouseDrag({point: new paper.Point(120,120), modifiers: {}});
        ellipse.onMouseDrag({point: new paper.Point(140,120), modifiers: {}});
        ellipse.onMouseDrag({point: new paper.Point(140,140), modifiers: {}});
        ellipse.onMouseUp({point: new paper.Point(150,150)});
    });
});

/*
describe('Tools.Ellipse', function() {
    it('Should activate without errors', function() {
        var project = new Wick.Project();
        project.view.tools.ellipse.activate();
    });

    it('Should draw ellipse', function() {

    });

    it('Should draw perfect ellipse with shift held down', function() {

    });

    it('Should fire onCanvasModified event with correct layers', function(done) {
        var project = new Wick.Project();
        var paper = project.view.tools.ellipse.paper;

        project.view.on('canvasModified', function (e) {
            expect(e.layers.length).to.equal(1);
            expect(e.layers[0]).to.equal(paper.project.activeLayer);
            paper.project.clear();
            done();
        });
        project.view.tools.ellipse.activate();
        project.view.tools.ellipse.onMouseDown({point:new paper.Point(0,0)});
        project.view.tools.ellipse.onMouseDrag({modifiers:{},point:new paper.Point(30,30)});
        project.view.tools.ellipse.onMouseUp();
    });
});
*/
