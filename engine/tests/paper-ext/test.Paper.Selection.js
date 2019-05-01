describe('Paper.Selection', function() {
    let createDummyPaperInstance = () => {
        var paperScope = TestUtils.createPaperScope();

        //  ---   ---
        // |p1 | |p2 |
        //  ---   ---
        //        ---
        //       |p3 |
        //        ---

        var path1 = new paperScope.Path.Ellipse({
            center: new paper.Point(25,25),
            radius: 25,
            fillColor: '#ff0000',
            applyMatrix: true,
        });
        var path2 = new paperScope.Path.Ellipse({
            center: new paper.Point(75,25),
            radius: 25,
            fillColor: '#00ff00',
            applyMatrix: true,
        });
        var path3 = new paperScope.Group({
            children: [
                new paperScope.Path.Ellipse({
                    center: new paper.Point(0,0),
                    radius: 25,
                    fillColor: '#0000ff',
                    applyMatrix: true,
                })
            ],
            applyMatrix: false,
        })
        path3.position.x = 75;
        path3.position.y = 75;

        return {
            paperScope: paperScope,
            path1: path1,
            path2: path2,
            path3: path3,
        };
    }

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

    it('no initial transformations, no transformations given, discard transformations', function () {
        var dummy = createDummyPaperInstance();

        var paperScope = dummy.paperScope;
        var path1 = dummy.path1;
        var path2 = dummy.path2;
        var path3 = dummy.path3;

        var selection = new paperScope.Selection({
            layer: paperScope.project.activeLayer,
            items: [path1, path2, path3],
        });

        expect(selection.layer).to.equal(paperScope.project.activeLayer);
        expect(selection.items).to.eql([path1, path2, path3]);
        expect(selection.transformation.x).to.equal(0);
        expect(selection.transformation.y).to.equal(0);
        expect(selection.transformation.scaleX).to.equal(1.0);
        expect(selection.transformation.scaleY).to.equal(1.0);
        expect(selection.transformation.rotation).to.equal(0);
        expect(selection.transformation.originX).to.equal(50);
        expect(selection.transformation.originY).to.equal(50);
        expect(selection.bounds.center.x).to.equal(50);
        expect(selection.bounds.center.y).to.equal(50);
        expect(selection.bounds.area).to.equal(100 * 100);

        selection.finish(true);

        expect(path1.bounds.top).to.equal(0);
        expect(path1.bounds.bottom).to.equal(50);
        expect(path1.bounds.left).to.equal(0);
        expect(path1.bounds.right).to.equal(50);
        expect(path2.bounds.top).to.equal(0);
        expect(path2.bounds.bottom).to.equal(50);
        expect(path2.bounds.left).to.equal(50);
        expect(path2.bounds.right).to.equal(100);
        expect(path3.bounds.top).to.equal(50);
        expect(path3.bounds.bottom).to.equal(100);
        expect(path3.bounds.left).to.equal(50);
        expect(path3.bounds.right).to.equal(100);
    });

    it('no initial transformations, some transformations given, discard transformations', function () {
        var dummy = createDummyPaperInstance();

        var paperScope = dummy.paperScope;
        var path1 = dummy.path1;
        var path2 = dummy.path2;
        var path3 = dummy.path3;

        var selection = new paperScope.Selection({
            layer: paperScope.project.activeLayer,
            items: [path1, path2, path3],
        });

        selection.updateTransformation({
            x: 100
        });

        expect(selection.layer).to.equal(paperScope.project.activeLayer);
        expect(selection.items).to.eql([path1, path2, path3]);
        expect(selection.transformation.x).to.equal(100);
        expect(selection.transformation.y).to.equal(0);
        expect(selection.transformation.scaleX).to.equal(1.0);
        expect(selection.transformation.scaleY).to.equal(1.0);
        expect(selection.transformation.rotation).to.equal(0);
        expect(selection.transformation.originX).to.equal(50);
        expect(selection.transformation.originY).to.equal(50);
        expect(selection.bounds.center.x).to.equal(50);
        expect(selection.bounds.center.y).to.equal(50);
        expect(selection.bounds.area).to.equal(100 * 100);

        selection.finish(true);

        expect(path1.bounds.top).to.equal(0);
        expect(path1.bounds.bottom).to.equal(50);
        expect(path1.bounds.left).to.equal(0);
        expect(path1.bounds.right).to.equal(50);
        expect(path2.bounds.top).to.equal(0);
        expect(path2.bounds.bottom).to.equal(50);
        expect(path2.bounds.left).to.equal(50);
        expect(path2.bounds.right).to.equal(100);
        expect(path3.bounds.top).to.equal(50);
        expect(path3.bounds.bottom).to.equal(100);
        expect(path3.bounds.left).to.equal(50);
        expect(path3.bounds.right).to.equal(100);
    });

    it('no initial transformations, some transformations given, apply transformations', function () {
        var dummy = createDummyPaperInstance();

        var paperScope = dummy.paperScope;
        var path1 = dummy.path1;
        var path2 = dummy.path2;
        var path3 = dummy.path3;

        var selection = new paperScope.Selection({
            layer: paperScope.project.activeLayer,
            items: [path1, path2, path3],
        });

        selection.updateTransformation({
            x: 100
        });

        expect(selection.layer).to.equal(paperScope.project.activeLayer);
        expect(selection.items).to.eql([path1, path2, path3]);
        expect(selection.transformation.x).to.equal(100);
        expect(selection.transformation.y).to.equal(0);
        expect(selection.transformation.scaleX).to.equal(1.0);
        expect(selection.transformation.scaleY).to.equal(1.0);
        expect(selection.transformation.rotation).to.equal(0);
        expect(selection.transformation.originX).to.equal(50);
        expect(selection.transformation.originY).to.equal(50);
        expect(selection.bounds.center.x).to.equal(50);
        expect(selection.bounds.center.y).to.equal(50);
        expect(selection.bounds.area).to.equal(100 * 100);

        selection.finish(false);

        expect(path1.bounds.top).to.equal(0);
        expect(path1.bounds.bottom).to.equal(50);
        expect(path1.bounds.left).to.equal(0 + 100);
        expect(path1.bounds.right).to.equal(50 + 100);
        expect(path2.bounds.top).to.equal(0);
        expect(path2.bounds.bottom).to.equal(50);
        expect(path2.bounds.left).to.equal(50 + 100);
        expect(path2.bounds.right).to.equal(100 + 100);
        expect(path3.bounds.top).to.equal(50);
        expect(path3.bounds.bottom).to.equal(100);
        expect(path3.bounds.left).to.equal(50 + 100);
        expect(path3.bounds.right).to.equal(100 + 100);
    });
});
