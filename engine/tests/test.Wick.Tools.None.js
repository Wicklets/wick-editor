describe('Wick.Tools.None', function() {
    it('should activate without errors', function() {
        var project = new Wick.Project();
        project.tools.none.activate();
    });

    it('should fire warnings when clicked (no frame)', function (done) {
        var project = new Wick.Project();
        project.activeFrame.remove();

        project.view.render();
        project.view.on('error', (e) => {
            expect(e.message).to.equal('CLICK_NOT_ALLOWED_NO_FRAME');
            done();
        });

        project.tools.none.activate();
        project.tools.none.onMouseDown({});
    });

    it('should fire warnings when clicked (layer locked)', function (done) {
        var project = new Wick.Project();
        project.activeLayer.locked = true;

        project.view.render();
        project.view.on('error', (e) => {
            expect(e.message).to.equal('CLICK_NOT_ALLOWED_LAYER_LOCKED');
            done();
        });

        project.tools.none.activate();
        project.tools.none.onMouseDown({});
    });

    it('should fire warnings when clicked (layer hidden)', function (done) {
        var project = new Wick.Project();
        project.activeLayer.hidden = true;

        project.view.render();
        project.view.on('error', (e) => {
            expect(e.message).to.equal('CLICK_NOT_ALLOWED_LAYER_HIDDEN');
            done();
        });

        project.tools.none.activate();
        project.tools.none.onMouseDown({});
    });
});
