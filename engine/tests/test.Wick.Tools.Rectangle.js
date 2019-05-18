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
            expect(project.activeFrame.paths[0].view.item.bounds.area).to.be.closeTo(1600, 100);
            done();
        });

        rectangle.activate();
        rectangle.onMouseMove();
        rectangle.onMouseDown({point: new paper.Point(100,100), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(120,100), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(120,120), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(140,120), modifiers: {}});
        rectangle.onMouseDrag({point: new paper.Point(140,140), modifiers: {}});
        rectangle.onMouseUp({point: new paper.Point(150,150)});
    });
});


/*
describe('Tools.Rectangle', function() {
    it('Should activate without errors', function() {
        var project = new Wick.Project();
        var paper = project.tools.rectangle.paper;
        paper.project.clear();
        project.tools.rectangle.activate();
    });

    it('Should draw rectangle', function() {

    });

    it('Should draw perfect rectangle with shift held down', function() {

    });

    it('Should fire onCanvasModified event with correct layers', function(done) {
        var project = new Wick.Project();
        var paper = project.tools.rectangle.paper;
        paper.project.clear();
        project.tools.rectangle.activate();

        project.view.on('canvasModified', function (e) {
            expect(e.layers.length).to.equal(1);
            expect(e.layers[0]).to.equal(paper.project.activeLayer);
            paper.project.clear();
            done();
        });
        project.tools.rectangle.activate();
        project.tools.rectangle.onMouseDown({point:new paper.Point(0,0)});
        project.tools.rectangle.onMouseDrag({modifiers:{},point:new paper.Point(30,30)});
        project.tools.rectangle.onMouseUp();
    });
});
*/
