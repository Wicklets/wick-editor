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

    describe('#serialize', function () {
        it('should serialize correctly', function() {
            var layer = new Wick.Layer();
            layer.addFrame(new Wick.Frame());

            var data = layer.serialize();

            expect(data.classname).to.equal('Layer');
            expect(data.name).to.equal(layer.name);
            expect(data.locked).to.equal(layer.locked);
            expect(data.hidden).to.equal(layer.hidden);
            expect(data.frames.length).to.equal(1);
            expect(data.frames[0].classname).to.equal('Frame');
        });
    });

    describe('#_deserialize', function () {
        it('should deserialize correctly', function() {
            var data = {
                classname: 'Layer',
                name: 'Test Layer',
                locked: true,
                hidden: true,
                frames: [new Wick.Frame().serialize()],
            };

            var layer = Wick.Layer.deserialize(data);

            expect(layer instanceof Wick.Layer).to.equal(true);
            expect(layer.name).to.equal(data.name);
            expect(layer.locked).to.equal(data.locked);
            expect(layer.hidden).to.equal(data.hidden);
            expect(layer.frames.length).to.equal(1);
            expect(layer.frames[0] instanceof Wick.Frame).to.equal(true);
        });
    });

    describe('#addFrame', function () {
        it('should add frames', function() {
            var layer = new Wick.Layer();

            var frame1 = new Wick.Frame(1,5);
            var frame2 = new Wick.Frame(6,10);
            var frame3 = new Wick.Frame(11,15);

            layer.addFrame(frame1);
            expect(layer.frames.length).to.equal(1);
            layer.removeFrame(frame1);
            expect(layer.frames.length).to.equal(0);

            layer.addFrame(frame1);
            layer.addFrame(frame2);
            layer.addFrame(frame3);
            expect(layer.frames.length).to.equal(3);
        });
    });

    describe('#removeFrame', function () {
        it('should remove frames', function() {
            var layer = new Wick.Layer();

            var frame1 = new Wick.Frame(1,5);
            var frame2 = new Wick.Frame(6,10);
            var frame3 = new Wick.Frame(11,15);

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
            var frame1 = new Wick.Frame(1,5);
            var frame2 = new Wick.Frame(6,10);
            var frame3 = new Wick.Frame(11,15);
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
});
