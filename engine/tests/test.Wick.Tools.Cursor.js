describe('Wick.Tools.Cursor', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.view.tools.cursor.activate();
    });

    it('should select/deselect items by clicking', function() {
        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;
        cursor.activate();

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

        expect(project.selection.numObjects).to.equal(1);
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

        // click path1
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

        // click path2
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(75,75),
        });
        cursor.onMouseDown({
            modifiers: {},
            point: new paper.Point(75,75),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(75,75),
            delta: new paper.Point(0,0),
        });

        expect(project.selection.numObjects).to.equal(1);
        expect(project.selection.getSelectedObject().uuid).to.equal(path2.uuid);
    });

    it('should select multiple items correctly with shift held', function () {

        /* Click path1, then click path2 with shift held. should deselect both paths. */

        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;
        cursor.activate();

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

        project.view.render();

        /* Click path2 with shift held, should select path2 */
        cursor.onMouseMove({
            modifiers: {},
            point: new paper.Point(75,75),
        });
        cursor.onMouseDown({
            modifiers: {shift: true},
            point: new paper.Point(75,75),
        });
        cursor.onMouseUp({
            modifiers: {},
            point: new paper.Point(75,75),
            delta: new paper.Point(0,0),
        });

        expect(project.selection.numObjects).to.equal(2);
        expect(project.selection.getSelectedObjects()[0].uuid).to.equal(path1.uuid);
        expect(project.selection.getSelectedObjects()[1].uuid).to.equal(path2.uuid);
    })

    it('should select items correctly with selection box', function () {
        /* Click and drag box around path1, should select path1 */

        // todo

        /* Click and drag box around path2, should select path2 */

        // todo

        /* Click and drag box around path1 and path2, should select path1 and path2 */

        // todo
    });

    it('should select items correctly with selection box (alt held)', function () {
        /* Click and drag box around path1 and only touching path2 (with alt held), should select path1, should NOT select path2 */

        // todo
    });

    it('should select multiple items correctly with selection box (shift held)', function() {
        /* Click and drag box around path1, should select path1 */

        // todo

        /* Click and drag box around path2 (with shift held), should select path1 and path2 */

        // todo
    });

    it('should translate selection by dragging correctly', function () {
        /* select path1 */

        // todo

        /* Drag selection, should change selection transform */

        // todo

        /* Click anywhere, should apply transforms and move path1 */

        // todo
    });

    it('should scale object by dragging handles correctly', function () {
        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;
        cursor.activate();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(25, 25),
            radius: 25,
            fillColor: '#ff0000',
        }));

        project.activeFrame.addPath(path1);
        project.view.render();

        /* Click path1, should select path1 */
        cursor.onMouseMove({
            point: new paper.Point(25,25),
        });
        cursor.onMouseDown({
            point: new paper.Point(25,25),
        });
        cursor.onMouseUp({
            point: new paper.Point(25,25),
            delta: new paper.Point(0,0),
        });

        project.view.render();

        /*
        /* Click and drag bottom right handle, should scale path1 */
        cursor.onMouseMove({
            point: new paper.Point(50,50),
        });
        cursor.onMouseDown({
            point: new paper.Point(50,50),
        });
        cursor.onMouseDrag({
            point: new paper.Point(75,50),
        });
        cursor.onMouseUp({
            point: new paper.Point(75,50),
            delta: new paper.Point(0,0),
        });

        project.view.render(); // BUG: THIS RENDER CAUSED THE DOUBLE TRANSFORM.

        expect(project.selection.transformation.x).to.equal(0);
        expect(project.selection.transformation.y).to.equal(0);
        expect(project.selection.transformation.scaleX).to.equal(2);
        expect(project.selection.transformation.scaleY).to.equal(1);
        expect(project.selection.transformation.rotation).to.equal(0);

        /* Click outside of path1, will deselect path1 and apply the scale transform */
        cursor.onMouseMove({
            point: new paper.Point(200,200),
        });
        cursor.onMouseDown({
            point: new paper.Point(200,200),
        });
        cursor.onMouseUp({
            point: new paper.Point(200,200),
            delta: new paper.Point(0,0),
        });

        project.view.render();

        expect(project.selection.numObjects).to.equal(0);
        expect(project.selection.transformation.x).to.equal(0);
        expect(project.selection.transformation.y).to.equal(0);
        expect(project.selection.transformation.scaleX).to.equal(1);
        expect(project.selection.transformation.scaleY).to.equal(1);
        expect(project.selection.transformation.rotation).to.equal(0);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].bounds.width).to.equal(100);
        expect(project.activeFrame.paths[0].bounds.height).to.equal(50);
        expect(project.activeFrame.paths[0].bounds.top).to.equal(0);
        expect(project.activeFrame.paths[0].bounds.bottom).to.equal(50);
        expect(project.activeFrame.paths[0].bounds.left).to.equal(-25);
        expect(project.activeFrame.paths[0].bounds.right).to.equal(75);
    });

    it('should scale object by dragging handles correctly (shift held = preserve aspect ratio)', function () {
        var project = new Wick.Project();
        var cursor = project.view.tools.cursor;
        cursor.activate();

        var path1 = TestUtils.paperToWickPath(new paper.Path.Ellipse({
            center: new paper.Point(25, 25),
            radius: 25,
            fillColor: '#ff0000',
        }));

        project.activeFrame.addPath(path1);
        project.view.render();

        /* Click path1, should select path1 */
        cursor.onMouseMove({
            point: new paper.Point(25,25),
        });
        cursor.onMouseDown({
            point: new paper.Point(25,25),
        });
        cursor.onMouseUp({
            point: new paper.Point(25,25),
            delta: new paper.Point(0,0),
        });

        project.view.render();

        /*
        /* Click and drag bottom right handle, should scale path1 */
        cursor.onMouseMove({
            point: new paper.Point(50,50),
        });
        cursor.onMouseDown({
            point: new paper.Point(50,50),
        });
        cursor.onMouseDrag({
            point: new paper.Point(75,50),
            modifiers: {shift:true},
        });
        cursor.onMouseUp({
            point: new paper.Point(75,50),
            delta: new paper.Point(0,0),
        });

        project.view.render();

        expect(project.selection.transformation.x).to.equal(0);
        expect(project.selection.transformation.y).to.equal(0);
        expect(project.selection.transformation.scaleX).to.equal(2);
        expect(project.selection.transformation.scaleY).to.equal(2);
        expect(project.selection.transformation.rotation).to.equal(0);

        /* Click outside of path1, will deselect path1 and apply the scale transform */
        cursor.onMouseMove({
            point: new paper.Point(200,200),
        });
        cursor.onMouseDown({
            point: new paper.Point(200,200),
        });
        cursor.onMouseUp({
            point: new paper.Point(200,200),
            delta: new paper.Point(0,0),
        });

        project.view.render();

        expect(project.selection.numObjects).to.equal(0);
        expect(project.selection.transformation.x).to.equal(0);
        expect(project.selection.transformation.y).to.equal(0);
        expect(project.selection.transformation.scaleX).to.equal(1);
        expect(project.selection.transformation.scaleY).to.equal(1);
        expect(project.selection.transformation.rotation).to.equal(0);
        expect(project.activeFrame.paths.length).to.equal(1);
        expect(project.activeFrame.paths[0].bounds.top).to.equal(-25);
        expect(project.activeFrame.paths[0].bounds.bottom).to.equal(75);
        expect(project.activeFrame.paths[0].bounds.left).to.equal(-25);
        expect(project.activeFrame.paths[0].bounds.right).to.equal(75);
    });

    it('should rotate selection by dragging handles correctly', function () {
        // todo
    });

    it('should drag a segment of a path to modify that path', function () {
        // todo
    });

    it('should drag a curve of a path to modify that path', function () {
        // todo
    });

    it('Should clear selection and select item if segment is clicked', function() {
        // todo
    });

    it('Should clear selection and select item if curve is clicked', function() {
        // todo
    });

    it('Should add item to selection if segment is clicked and shift is held', function() {
        // todo
    });

    it('Should add item to selection if curve is clicked and shift is held', function() {
        // todo
    });
});
