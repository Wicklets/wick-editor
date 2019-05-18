describe('Wick.Tools.Line', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.tools.line.activate();
    });

    it('Should draw a line', function(done) {
        var project = new Wick.Project();
        var line = project.tools.line;

        project.view.render();

        project.view.on('canvasModified', function (e) {
            expect(project.activeFrame.paths.length).to.equal(1);
            done();
        });

        line.activate();
        line.onMouseDown({point: new paper.Point(25,25), modifiers: {}});
        line.onMouseDrag({point: new paper.Point(75,75), modifiers: {}});
        line.onMouseUp({point: new paper.Point(75,75), modifiers: {}});
    });
});

/*
describe('Tools.Line', function() {
    it('Should activate without errors', function() {
        var project = new Wick.Project();
        var paper = project.tools.line.paper;
        paper.project.clear();
        project.tools.line.activate();
    });

    it('Should draw line', function() {
        var project = new Wick.Project();
        var paper = project.tools.line.paper;
        paper.project.clear();
        project.tools.line.activate();

        project.tools.line.onMouseDown({point:new paper.Point(0,0)});
        project.tools.line.onMouseDrag({point:new paper.Point(50,50)});
        project.tools.line.onMouseDrag({point:new paper.Point(75,75)});
        project.tools.line.onMouseDrag({point:new paper.Point(100,100)});
        project.tools.line.onMouseUp();
        expect(paper.project.activeLayer.children.length).to.equal(1);
        expect(paper.project.activeLayer.children[0].className).to.equal('Path');
        expect(paper.project.activeLayer.children[0].segments.length).to.equal(2);
        expect(paper.project.activeLayer.children[0].bounds.width).to.equal(100);
        expect(paper.project.activeLayer.children[0].bounds.height).to.equal(100);
    });

    it('Should fire onCanvasModified event with correct layers', function(done) {
        var project = new Wick.Project();
        var paper = project.tools.line.paper;
        paper.project.clear();
        project.tools.line.activate();

        project.view.on('canvasModified', function (e) {
            expect(e.layers.length).to.equal(1);
            expect(e.layers[0]).to.equal(paper.project.activeLayer);
            done();
        });
        project.tools.line.activate();
        project.tools.line.onMouseDown({point:new paper.Point(0,0)});
        project.tools.line.onMouseDrag({point:new paper.Point(200,100)});
        project.tools.line.onMouseUp();
    });
});
*/
