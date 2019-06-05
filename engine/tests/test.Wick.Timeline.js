describe('Wick.Timeline', function() {
    describe('#constructor', function () {
        it('should instantiate', function() {
            var timeline = new Wick.Timeline();
            expect(timeline.classname).to.equal('Timeline');
        });
    });

    describe('#playheadPosition', function () {
        it('should clear canvas selection when playhead moves', function () {
            var project = new Wick.Project();
            project.addObject(new Wick.Clip());
            project.addObject(new Wick.Clip());
            project.addObject(new Wick.Clip());

            project.selection.select(project.activeFrame.clips[0]);
            project.selection.select(project.activeFrame.clips[1]);
            project.selection.select(project.activeFrame.clips[2]);
            project.selection.select(project.activeFrame);

            project.focus.timeline.playheadPosition = 2;

            expect(project.selection.numObjects).to.equal(1);
            expect(project.selection.getSelectedObjects()[0]).to.equal(project.activeLayer.frames[0])
        });
    })

    describe('#layers', function () {
        it('should handle adding layers', function() {
            var timeline = new Wick.Timeline();

            var layer1 = new Wick.Layer();
            var layer2 = new Wick.Layer();
            var layer3 = new Wick.Layer();
            timeline.addLayer(layer1);
            timeline.addLayer(layer2);
            timeline.addLayer(layer3);

            expect(timeline.layers.indexOf(layer1)).to.equal(0);
            expect(timeline.layers.indexOf(layer2)).to.equal(1);
            expect(timeline.layers.indexOf(layer3)).to.equal(2);
        });

        it('should add/remove layers correctly', function () {
            var project = new Wick.Project();
            var layer1 = project.activeLayer;
            var layer2 = new Wick.Layer();
            var layer3 = new Wick.Layer();
            project.activeTimeline.addLayer(layer2);
            project.activeTimeline.addLayer(layer3);
            expect(project.activeTimeline.layers.length).to.equal(3);
            layer3.activate();
            layer3.remove();
            expect(project.activeLayer).to.equal(layer2);
            expect(project.activeTimeline.layers.length).to.equal(2);
            expect(project.activeTimeline.layers.indexOf(layer3)).to.equal(-1);
            layer1.activate();
            layer2.remove();
            expect(project.activeLayer).to.equal(layer1);
            expect(project.activeTimeline.layers.length).to.equal(1);
            expect(project.activeTimeline.layers.indexOf(layer2)).to.equal(-1);
            layer1.remove();
            expect(project.activeTimeline.layers.length).to.equal(1);
            expect(project.activeTimeline.layers.indexOf(layer1)).to.equal(0);
        });

        it('should handle layer ordering', function() {
            var timeline = new Wick.Timeline();

            var layer1 = new Wick.Layer();
            var layer2 = new Wick.Layer();
            var layer3 = new Wick.Layer();
            timeline.addLayer(layer1);
            timeline.addLayer(layer2);
            timeline.addLayer(layer3);

            timeline.moveLayer(layer1, 2);

            expect(timeline.layers.indexOf(layer1)).to.equal(2);
            expect(timeline.layers.indexOf(layer2)).to.equal(0);
            expect(timeline.layers.indexOf(layer3)).to.equal(1);
        });
    });

    describe('#length', function () {
        it('should calculate length correctly', function() {
            var timeline = new Wick.Timeline();

            var layer1 = new Wick.Layer();
            var layer2 = new Wick.Layer();
            var layer3 = new Wick.Layer();
            timeline.addLayer(layer1);
            timeline.addLayer(layer2);
            timeline.addLayer(layer3);

            timeline.layers[0].addFrame(new Wick.Frame({start:1,end:5}));
            timeline.layers[1].addFrame(new Wick.Frame({start:5,end:10}));
            timeline.layers[2].addFrame(new Wick.Frame({start:3,end:7}));
            expect(timeline.length).to.equal(10)
        });
    });

    describe('#advance', function () {
        it('should advance correctly', function() {
            var timeline = new Wick.Timeline();
            timeline.addLayer(new Wick.Layer());
            timeline.layers[0].addFrame(new Wick.Frame({start:1,end:5}));

            expect(timeline.playheadPosition).to.equal(1);
            timeline.advance();
            expect(timeline.playheadPosition).to.equal(2);
        });

        it('advance() should not move playhead if _playing is false', function() {
            var timeline = new Wick.Timeline();
            timeline.addLayer(new Wick.Layer());
            timeline.layers[0].addFrame(new Wick.Frame({start:1,end:5}));

            timeline._playing = false;
            timeline.advance();
            expect(timeline.playheadPosition).to.equal(1);
        });

        it('advance() should loop back to beginning if playhead is at the end', function() {
            var timeline = new Wick.Timeline();
            timeline.addLayer(new Wick.Layer());
            timeline.layers[0].addFrame(new Wick.Frame(1,5));

            timeline.playheadPosition = 5;
            timeline._playing = true;
            timeline.advance();
            expect(timeline.playheadPosition).to.equal(1);
        });

        it('should advance to given frame if _forceNextFrame is set', function () {
            var timeline = new Wick.Timeline();
            timeline.addLayer(new Wick.Layer());
            timeline.layers[0].addFrame(new Wick.Frame(1,5));

            timeline._forceNextFrame = 3;
            timeline._playing = true;
            timeline.advance();
            expect(timeline.playheadPosition).to.equal(3);

            timeline._forceNextFrame = 5;
            timeline._playing = false;
            timeline.advance();
            expect(timeline.playheadPosition).to.equal(5);
        });
    });

    describe('#activeFrames', function () {
        it('should calculate active frames correctly', function() {
            var timeline = new Wick.Timeline();
            timeline.addLayer(new Wick.Layer());
            var frame = new Wick.Frame(1,5);
            timeline.layers[0].addFrame(frame);

            timeline.playheadPosition = 1;
            expect(timeline.activeFrames.length).to.equal(1);
            expect(timeline.activeFrames[0]).to.equal(frame);
        });
    });

    describe('#activeLayer', function () {
        it('should calculate active layer correctly', function() {
            var timeline = new Wick.Timeline();
            timeline.addLayer(new Wick.Layer());
            timeline.addLayer(new Wick.Layer());
            timeline.addLayer(new Wick.Layer());
            timeline.layers[0].title = 'Layer A';
            timeline.layers[1].title = 'Layer B';
            timeline.layers[2].title = 'Layer C';

            expect(timeline.activeLayer.title).to.equal('Layer A');
            timeline.activeLayerIndex = 1;
            expect(timeline.activeLayer.title).to.equal('Layer B');
            timeline.activeLayerIndex = 2;
            expect(timeline.activeLayer.title).to.equal('Layer C');
        });
    });

    describe('#getFramesAtPlayheadPosition', function () {
        it('should return correct frames', function() {
            var timeline = new Wick.Timeline();
            timeline.addLayer(new Wick.Layer()); // Three frames on this layer!
            timeline.addLayer(new Wick.Layer()); // One frame on this layer
            timeline.addLayer(new Wick.Layer()); // No frames on this layer!

            // timeline looks like this:

            // Layer 0 | F
            // Layer 1 | F
            // Layer 2 | F F

            timeline.layers[0].addFrame(new Wick.Frame({start:1}));
            timeline.layers[1].addFrame(new Wick.Frame({start:1}));
            timeline.layers[2].addFrame(new Wick.Frame({start:1}));

            timeline.layers[2].addFrame(new Wick.Frame({start:2}));

            expect(timeline.getFramesAtPlayheadPosition(1).length).to.equal(3);
            expect(timeline.getFramesAtPlayheadPosition(2).length).to.equal(1);
            expect(timeline.getFramesAtPlayheadPosition(3).length).to.equal(0);
        });
    });

    describe('gotoNextFrame', function () {
        it('gotoNextFrame should work correctly', function () {
            var timeline = new Wick.Timeline();
            timeline.addLayer(new Wick.Layer());
            timeline.activeLayer.addFrame(new Wick.Frame({start: 1}));
            timeline.activeLayer.addFrame(new Wick.Frame({start: 2}));
            timeline.activeLayer.addFrame(new Wick.Frame({start: 3}));

            expect(timeline.playheadPosition).to.equal(1);
            timeline.gotoNextFrame();
            timeline.advance();
            expect(timeline.playheadPosition).to.equal(2);
            timeline.gotoNextFrame();
            timeline.advance();
            expect(timeline.playheadPosition).to.equal(3);
            timeline.gotoNextFrame();
            timeline.advance();
            expect(timeline.playheadPosition).to.equal(1);
        });
    });

    describe('gotoPrevFrame', function () {
        it('gotoPrevFrame should work correctly', function () {
            var timeline = new Wick.Timeline();
            timeline.addLayer(new Wick.Layer());
            timeline.activeLayer.addFrame(new Wick.Frame({start: 1}));
            timeline.activeLayer.addFrame(new Wick.Frame({start: 2}));
            timeline.activeLayer.addFrame(new Wick.Frame({start: 3}));

            expect(timeline.playheadPosition).to.equal(1);
            timeline.gotoPrevFrame();
            timeline.advance();
            expect(timeline.playheadPosition).to.equal(3);
            timeline.gotoPrevFrame();
            timeline.advance();
            expect(timeline.playheadPosition).to.equal(2);
            timeline.gotoPrevFrame();
            timeline.advance();
            expect(timeline.playheadPosition).to.equal(1);
        });
    });

    it('bug: timeline Timeline deserialize() not resetting _playing flag', function (done) {
        var project = new Wick.Project();
        project.activeLayer.addFrame(new Wick.Frame({start: 2}));
        project.activeLayer.addFrame(new Wick.Frame({start: 3}));
        project.activeLayer.frames[2].addScript('default', 'stop()');

        function firstPlay () {
            project.play({
                onAfterTick: () => {
                    // Play until the third frame, then stop.
                    if(project.activeTimeline.playheadPosition === 3) {
                        expect(project.activeTimeline._playing).to.equal(false);
                        project.stop();
                        secondPlay();
                    }
                }
            })
        }

        function secondPlay () {
            project.play({
                onAfterTick: () => {
                    expect(project.activeTimeline.playheadPosition).to.equal(1);
                    expect(project.activeTimeline._playing).to.equal(true);
                    project.stop();
                    done();
                }
            });
        }

        firstPlay();
    });
});
