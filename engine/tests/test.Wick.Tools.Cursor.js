describe('Wick.Tools.Cursor', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.view.tools.cursor.activate();
    });

    it('should select/deselect items by clicking', function() {
        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;
        cursor.activate();

        var pathJson1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var pathJson2 = ["Path",{"segments":[[50,100],[50,50],[100,50],[100,100]],"closed":true,"fillColor":[1,0,0]}];

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(25, 25),
            radius: 25,
            fillColor: '#ff0000',
        }));
        var path2 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(75, 75),
            radius: 25,
            fillColor: '#ff0000',
        }));
        project.activeFrame.addPath(path1);
        project.activeFrame.addPath(path2);
        project.view.render();

        /* Click path1, should select path1 */

        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(25,25),
            delta: new paper.Point(0,0),
        });

        expect(project.selection.getSelectedObject().uuid).to.equal(path1.uuid);

        /* Click nothing, should deselect path1 */

        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(200,200),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(200,200),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(200,200),
            delta: new paper.Point(0,0),
        });

        expect(project.selection.numObjects).to.equal(0);

        /* Click path1, then click path2, should select path2 and deselect path1. */

        // todo
    });

    it('should select multiple items correctly with shift held', function () {

        /* Click path1, then click path2 with shift held. should deselect both paths. */

        // todo

        throw new Error('nyi');
    })

    it('should select items correctly with selection box', function () {
        /* Click and drag box around path1, should select path1 */

        // todo

        /* Click and drag box around path1 (but with alt held), should NOT select path1 */

        // todo

        throw new Error('nyi');
    });

    it('should select multiple items correctly with selection box (shift held)', function() {

    });

    it('should translate selection by dragging correctly', function (done) {
        throw new Error('nyi')
    });

    it('should scale object by dragging handles correctly', function() {
        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;

        var pathJson1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var path1 = new Wick.Path({json: pathJson1});
        project.activeFrame.addPath(path1);

        project.view.render();

        cursor.activate();

        // Select the path
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(25,25),
            delta: new paper.Point(0,0),
        });

        // Scale the path horizontally by 50px, verically by 20px
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDrag({
            modifiers: {},
            point: new paper.Point(75,60),
            delta: new paper.Point(25,10),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(75,60),
            delta: new paper.Point(25,10),
        });

        // Deselect the path
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(200,200),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(200,200),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(200,200),
            delta: new paper.Point(0,0),
        });

        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].view.item.bounds.width).to.equal(100);
        expect(project.activeFrame.paths[0].view.item.bounds.height).to.equal(70);
    });

    it('should scale object by dragging handles correctly (shift held = preserve aspect ratio)', function() {
        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;

        var pathJson1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var path1 = new Wick.Path({json: pathJson1});
        project.activeFrame.addPath(path1);

        project.view.render();

        cursor.activate();

        // Select the path
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(25,25),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(25,25),
            delta: new paper.Point(0,0),
        });

        // Scale the path horizontally by 50px, verically by 20px
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDrag({
            modifiers: {shift: true},
            point: new paper.Point(75,60),
            delta: new paper.Point(25,10),
        });
        cursor.onMouseUp({
            modifiers: {shift: true},
            point: new paper.Point(75,60),
            delta: new paper.Point(25,10),
        });

        // Deselect the path
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(200,200),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(200,200),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(200,200),
            delta: new paper.Point(0,0),
        });

        expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].view.item.bounds.width).to.equal(100);
        expect(project.activeFrame.paths[0].view.item.bounds.height).to.equal(100);
    });

    it('should rotate selection by dragging handles correctly', function (done) {
        throw new Error('nyi')
    });

    it('should drag a segment of a path to modify that path', function (done) {
        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;

        var pathJson1 = ["Path",{"segments":[[0,0],[50,0],[50,50],[0,50]],"closed":true,"fillColor":[1,0,0]}];
        var path1 = new Wick.Path({json: pathJson1});
        project.activeFrame.addPath(path1);
        project.view.render();

        cursor.activate();

        project.view.on('canvasModified', (e) => {
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].uuid).to.equal(path1.uuid);
            expect(project.activeFrame.paths[0].view.item.bounds.width).to.equal(55);
            expect(project.activeFrame.paths[0].view.item.bounds.height).to.equal(55);
            done();
        });

        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(50,50),
        });
        cursor.onMouseDrag({
            modifiers: {},
            point: new paper.Point(55,55),
            delta: new paper.Point(5,5),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(50,50),
            delta: new paper.Point(5,5),
        });
    });
});

// Old tests:
/*
    it('Should clear selection and select item if segment is clicked', function() {

    });

    it('Should clear selection and select item if curve is clicked', function() {

    });

    it('Should add item to selection if segment is clicked and shift is held', function() {

    });

    it('Should add item to selection if curve is clicked and shift is held', function() {

    });

    it('Should drag curve and update item', function() {

    });
});
*/
