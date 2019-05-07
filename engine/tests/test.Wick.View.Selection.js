describe('Wick.View.Selection', function() {
    it('should render with empty selection', function () {
        var project = new Wick.Project();
        project.view.render();

        expect(project.selection.view.selection.items.length).to.equal(0);
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

        expect(project.selection.view.selection.items.length).to.equal(3);
        expect(project.selection.view.selection.items).to.eql([
            path1.view.item,
            path2.view.item,
            path3.view.item,
        ]);
    });

    it('should update wick selection when paper selection changes', function () {
        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(25,25),
            radius: 25,
            fillColor: '#ff0000',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(75,25),
            radius: 25,
            fillColor: '#00ff00',
        }));
        var path3 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(75,75),
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
        project.selection.view.selection.items = [path1.view.item, path2.view.item];
        project.view.applyChanges();
        project.view.render();

        // Check that the model was updated correctly
        expect(project.selection.numObjects).to.equal(2);
        expect(project.selection.getSelectedObjects()[0].uuid).to.equal(path1.uuid);
        expect(project.selection.getSelectedObjects()[1].uuid).to.equal(path2.uuid);
        expect(project.activeFrame.paths[0].json[1].applyMatrix).to.equal(true);
        expect(project.activeFrame.paths[1].json[1].applyMatrix).to.equal(true);
        expect(project.activeFrame.paths[2].json[1].applyMatrix).to.equal(true);

        // Check that the view was updated correctly
        expect(project.selection.view.selection.items.length).to.equal(2);
        expect(project.selection.view.selection.width).to.equal(100);
        expect(project.selection.view.selection.height).to.equal(50);
        expect(project.activeFrame.paths[0].view.item.applyMatrix).to.equal(false);
        expect(project.activeFrame.paths[1].view.item.applyMatrix).to.equal(false);
        expect(project.activeFrame.paths[2].view.item.applyMatrix).to.equal(true);
    });

    it('should update wick selection transforms when paper selection transform changes', function () {
        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(25,25),
            radius: 25,
            fillColor: '#ff0000',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(75,25),
            radius: 25,
            fillColor: '#00ff00',
        }));
        var path3 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(75,75),
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
        project.selection.view.selection.width = 200;
        project.view.applyChanges();

        expect(project.selection.numObjects).to.equal(3);
        expect(project.selection.getSelectedObjects()[0].uuid).to.equal(path1.uuid);
        expect(project.selection.getSelectedObjects()[1].uuid).to.equal(path2.uuid);
        expect(project.selection.getSelectedObjects()[2].uuid).to.equal(path3.uuid);
        expect(project.selection.transformation.scaleX).to.equal(2);
        expect(project.selection.view.selection.width = 200);

        // (BUG) Double render: Make sure selection transforms didn't change
        project.view.render();

        expect(project.selection.numObjects).to.equal(3);
        expect(project.selection.getSelectedObjects()[0].uuid).to.equal(path1.uuid);
        expect(project.selection.getSelectedObjects()[1].uuid).to.equal(path2.uuid);
        expect(project.selection.getSelectedObjects()[2].uuid).to.equal(path3.uuid);
        expect(project.selection.transformation.scaleX).to.equal(2);
        expect(project.selection.view.selection.width = 200);
    });

    it('should update wick paths when selection is cleared', function () {
        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(25,25),
            radius: 25,
            fillColor: '#ff0000',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(75,25),
            radius: 25,
            fillColor: '#00ff00',
        }));
        var path3 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(75,75),
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
        project.selection.view.selection.width = 200;
        project.view.applyChanges();

        expect(project.selection.numObjects).to.equal(3);
        expect(project.selection.getSelectedObjects()[0].uuid).to.equal(path1.uuid);
        expect(project.selection.getSelectedObjects()[1].uuid).to.equal(path2.uuid);
        expect(project.selection.getSelectedObjects()[2].uuid).to.equal(path3.uuid);
        expect(project.selection.transformation.scaleX).to.equal(2);
        expect(project.selection.view.selection.width = 200);

        project.selection.clear();
        project.view.render();

        expect(project.selection.numObjects).to.equal(0);
        expect(path1.view.item.bounds.width).to.equal(100);
        expect(path1.view.item.bounds.height).to.equal(50);
        expect(path2.view.item.bounds.width).to.equal(100);
        expect(path2.view.item.bounds.height).to.equal(50);
        expect(path3.view.item.bounds.width).to.equal(100);
        expect(path3.view.item.bounds.height).to.equal(50);
    });

    it('should update wick paths when playhead is moved (selection is automatically cleared)', function () {
        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(25,25),
            radius: 25,
            fillColor: '#ff0000',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(75,25),
            radius: 25,
            fillColor: '#00ff00',
        }));
        var path3 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(75,75),
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
        project.selection.view.selection.width = 200;
        project.view.applyChanges();

        expect(project.selection.numObjects).to.equal(3);
        expect(project.selection.getSelectedObjects()[0].uuid).to.equal(path1.uuid);
        expect(project.selection.getSelectedObjects()[1].uuid).to.equal(path2.uuid);
        expect(project.selection.getSelectedObjects()[2].uuid).to.equal(path3.uuid);
        expect(project.selection.transformation.scaleX).to.equal(2);
        expect(project.selection.view.selection.width = 200);

        project.activeTimeline.playheadPosition = 2;
        project.view.render();

        expect(project.selection.numObjects).to.equal(0);
        expect(path1.view.item.bounds.width).to.equal(100);
        expect(path1.view.item.bounds.height).to.equal(50);
        expect(path2.view.item.bounds.width).to.equal(100);
        expect(path2.view.item.bounds.height).to.equal(50);
        expect(path3.view.item.bounds.width).to.equal(100);
        expect(path3.view.item.bounds.height).to.equal(50);
    });

    it('should clear selection transformation when selection is changed', function () {
        var project = new Wick.Project();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(25,25),
            radius: 25,
            fillColor: '#ff0000',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(75,25),
            radius: 25,
            fillColor: '#00ff00',
        }));
        var path3 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(75,75),
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
        project.selection.view.selection.width = 200;
        project.view.applyChanges();

        expect(project.selection.transformation.x).to.equal(0);
        expect(project.selection.transformation.y).to.equal(0);
        expect(project.selection.transformation.scaleX).to.equal(2);
        expect(project.selection.transformation.scaleY).to.equal(1);
        expect(project.selection.transformation.rotation).to.equal(0);

        project.selection.clear();
        project.view.render();

        expect(project.selection.transformation.x).to.equal(0);
        expect(project.selection.transformation.y).to.equal(0);
        expect(project.selection.transformation.scaleX).to.equal(1);
        expect(project.selection.transformation.scaleY).to.equal(1);
        expect(project.selection.transformation.rotation).to.equal(0);
    });
});
