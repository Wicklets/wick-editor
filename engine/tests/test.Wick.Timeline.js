describe('Wick.Timeline', function() {
    describe('#constructor', function () {
        it('should instantiate', function() {
            var timeline = new Wick.Timeline();
            expect(timeline.classname).to.equal('Timeline');
        });
    });
/*
    describe('#serialize', function () {
        it('should serialize correctly', function() {
            var timeline = new Wick.Timeline();
            timeline.addLayer(new Wick.Layer());
            var data = timeline.serialize();

            expect(data.classname).to.equal('Timeline');
            expect(data.playheadPosition).to.equal(timeline.playheadPosition);
            expect(data.activeLayerIndex).to.equal(timeline.activeLayerIndex);
            expect(data.layers.length).to.equal(1);
            expect(data.layers[0].classname).to.equal('Layer');
        });
    });

    describe('#_deserialize', function () {
        it('should deserialize correctly', function() {
            var data = {
                classname: 'Timeline',
                playheadPosition: 1,
                activeLayerIndex: 0,
                layers: [new Wick.Layer().serialize()],
            };
            var timeline = Wick.Timeline.deserialize(data);

            expect(timeline instanceof Wick.Timeline).to.equal(true);
            expect(timeline.playheadPosition).to.equal(data.playheadPosition);
            expect(timeline.activeLayerIndex).to.equal(data.activeLayerIndex);
            expect(timeline.layers.length).to.equal(1);
            expect(timeline.layers[0] instanceof Wick.Layer).to.equal(true);
        });
    });
*/
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
/*
    describe('#insertFrames', function () {
        it('should insert frames in correct places (no frames)', function() {
            var project = new Wick.Project();
            project.root.timeline.insertFrames([]);
            expect(project.root.timeline.activeLayer.frames.length).to.equal(1);
        });

        it('should insert frames in correct places (single frame)', function() {
            var project = new Wick.Project();
            var origFrame = project.activeFrame;
            var newFrame = origFrame.clone();
            project.root.timeline.insertFrames([newFrame]);

            expect(project.root.timeline.activeLayer.frames.length).to.equal(2);
            expect(project.root.timeline.activeLayer.getFrameAtPlayheadPosition(1)).to.equal(origFrame);
            expect(project.root.timeline.activeLayer.getFrameAtPlayheadPosition(2)).to.equal(newFrame);
        });

        it('should insert frames in correct places (many frames)', function() {
            var project = new Wick.Project();
            var frame1 = project.activeFrame;
            var frame2 = new Wick.Frame(2,5);
            project.activeLayer.addFrame(frame2);
            var frame3 = new Wick.Frame(6,10);
            project.activeLayer.addFrame(frame3);

            frame1.identifier = 'frame1';
            frame2.identifier = 'frame2';
            frame3.identifier = 'frame3';

            var newFrame1 = frame1.clone();
            var newFrame2 = frame2.clone();
            var newFrame3 = frame3.clone();
            newFrame1.identifier = 'newFrame1';
            newFrame2.identifier = 'newFrame2';
            newFrame3.identifier = 'newFrame3';

            project.root.timeline.insertFrames([newFrame1, newFrame2, newFrame3]);

            var resultFrame1 = project.activeLayer.getFrameAtPlayheadPosition(1);
            var resultFrame2 = project.activeLayer.getFrameAtPlayheadPosition(2);
            var resultFrame3 = project.activeLayer.getFrameAtPlayheadPosition(6);
            var resultFrame4 = project.activeLayer.getFrameAtPlayheadPosition(11);
            var resultFrame5 = project.activeLayer.getFrameAtPlayheadPosition(12);
            var resultFrame6 = project.activeLayer.getFrameAtPlayheadPosition(16);

            expect(resultFrame1.identifier).to.equal('frame1');
            expect(resultFrame2.identifier).to.equal('frame2');
            expect(resultFrame3.identifier).to.equal('frame3');
            expect(resultFrame4.identifier).to.equal('newFrame1');
            expect(resultFrame5.identifier).to.equal('newFrame2');
            expect(resultFrame6.identifier).to.equal('newFrame3');
        });

        it('should insert frames in correct places (many frames, many layers)', function() {
            var project = new Wick.Project();
            var layer1 = project.activeLayer;

            var frame1 = project.activeFrame;
            var frame2 = new Wick.Frame(2,5);
            layer1.addFrame(frame2);
            var frame3 = new Wick.Frame(6,10);
            layer1.addFrame(frame3);

            var layer2 = new Wick.Layer();
            project.root.timeline.addLayer(layer2);
            var frame4 = new Wick.Frame(1,3);
            layer2.addFrame(frame4);

            frame1.identifier = 'frame1';
            frame2.identifier = 'frame2';
            frame3.identifier = 'frame3';
            frame4.identifier = 'frame4';

            var newFrame1 = frame1.clone();
            var newFrame2 = frame2.clone();
            var newFrame3 = frame3.clone();
            var newFrame4 = frame4.clone();
            newFrame1.identifier = 'newFrame1';
            newFrame2.identifier = 'newFrame2';
            newFrame3.identifier = 'newFrame3';
            newFrame4.identifier = 'newFrame4';

            project.root.timeline.insertFrames([newFrame1, newFrame2, newFrame3, newFrame4]);

            var resultFrame1 = layer1.getFrameAtPlayheadPosition(1);
            var resultFrame2 = layer1.getFrameAtPlayheadPosition(2);
            var resultFrame3 = layer1.getFrameAtPlayheadPosition(6);
            var resultFrame4 = layer2.getFrameAtPlayheadPosition(1);
            var resultFrame5 = layer1.getFrameAtPlayheadPosition(11);
            var resultFrame6 = layer1.getFrameAtPlayheadPosition(12);
            var resultFrame7 = layer1.getFrameAtPlayheadPosition(16);
            var resultFrame8 = layer2.getFrameAtPlayheadPosition(11);

            expect(resultFrame1).to.equal(frame1);
            expect(resultFrame2).to.equal(frame2);
            expect(resultFrame3).to.equal(frame3);
            expect(resultFrame4).to.equal(frame4);
            expect(resultFrame1.identifier).to.equal('frame1');
            expect(resultFrame2.identifier).to.equal('frame2');
            expect(resultFrame3.identifier).to.equal('frame3');
            expect(resultFrame4.identifier).to.equal('frame4');
            expect(resultFrame5.identifier).to.equal('newFrame1');
            expect(resultFrame6.identifier).to.equal('newFrame2');
            expect(resultFrame7.identifier).to.equal('newFrame3');
            expect(resultFrame8.identifier).to.equal('newFrame4');
        });
    });
*/
});
