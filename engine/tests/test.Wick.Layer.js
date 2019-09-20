describe('Wick.Layer', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var layer = new Wick.Layer();

            expect(layer.classname).to.equal('Layer');
            expect(layer.frames.length).to.equal(0);
            expect(layer.locked).to.equal(false);
            expect(layer.hidden).to.equal(false);
        });
    });

    describe('#addFrame', function () {
        it('should add frames', function() {
            var layer = new Wick.Layer();

            var frame1 = new Wick.Frame({start: 1, end: 5});
            var frame2 = new Wick.Frame({start: 6, end: 10});
            var frame3 = new Wick.Frame({start: 11, end: 15});
            var frame4 = new Wick.Frame({start: 11, end: 15});

            layer.addFrame(frame1);
            expect(layer.frames.length).to.equal(1);
            layer.removeFrame(frame1);
            expect(layer.frames.length).to.equal(0);

            layer.addFrame(frame1);
            layer.addFrame(frame2);
            layer.addFrame(frame3);
            layer.addFrame(frame4);
            expect(layer.frames.length).to.equal(3);
        });
    });

    describe('#removeFrame', function () {
        it('should remove frames and fill gaps', function() {
            var layer = new Wick.Layer();

            var frame1 = new Wick.Frame({start:1,end:5});
            var frame2 = new Wick.Frame({start:6,end:10});
            var frame3 = new Wick.Frame({start:11,end:15});

            layer.addFrame(frame1);
            expect(layer.frames.length).to.equal(1);
            layer.removeFrame(frame1);
            expect(layer.frames.length).to.equal(0);

            layer.addFrame(frame1);
            layer.addFrame(frame2);
            layer.addFrame(frame3);
            expect(layer.frames.length).to.equal(3);

            layer.removeFrame(frame2);
            expect(layer.frames.length).to.equal(3);
            expect(layer.getFrameAtPlayheadPosition(6)).to.not.equal(frame2);

            layer.removeFrame(frame3);
            expect(layer.frames.length).to.equal(2);
        });
    });

    describe('#activeFrame', function () {
        it('should calculate active frame properly', function() {
            var layer = new Wick.Layer();
            var frame1 = new Wick.Frame({start:1,end:5});
            var frame2 = new Wick.Frame({start:6,end:10});
            var frame3 = new Wick.Frame({start:11,end:15});
            layer.addFrame(frame1);
            layer.addFrame(frame2);
            layer.addFrame(frame3);

            var timeline = new Wick.Timeline();
            timeline.addLayer(layer);
            layer.addFrame(frame1);
            layer.addFrame(frame2);
            layer.addFrame(frame3);
            timeline.playheadPosition = 1;
            expect(layer.activeFrame).to.equal(frame1);
            timeline.playheadPosition = 10;
            expect(layer.activeFrame).to.equal(frame2);
            timeline.playheadPosition = 11;
            expect(layer.activeFrame).to.equal(frame3);
        });
    });

    describe('#resolveOverlap', function () {
        it('should remove one frame on top of another', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();

            var layer = project.activeLayer;
            var frameOver = new Wick.Frame({start: 1, end: 1});
            var frameUnder = new Wick.Frame({start: 1, end: 1});

            layer.addFrame(frameUnder);
            layer.addFrame(frameOver);

            expect(layer.frames.length).to.equal(1);
            expect(layer.frames[0]).to.equal(frameOver);
        });

        it('overlaps should be resolved when frame length is changed through selection', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();

            var layer = project.activeLayer;
            var frame1 = new Wick.Frame({start: 1});
            var frame2 = new Wick.Frame({start: 2, end: 5});
            layer.addFrame(frame1);
            layer.addFrame(frame2);

            project.selection.select(frame1);
            project.selection.frameLength = 4;

            expect(project.activeLayer.frames.length).to.equal(2);
            expect(frame1.start).to.equal(1);
            expect(frame1.end).to.equal(4);
            expect(frame2.start).to.equal(5);
            expect(frame2.end).to.equal(5);
        });
    });

    describe('#findGaps', function () {
        it('should find simple gap between two frames', function () {
            var project = new Wick.Project();
            project.activeTimeline.deferFrameGapResolve();
            project.activeFrame.remove();

            var layer = project.activeLayer;
            var frameLeft = new Wick.Frame({start: 1, end: 1});
            var frameRight = new Wick.Frame({start: 3, end: 3});
            layer.addFrame(frameLeft);
            layer.addFrame(frameRight);

            var gaps = layer.findGaps();
            expect(gaps.length).to.equal(1);
            expect(gaps[0].start).to.equal(2);
            expect(gaps[0].end).to.equal(2);
        });
    });

    describe('#resolveGaps', function () {
        it('should fill a simple gap between two frames (blank_frames method)', function () {
            var project = new Wick.Project();
            project.activeTimeline.fillGapsMethod = 'blank_frames';
            project.activeFrame.remove();

            var layer = project.activeLayer;
            var frameLeft = new Wick.Frame({start: 1, end: 1});
            var frameRight = new Wick.Frame({start: 3, end: 3});
            layer.addFrame(frameLeft);
            layer.addFrame(frameRight);

            expect(layer.frames.length).to.equal(3);
            expect(layer.getFrameAtPlayheadPosition(1)).to.equal(frameLeft);
            expect(layer.getFrameAtPlayheadPosition(2)).to.not.equal(frameLeft);
            expect(layer.getFrameAtPlayheadPosition(2)).to.not.equal(frameRight);
            expect(layer.getFrameAtPlayheadPosition(3)).to.equal(frameRight);
        });

        it('if multiple frames are deleted, gaps should still be filled correctly (blank_frames method)', function () {
            var project = new Wick.Project();
            project.activeTimeline.fillGapsMethod = 'blank_frames';
            project.activeFrame.remove();

            var layer = project.activeLayer;
            var frame1 = new Wick.Frame({start: 1});
            var frame2 = new Wick.Frame({start: 2});
            var frame3 = new Wick.Frame({start: 3});
            var frame4 = new Wick.Frame({start: 4});
            var frame5 = new Wick.Frame({start: 5});
            layer.addFrame(frame1);
            layer.addFrame(frame2);
            layer.addFrame(frame3);
            layer.addFrame(frame4);
            layer.addFrame(frame5);

            project.selection.select(frame2);
            project.selection.select(frame3);
            project.selection.select(frame4);

            project.deleteSelectedObjects();

            expect(layer.frames.length).to.equal(3); // Should have filled the empty space with a new frame.
            expect(layer.getFrameAtPlayheadPosition(1)).to.equal(frame1);
            expect(layer.getFrameAtPlayheadPosition(5)).to.equal(frame5);

            // Make sure the gap was filled correctly
            expect(layer.getFrameAtPlayheadPosition(2)).to.not.equal(undefined);
            expect(layer.getFrameAtPlayheadPosition(3)).to.not.equal(undefined);
            expect(layer.getFrameAtPlayheadPosition(4)).to.not.equal(undefined);

            expect(layer.getFrameAtPlayheadPosition(2)).to.not.equal(frame2);
            expect(layer.getFrameAtPlayheadPosition(3)).to.not.equal(frame2);
            expect(layer.getFrameAtPlayheadPosition(4)).to.not.equal(frame2);
            expect(layer.getFrameAtPlayheadPosition(2)).to.not.equal(frame3);
            expect(layer.getFrameAtPlayheadPosition(3)).to.not.equal(frame3);
            expect(layer.getFrameAtPlayheadPosition(4)).to.not.equal(frame3);
            expect(layer.getFrameAtPlayheadPosition(2)).to.not.equal(frame4);
            expect(layer.getFrameAtPlayheadPosition(3)).to.not.equal(frame4);
            expect(layer.getFrameAtPlayheadPosition(4)).to.not.equal(frame4);

            // The gap should have been filled by a single frame
            expect(layer.getFrameAtPlayheadPosition(2)).to.equal(layer.getFrameAtPlayheadPosition(3));
            expect(layer.getFrameAtPlayheadPosition(3)).to.equal(layer.getFrameAtPlayheadPosition(4));
        });

        it('gaps should be filled when frame length is changed through selection (blank_frames method)', function () {
            var project = new Wick.Project();
            project.activeTimeline.fillGapsMethod = 'blank_frames';

            project.activeFrame.remove();

            var layer = project.activeLayer;
            var frame1 = new Wick.Frame({start: 1, end: 4});
            var frame2 = new Wick.Frame({start: 5});
            layer.addFrame(frame1);
            layer.addFrame(frame2);

            project.selection.select(frame1);
            project.selection.frameLength = 1;

            expect(project.activeLayer.frames.length).to.equal(3);
            expect(project.activeLayer.getFrameAtPlayheadPosition(1)).to.equal(frame1);
            expect(project.activeLayer.getFrameAtPlayheadPosition(5)).to.equal(frame2);

            // Check that the gap was filled correctly
            expect(project.activeLayer.getFrameAtPlayheadPosition(2)).to.not.equal(undefined);
            expect(project.activeLayer.getFrameAtPlayheadPosition(3)).to.not.equal(undefined);
            expect(project.activeLayer.getFrameAtPlayheadPosition(4)).to.not.equal(undefined);
            expect(project.activeLayer.getFrameAtPlayheadPosition(2)).to.not.equal(frame1);
            expect(project.activeLayer.getFrameAtPlayheadPosition(3)).to.not.equal(frame1);
            expect(project.activeLayer.getFrameAtPlayheadPosition(4)).to.not.equal(frame1);
            expect(project.activeLayer.getFrameAtPlayheadPosition(2)).to.not.equal(frame2);
            expect(project.activeLayer.getFrameAtPlayheadPosition(3)).to.not.equal(frame2);
            expect(project.activeLayer.getFrameAtPlayheadPosition(4)).to.not.equal(frame2);
        });

        it('gaps should be filled when frame length is changed through selection (extend frames method)', function () {
            throw new Error('todo')
        });
    });
});
