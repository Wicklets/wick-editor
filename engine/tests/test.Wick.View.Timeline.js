describe('Wick.View.Timeline', function() {
    describe('#render (SVG)', function () {
        it('should call render() with blank timeline without errors', function() {
            var project = new Wick.Project();
            project.root.timeline = new Wick.Timeline();
            project.root.timeline.view.render(project.root);
        });

        it('should create layers for populated timeline', function() {
            var project = new Wick.Project();
            project.root.timeline = new Wick.Timeline();
            var timeline = project.root.timeline;

            timeline.addLayer(new Wick.Layer());
            timeline.addLayer(new Wick.Layer());
            timeline.addLayer(new Wick.Layer());
            timeline.layers[0].addFrame(new Wick.Frame({start:1}));
            timeline.layers[0].addFrame(new Wick.Frame({start:2}));
            timeline.layers[0].addFrame(new Wick.Frame({start:3}));
            timeline.layers[1].addFrame(new Wick.Frame({start:1}));
            timeline.layers[2].addFrame(new Wick.Frame({start:1}));
            timeline.playheadPosition = 1;

            timeline.view.render();

            expect(timeline.view.frameLayers.length).to.equal(3);
            expect(timeline.view.frameLayers[0] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.frameLayers[1] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.frameLayers[2] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.frameLayers[0].data.wickUUID).to.equal(timeline.layers[2].frames[0].uuid);
            expect(timeline.view.frameLayers[1].data.wickUUID).to.equal(timeline.layers[1].frames[0].uuid);
            expect(timeline.view.frameLayers[2].data.wickUUID).to.equal(timeline.layers[0].frames[0].uuid);

            timeline.playheadPosition = 2;
            timeline.view.render();

            expect(timeline.view.frameLayers.length).to.equal(1);
            expect(timeline.view.frameLayers[0] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.frameLayers[0].data.wickUUID).to.equal(timeline.layers[0].frames[1].uuid);
        });

        it('should render hidden layers if project publishedMode is set to true', function() {
            // TODO
        });
    });
});
