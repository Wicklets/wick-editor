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
        it('should remove frames', function() {
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
            expect(layer.frames.length).to.equal(2);
            layer.removeFrame(frame3);
            expect(layer.frames.length).to.equal(1);
            layer.removeFrame(frame1);
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
    });

    describe('#findGaps', function () {
        it('should find simple gap between two frames', function () {
            var project = new Wick.Project();
            project.autoFillFrameGaps = false;
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
        it('should fill a simple gap between two frames', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();

            var layer = project.activeLayer;
            var frameLeft = new Wick.Frame({start: 1, end: 1});
            var frameRight = new Wick.Frame({start: 3, end: 3});
            layer.addFrame(frameLeft);
            layer.addFrame(frameRight);

            expect(layer.frames.length).to.equal(2);
            expect(layer.frames[0].start).to.equal(1);
            expect(layer.frames[0].end).to.equal(2);
            expect(layer.frames[1].start).to.equal(3);
            expect(layer.frames[1].end).to.equal(3)
        });
    });
});
