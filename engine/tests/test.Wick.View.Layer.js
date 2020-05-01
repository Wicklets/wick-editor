describe('Wick.View.Layer', function() {
    describe('#render (SVG)', function () {
        it('should call render() with blank layer without errors', function() {
            var project = new Wick.Project();

            var layer = new Wick.Layer();
            project.root.timeline.addLayer(layer);
            layer.view.render(layer);
        });

        it('should create frame views from layer frames', function() {
            var project = new Wick.Project();

            var layer = new Wick.Layer();
            project.root.timeline.addLayer(layer);

            layer.addFrame(new Wick.Frame({start:1}));
            layer.addFrame(new Wick.Frame({start:2}));
            layer.addFrame(new Wick.Frame({start:3}));

            layer.view.render(layer);

            expect(layer.view.activeFrameLayers.length).to.equal(1);
            expect(layer.view.activeFrameLayers[0].data.wickUUID).to.equal(layer.frames[0].uuid);
        });

        it('should have no visible layers if there is no frame at active playhead position', function() {
            var project = new Wick.Project();
            project.activeTimeline.playheadPosition = 4;

            var layer = project.activeLayer;
            layer.addFrame(new Wick.Frame({start:2}));
            layer.addFrame(new Wick.Frame({start:3}));

            project.view.render();

            expect(layer.view.activeFrameLayers.length).to.equal(0);
        });

        it('should create layers for onion skinned frames', function() {
            var project = new Wick.Project();
            project.onionSkinEnabled = true;
            project.onionSkinSeekBackwards = 1;
            project.onionSkinSeekForwards = 1;
            project.focus.timeline.playheadPosition = 2;

            var layer = project.activeLayer;
            project.root.timeline.addLayer(layer);
            layer.addFrame(new Wick.Frame({start:2}));
            layer.addFrame(new Wick.Frame({start:3}));

            // Two frames = two layers
            layer.view.render();
            expect(layer.view.onionSkinnedFramesLayers.length).to.equal(2);

            project.onionSkinEnabled = true;
            project.onionSkinSeekBackwards = 1;
            project.onionSkinSeekForwards = 1;
            project.focus.timeline.playheadPosition = 5;

            // Playhead moved, now there should be no onion skin layers
            layer.view.render();
            expect(layer.view.onionSkinnedFramesLayers.length).to.equal(0);
        });

        it('onion skinned frames should have correct opacity (simple)', function() {
            var project = new Wick.Project();
            project.onionSkinEnabled = true;
            project.onionSkinSeekBackwards = 1;
            project.onionSkinSeekForwards = 1;

            var layer = project.activeLayer;
            layer.addFrame(new Wick.Frame({start:2}));
            layer.addFrame(new Wick.Frame({start:3}));

            project.focus.timeline.playheadPosition = 2;
            project.view.render();
            expect(layer.view.onionSkinnedFramesLayers[0].opacity).to.be.closeTo(Wick.View.Layer.BASE_ONION_OPACITY, 0.001);
            expect(layer.view.onionSkinnedFramesLayers[1].opacity).to.be.closeTo(Wick.View.Layer.BASE_ONION_OPACITY, 0.001);
        });

        it('onion skinned frames should have correct opacity (many frames)', function() {
            var project = new Wick.Project();
            project.onionSkinEnabled = true;
            project.onionSkinSeekBackwards = 1;
            project.onionSkinSeekForwards = 5;

            var layer = project.activeLayer;
            layer.addFrame(new Wick.Frame({start:2}));
            layer.addFrame(new Wick.Frame({start:3}));
            layer.addFrame(new Wick.Frame({start:4}));
            layer.addFrame(new Wick.Frame({start:5}));
            layer.addFrame(new Wick.Frame({start:6}));
            layer.addFrame(new Wick.Frame({start:7}));

            project.focus.timeline.playheadPosition = 2;
            project.view.render();
            expect(layer.view.onionSkinnedFramesLayers[0].opacity).to.be.closeTo((1/1)*Wick.View.Layer.BASE_ONION_OPACITY, 0.001);
            expect(layer.view.onionSkinnedFramesLayers[1].opacity).to.be.closeTo((5/5)*Wick.View.Layer.BASE_ONION_OPACITY, 0.001);
            expect(layer.view.onionSkinnedFramesLayers[2].opacity).to.be.closeTo((4/5)*Wick.View.Layer.BASE_ONION_OPACITY, 0.001);
            expect(layer.view.onionSkinnedFramesLayers[3].opacity).to.be.closeTo((3/5)*Wick.View.Layer.BASE_ONION_OPACITY, 0.001);
            expect(layer.view.onionSkinnedFramesLayers[4].opacity).to.be.closeTo((2/5)*Wick.View.Layer.BASE_ONION_OPACITY, 0.001);
            expect(layer.view.onionSkinnedFramesLayers[5].opacity).to.be.closeTo((1/5)*Wick.View.Layer.BASE_ONION_OPACITY, 0.001);
        });

        it('(bug) onion skinned extended frames should have correct opacity', function() {
          var project = new Wick.Project();
          project.onionSkinEnabled = true;
          project.onionSkinSeekBackwards = 0;
          project.onionSkinSeekForwards = 100;

          var layer = project.activeLayer;
          layer.addFrame(new Wick.Frame({start:2, end:10}));
          layer.addFrame(new Wick.Frame({start:11, end:100}));

          project.view.render();
          expect(layer.view.onionSkinnedFramesLayers[0].opacity).to.be.closeTo((100/100)*Wick.View.Layer.BASE_ONION_OPACITY, 0.001);
          expect(layer.view.onionSkinnedFramesLayers[1].opacity).to.be.closeTo((91/100)*Wick.View.Layer.BASE_ONION_OPACITY, 0.001);
        });

        it('should not create layers for frames outside onion range', function() {
            var project = new Wick.Project();
            project.onionSkinEnabled = true;
            project.onionSkinSeekBackwards = 1;
            project.onionSkinSeekForwards = 1;
            project.focus.timeline.playheadPosition = 5;

            var layer = project.activeLayer;
            layer.addFrame(new Wick.Frame({start:2}));
            layer.addFrame(new Wick.Frame({start:3}));

            layer.view.render();

            // Nothing is in range, no onion layers!
            expect(layer.view.onionSkinnedFramesLayers.length).to.equal(0);
        });

        it('should not create layers for frames that dont belong to the focused clip', function() {
            // TODO
        });
    });
});
