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
            timeline.layers[0].addFrame(new Wick.Frame(1));
            timeline.layers[0].addFrame(new Wick.Frame(2));
            timeline.layers[0].addFrame(new Wick.Frame(3));
            timeline.layers[1].addFrame(new Wick.Frame(1));
            timeline.layers[2].addFrame(new Wick.Frame(1));
            timeline.playheadPosition = 1;

            timeline.view.render();

            expect(timeline.view.activeFrameLayers.length).to.equal(6);
            expect(timeline.view.activeFrameLayers[0] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.activeFrameLayers[1] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.activeFrameLayers[2] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.activeFrameLayers[3] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.activeFrameLayers[4] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.activeFrameLayers[5] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.activeFrameLayers[4].data.wickUUID).to.equal(timeline.layers[0].frames[0].uuid);
            expect(timeline.view.activeFrameLayers[5].data.wickUUID).to.equal(timeline.layers[0].frames[0].uuid);
            expect(timeline.view.activeFrameLayers[2].data.wickUUID).to.equal(timeline.layers[1].frames[0].uuid);
            expect(timeline.view.activeFrameLayers[3].data.wickUUID).to.equal(timeline.layers[1].frames[0].uuid);
            expect(timeline.view.activeFrameLayers[0].data.wickUUID).to.equal(timeline.layers[2].frames[0].uuid);
            expect(timeline.view.activeFrameLayers[1].data.wickUUID).to.equal(timeline.layers[2].frames[0].uuid);

            timeline.playheadPosition = 2;
            timeline.view.render();

            expect(timeline.view.activeFrameLayers.length).to.equal(2);
            expect(timeline.view.activeFrameLayers[0] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.activeFrameLayers[1] instanceof paper.Layer).to.equal(true);
            expect(timeline.view.activeFrameLayers[0].data.wickUUID).to.equal(timeline.layers[0].frames[1].uuid);
            expect(timeline.view.activeFrameLayers[1].data.wickUUID).to.equal(timeline.layers[0].frames[1].uuid);

            expect(timeline.view.onionSkinnedFramesLayers.length).to.equal(0);
        });
    });
});
