describe('Paper.Selection', function() {
    it('should instantiate correctly', function () {
        var paperScope = TestUtils.createPaperScope();

        var selection = new paperScope.Selection({
            layer: paperScope.project.activeLayer
        });

        expect(selection.layer).to.equal(paperScope.project.activeLayer);
        expect(selection.items).to.eql([]);
        expect(selection.transformation.x).to.equal(0);
        expect(selection.transformation.y).to.equal(0);
        expect(selection.transformation.scaleX).to.equal(1.0);
        expect(selection.transformation.scaleY).to.equal(1.0);
        expect(selection.transformation.rotation).to.equal(0);
        expect(selection.transformation.originX).to.equal(0);
        expect(selection.transformation.originY).to.equal(0);
        expect(selection.bounds.center.x).to.equal(0);
        expect(selection.bounds.center.y).to.equal(0);
        expect(selection.bounds.area).to.equal(0);

        selection.finish();
    });

    it('should select and transform paths correctly', function () {

    });

    it('should select and transform groups correctly', function () {
        var paperScope = TestUtils.createPaperScope();

        //  ---   ---
        // | 1 | | 2 |
        //  ---   ---
        //        ---
        //       | 3 |
        //        ---

        var path1 = new paperScope.Path.Ellipse({
            center: new paper.Point(25,25),
            radius: 25,
            fillColor: '#ff0000'
        });
        var path2 = new paperScope.Path.Ellipse({
            center: new paper.Point(75,25),
            radius: 25,
            fillColor: '#00ff00'
        });
        var path3 = new paperScope.Path.Ellipse({
            center: new paper.Point(75,75),
            radius: 25,
            fillColor: '#0000ff'
        });

        var selection = new paperScope.Selection({
            layer: paperScope.project.activeLayer,
            items: [path1, path2, path3],
        });
    });
});
