describe('Wick.Tools.Interact', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.tools.interact.activate();
    });

    it('should click a clip', function() {

    });

    it('should click a button', function() {
        var project = new Wick.Project();
        var interact = project.tools.interact;
        interact.activate();

        var button = new Wick.Button();
        button.addScript('mousedown', 'window.tempVar = "Mousedown fired."');
        project.activeFrame.addClip(button);

        var path = TestUtils.paperToWickPath(new paper.Path.Rectangle({
            from: [90, 90],
            to: [100, 100],
            fillColor: '#ff00ff',
        }));
        button.activeFrame.addPath(path);

        project.view.render();

        interact.onMouseMove({
            modifiers: {},
            point: new paper.Point(95,95),
        });
        interact.determineMouseTargets();
        project.tick();

        interact.onMouseDown({
            modifiers: {},
            point: new paper.Point(95,95),
        });
        interact.determineMouseTargets();
        project.tick();

        interact.onMouseUp({
            modifiers: {},
            point: new paper.Point(95,95),
            delta: new paper.Point(0,0),
        });
        interact.determineMouseTargets();
        project.tick();

        expect(window.tempVar).to.equal('Mousedown fired.');

        delete window.tempVar;
    });

    it('(bug) (touch screen issue) should click a button without onmousemove events', function() {
        var project = new Wick.Project();
        var interact = project.tools.interact;
        interact.activate();

        var button = new Wick.Button();
        button.addScript('mousedown', 'window.tempVar = "Mousedown fired."');
        project.activeFrame.addClip(button);

        var path = TestUtils.paperToWickPath(new paper.Path.Rectangle({
            from: [90, 90],
            to: [100, 100],
            fillColor: '#ff00ff',
        }));
        button.activeFrame.addPath(path);

        project.view.render();

        project.tick();
        interact.onMouseDown({
            modifiers: {},
            point: new paper.Point(95,95),
        });
        interact.determineMouseTargets();
        project.tick();

        expect(window.tempVar).to.equal('Mousedown fired.');

        delete window.tempVar;
    });

    it('should click a frame', function() {

    });

    it('should be able to click clips on locked layers', function() {

    });

    it('should be able to click frames on locked layers', function() {

    });
});
