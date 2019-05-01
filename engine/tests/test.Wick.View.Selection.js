describe('Wick.View.Selection', function() {
    it('should render with empty selection', function () {
        var project = new Wick.Project();
        project.view.render();

        expect(project.view.paper.project.selection.items.length).to.equal(0);
    });

    it('should render with paths in selection', function () {
        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(0,0),
            radius: 25,
            fillColor: '#ff0000',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(50,0),
            radius: 25,
            fillColor: '#00ff00',
        }));
        var path3 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(100,0),
            radius: 25,
            fillColor: '#0000ff',
        }));

        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);
        project.activeFrame.addPath(path3);

        project.selection.select(path1);
        project.selection.select(path2);
        project.selection.select(path3);

        project.view.render();

        expect(project.view.paper.project.selection.items.length).to.equal(3);
        expect(project.view.paper.project.selection.items).to.eql([
            path1.view.item,
            path2.view.item,
            path3.view.item,
        ]);
    });
});
