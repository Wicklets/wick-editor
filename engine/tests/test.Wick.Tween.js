describe('Wick.Tween', function() {
    describe('#constructor', function () {
        it('should instantiate', function () {
            var tween = new Wick.Tween();
            expect(tween.classname).to.equal('Tween');
        });
    });

    describe('#serialize', function () {
        it('should serialize correctly', function() {
            var tween = new Wick.Tween(1, new Wick.Transformation(25,75, 1.5,2.5, 180, 0.5), 3);
            tween.easingType = 'in-out';
            var data = tween.serialize();
            expect(data.classname).to.equal('Tween');
            expect(data.transform.classname).to.equal('Transformation');
            expect(tween.fullRotations).to.equal(data.fullRotations);
            expect(tween.easingType).to.equal(data.easingType);
        });
    });

    describe('#_deserialize', function () {
        it('should _deserialize correctly', function() {
            var data = {
                uuid: 'dummyuuid',
                classname:'Tween',
                transform: new Wick.Transformation().serialize(),
                fullRotations: 5,
                playheadPosition: 3,
                easingType: 'in-out',
            };
            var tween = Wick.Tween.deserialize(data);
            expect(tween instanceof Wick.Tween).to.equal(true);
            expect(tween.transform instanceof Wick.Transformation).to.equal(true);
            expect(tween.fullRotations).to.equal(data.fullRotations);
            expect(tween.playheadPosition).to.equal(data.playheadPosition);
            expect(tween.easingType).to.equal(data.easingType);
        });
    });

    describe('#interpolate', function () {
        it('should tween position correctly', function() {
            var tweenA = new Wick.Tween(1, new Wick.Transformation(0,   0,   1, 1, 0, 1), 0);
            var tweenB = new Wick.Tween(3, new Wick.Transformation(100, 200, 1, 1, 0, 1), 0);
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 1);
            expect(tweenC.transform.x).to.equal(0);
            expect(tweenC.transform.y).to.equal(0);
            expect(tweenC.transform.scaleX).to.equal(1);
            expect(tweenC.transform.scaleY).to.equal(1);
            expect(tweenC.transform.rotation).to.equal(0);
            expect(tweenC.transform.opacity).to.equal(1);
            expect(tweenC.fullRotations).to.equal(0);

            var tweenD = Wick.Tween.interpolate(tweenA, tweenB, 2);
            expect(tweenD.transform.x).to.equal(50);
            expect(tweenD.transform.y).to.equal(100);
            expect(tweenD.transform.scaleX).to.equal(1);
            expect(tweenD.transform.scaleY).to.equal(1);
            expect(tweenD.transform.rotation).to.equal(0);
            expect(tweenD.transform.opacity).to.equal(1);
            expect(tweenD.fullRotations).to.equal(0);
        });

        it('should tween scale correctly', function() {
            var tweenA = new Wick.Tween(1, new Wick.Transformation(0, 0, 1, 1, 0, 1), 0);
            var tweenB = new Wick.Tween(3, new Wick.Transformation(0, 0, 2, 3, 0, 1), 0);
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);
            expect(tweenC.transform.x).to.equal(0);
            expect(tweenC.transform.y).to.equal(0);
            expect(tweenC.transform.scaleX).to.equal(1.5);
            expect(tweenC.transform.scaleY).to.equal(2.0);
            expect(tweenC.transform.rotation).to.equal(0);
            expect(tweenC.transform.opacity).to.equal(1);
        });

        it('should tween rotation correctly', function() {
            var tweenA = new Wick.Tween(1, new Wick.Transformation(0, 0, 1, 1, 0,   1), 0);
            var tweenB = new Wick.Tween(3, new Wick.Transformation(0, 0, 1, 1, 180, 1), 0);
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);
            expect(tweenC.transform.x).to.equal(0);
            expect(tweenC.transform.y).to.equal(0);
            expect(tweenC.transform.scaleX).to.equal(1);
            expect(tweenC.transform.scaleY).to.equal(1);
            expect(tweenC.transform.rotation).to.equal(90);
            expect(tweenC.transform.opacity).to.equal(1);
        });

        it('should tween rotation correctly (using no. of rotations param)', function() {
            var tweenA = new Wick.Tween(1, new Wick.Transformation(0, 0, 1, 1, 0,   1), 1);
            var tweenB = new Wick.Tween(3, new Wick.Transformation(0, 0, 1, 1, 180, 1), 0);
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);
            expect(tweenC.transform.x).to.equal(0);
            expect(tweenC.transform.y).to.equal(0);
            expect(tweenC.transform.scaleX).to.equal(1);
            expect(tweenC.transform.scaleY).to.equal(1);
            expect(tweenC.transform.rotation).to.equal(270);
            expect(tweenC.transform.opacity).to.equal(1);
        });

        it('should tween opacity correctly', function() {
            var tweenA = new Wick.Tween(1, new Wick.Transformation(0, 0, 1, 1, 0, 0), 0);
            var tweenB = new Wick.Tween(3, new Wick.Transformation(0, 0, 1, 1, 0, 1), 0);
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);
            expect(tweenC.transform.x).to.equal(0);
            expect(tweenC.transform.y).to.equal(0);
            expect(tweenC.transform.scaleX).to.equal(1);
            expect(tweenC.transform.scaleY).to.equal(1);
            expect(tweenC.transform.rotation).to.equal(0);
            expect(tweenC.transform.opacity).to.equal(0.5);
        });
    });

    describe('#interpolate (easingType = "in")', function () {
        it('should tween position correctly', function() {
            var tweenA = new Wick.Tween(1, new Wick.Transformation(0,   0,   1, 1, 0, 1), 0);
            tweenA.easingType = 'in';
            var tweenB = new Wick.Tween(3, new Wick.Transformation(100, 200, 1, 1, 0, 1), 0);
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);

            expect(tweenC.transform.x).to.equal(TWEEN.Easing.Quadratic.In(0.5) * 100);
            expect(tweenC.transform.y).to.equal(TWEEN.Easing.Quadratic.In(0.5) * 200);
            expect(tweenC.transform.scaleX).to.equal(1);
            expect(tweenC.transform.scaleY).to.equal(1);
            expect(tweenC.transform.rotation).to.equal(0);
            expect(tweenC.transform.opacity).to.equal(1);
            expect(tweenC.fullRotations).to.equal(0);
        });
    });

    describe('#interpolate (easingType = "out")', function () {
        it('should tween position correctly', function() {
            var tweenA = new Wick.Tween(1, new Wick.Transformation(0,   0,   1, 1, 0, 1), 0);
            tweenA.easingType = 'out';
            var tweenB = new Wick.Tween(3, new Wick.Transformation(100, 200, 1, 1, 0, 1), 0);
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);

            expect(tweenC.transform.x).to.equal(TWEEN.Easing.Quadratic.Out(0.5) * 100);
            expect(tweenC.transform.y).to.equal(TWEEN.Easing.Quadratic.Out(0.5) * 200);
            expect(tweenC.transform.scaleX).to.equal(1);
            expect(tweenC.transform.scaleY).to.equal(1);
            expect(tweenC.transform.rotation).to.equal(0);
            expect(tweenC.transform.opacity).to.equal(1);
            expect(tweenC.fullRotations).to.equal(0);
        });
    });

    describe('#interpolate (easingType = "in-out")', function () {
        it('should tween position correctly', function() {
            var tweenA = new Wick.Tween(1, new Wick.Transformation(0,   0,   1, 1, 0, 1), 0);
            tweenA.easingType = 'in-out';
            var tweenB = new Wick.Tween(3, new Wick.Transformation(100, 200, 1, 1, 0, 1), 0);
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);

            expect(tweenC.transform.x).to.equal(TWEEN.Easing.Quadratic.InOut(0.5) * 100);
            expect(tweenC.transform.y).to.equal(TWEEN.Easing.Quadratic.InOut(0.5) * 200);
            expect(tweenC.transform.scaleX).to.equal(1);
            expect(tweenC.transform.scaleY).to.equal(1);
            expect(tweenC.transform.rotation).to.equal(0);
            expect(tweenC.transform.opacity).to.equal(1);
            expect(tweenC.fullRotations).to.equal(0);
        });
    });

    describe('#applyTransformsToClip', function () {
        it('applyTransformsToClip should work correctly', function () {
            var tween = new Wick.Tween(1, new Wick.Transformation(100, 150, 2, 0.5, 180, 0.25), 0);
            var clip = new Wick.Clip();
            tween.applyTransformsToClip(clip);
            expect(clip.transform === tween.transform).to.equal(false);
            expect(clip.transform.x).to.equal(tween.transform.x);
            expect(clip.transform.y).to.equal(tween.transform.y);
            expect(clip.transform.scaleX).to.equal(tween.transform.scaleX);
            expect(clip.transform.scaleY).to.equal(tween.transform.scaleY);
            expect(clip.transform.rotation).to.equal(tween.transform.rotation);
            expect(clip.transform.opacity).to.equal(tween.transform.opacity);
        });
    });
});
