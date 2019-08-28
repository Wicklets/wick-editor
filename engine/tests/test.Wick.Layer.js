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

    });

    describe('#findGaps', function () {

    });

    describe('#resolveGaps', function () {

    });
});
