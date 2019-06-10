describe('Wick.Tools.Eyedropper', function() {
    // NOTE: The eyedropper needs a canvas that exists in the document that we can use toDataURL on.
    // These helper functions provide the project with working canvas. Make sure to use them in the tests.
    function buildDummyCanvasContainer (project) {
        var dummyContainer = document.createElement('div');
        document.body.appendChild(dummyContainer);
        dummyContainer.style.width = project.width + 'px';
        dummyContainer.style.height = project.height + 'px';
        project.view.canvasContainer = dummyContainer;
        project.view.resize();
        project.view.render();
    }

    function destroyDummyCanvasContainer (project) {
        document.body.removeChild(project.view.canvasContainer);
    }

    it('should activate without errors', function() {
        var project = new Wick.Project();
        buildDummyCanvasContainer(project);

        project.tools.eyedropper.activate();

        destroyDummyCanvasContainer(project);
    });

    it('should pick fill color', function(done) {
        var project = new Wick.Project();
        var eyedropper = project.tools.eyedropper;
        buildDummyCanvasContainer(project);

        project.activeFrame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
            from: [0, 0],
            to: [100, 100],
            fillColor: '#ff00ff',
        })));
        project.view.render();

        project.view.on('canvasModified', function (e) {
            expect(project.toolSettings.getSetting('fillColor').toCSS(true)).to.equal('#ff00ff');
            destroyDummyCanvasContainer(project);
            done();
        });

        setTimeout(() => {
            eyedropper.activate();
            eyedropper.onMouseMove({point: new paper.Point(99,99)});
            eyedropper.onMouseDown({point: new paper.Point(99,99), modifiers: {}});
            eyedropper.onMouseUp({point: new paper.Point(99,99)});
        }, 50);
    });
});
