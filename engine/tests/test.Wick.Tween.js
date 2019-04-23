describe('Wick.Tween', function() {
    describe('#constructor', function () {
        it('should instantiate', function () {
            var tween = new Wick.Tween();
            expect(tween.classname).to.equal('Tween');
        });
    });
/*
    describe('#serialize', function () {
        it('should serialize correctly', function() {
            var tween = new Wick.Tween(1, new Wick.Transformation(25,75, 1.5,2.5, 180, 0.5), 3);
            tween.easingType = 'in-out';
            var data = tween.serialize();
            expect(data.classname).to.equal('Tween');
            expect(data.transformation.classname).to.equal('Transformation');
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
*/
    describe('#interpolate', function () {
        it('should tween position correctly', function() {
            var tweenA = new Wick.Tween({
                playheadPosition: 1,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1,
                }),
                fullRotations: 0,
            });
            var tweenB = new Wick.Tween({
                playheadPosition: 3,
                transformation: new Wick.Transformation({
                    x: 100,
                    y: 200,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1,
                }),
                fullRotations: 0,
            });
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 1);
            expect(tweenC.transformation.x).to.equal(0);
            expect(tweenC.transformation.y).to.equal(0);
            expect(tweenC.transformation.scaleX).to.equal(1);
            expect(tweenC.transformation.scaleY).to.equal(1);
            expect(tweenC.transformation.rotation).to.equal(0);
            expect(tweenC.transformation.opacity).to.equal(1);
            expect(tweenC.fullRotations).to.equal(0);

            var tweenD = Wick.Tween.interpolate(tweenA, tweenB, 2);
            expect(tweenD.transformation.x).to.equal(50);
            expect(tweenD.transformation.y).to.equal(100);
            expect(tweenD.transformation.scaleX).to.equal(1);
            expect(tweenD.transformation.scaleY).to.equal(1);
            expect(tweenD.transformation.rotation).to.equal(0);
            expect(tweenD.transformation.opacity).to.equal(1);
            expect(tweenD.fullRotations).to.equal(0);
        });

        it('should tween scale correctly', function() {
            var tweenA = new Wick.Tween({
                playheadPosition: 1,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1.0,
                }),
                fullRotations: 0,
            });
            var tweenB = new Wick.Tween({
                playheadPosition: 3,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 2,
                    scaleY: 3,
                    rotation: 0,
                    opacity: 1.0,
                }),
                fullRotations: 0,
            });
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);
            expect(tweenC.transformation.x).to.equal(0);
            expect(tweenC.transformation.y).to.equal(0);
            expect(tweenC.transformation.scaleX).to.equal(1.5);
            expect(tweenC.transformation.scaleY).to.equal(2.0);
            expect(tweenC.transformation.rotation).to.equal(0);
            expect(tweenC.transformation.opacity).to.equal(1);
        });

        it('should tween rotation correctly', function() {
            var tweenA = new Wick.Tween({
                playheadPosition: 1,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1.0,
                }),
                fullRotations: 0,
            });
            var tweenB = new Wick.Tween({
                playheadPosition: 3,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 180,
                    opacity: 1.0,
                }),
                fullRotations: 0,
            });
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);
            expect(tweenC.transformation.x).to.equal(0);
            expect(tweenC.transformation.y).to.equal(0);
            expect(tweenC.transformation.scaleX).to.equal(1);
            expect(tweenC.transformation.scaleY).to.equal(1);
            expect(tweenC.transformation.rotation).to.equal(90);
            expect(tweenC.transformation.opacity).to.equal(1);
        });

        it('should tween rotation correctly (using no. of rotations param)', function() {
            var tweenA = new Wick.Tween({
                playheadPosition: 1,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1.0,
                }),
                fullRotations: 1,
            });
            var tweenB = new Wick.Tween({
                playheadPosition: 3,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 180,
                    opacity: 1.0,
                }),
                fullRotations: 0,
            });
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);
            expect(tweenC.transformation.x).to.equal(0);
            expect(tweenC.transformation.y).to.equal(0);
            expect(tweenC.transformation.scaleX).to.equal(1);
            expect(tweenC.transformation.scaleY).to.equal(1);
            expect(tweenC.transformation.rotation).to.equal(270);
            expect(tweenC.transformation.opacity).to.equal(1);
        });

        it('should tween opacity correctly', function() {
            var tweenA = new Wick.Tween({
                playheadPosition: 1,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 0.0,
                }),
                fullRotations: 0,
            });
            var tweenB = new Wick.Tween({
                playheadPosition: 3,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1.0,
                }),
                fullRotations: 0,
            });
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);
            expect(tweenC.transformation.x).to.equal(0);
            expect(tweenC.transformation.y).to.equal(0);
            expect(tweenC.transformation.scaleX).to.equal(1);
            expect(tweenC.transformation.scaleY).to.equal(1);
            expect(tweenC.transformation.rotation).to.equal(0);
            expect(tweenC.transformation.opacity).to.equal(0.5);
        });
    });

    describe('#interpolate (easingType = "in")', function () {
        it('should tween position correctly', function() {
            var tweenA = new Wick.Tween({
                playheadPosition: 1,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1.0,
                }),
                fullRotations: 0,
                easingType: 'in',
            });
            var tweenB = new Wick.Tween({
                playheadPosition: 3,
                transformation: new Wick.Transformation({
                    x: 100,
                    y: 200,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1.0,
                }),
                fullRotations: 0,
            });
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);

            expect(tweenC.transformation.x).to.equal(TWEEN.Easing.Quadratic.In(0.5) * 100);
            expect(tweenC.transformation.y).to.equal(TWEEN.Easing.Quadratic.In(0.5) * 200);
            expect(tweenC.transformation.scaleX).to.equal(1);
            expect(tweenC.transformation.scaleY).to.equal(1);
            expect(tweenC.transformation.rotation).to.equal(0);
            expect(tweenC.transformation.opacity).to.equal(1);
            expect(tweenC.fullRotations).to.equal(0);
        });
    });

    describe('#interpolate (easingType = "out")', function () {
        it('should tween position correctly', function() {
            var tweenA = new Wick.Tween({
                playheadPosition: 1,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1.0,
                }),
                fullRotations: 0,
                easingType: 'out',
            });
            var tweenB = new Wick.Tween({
                playheadPosition: 3,
                transformation: new Wick.Transformation({
                    x: 100,
                    y: 200,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1.0,
                }),
                fullRotations: 0,
            });
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);

            expect(tweenC.transformation.x).to.equal(TWEEN.Easing.Quadratic.Out(0.5) * 100);
            expect(tweenC.transformation.y).to.equal(TWEEN.Easing.Quadratic.Out(0.5) * 200);
            expect(tweenC.transformation.scaleX).to.equal(1);
            expect(tweenC.transformation.scaleY).to.equal(1);
            expect(tweenC.transformation.rotation).to.equal(0);
            expect(tweenC.transformation.opacity).to.equal(1);
            expect(tweenC.fullRotations).to.equal(0);
        });
    });

    describe('#interpolate (easingType = "in-out")', function () {
        it('should tween position correctly', function() {
            var tweenA = new Wick.Tween({
                playheadPosition: 1,
                transformation: new Wick.Transformation({
                    x: 0,
                    y: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1.0,
                }),
                fullRotations: 0,
                easingType: 'in-out',
            });
            var tweenB = new Wick.Tween({
                playheadPosition: 3,
                transformation: new Wick.Transformation({
                    x: 100,
                    y: 200,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    opacity: 1.0,
                }),
                fullRotations: 0,
            });
            var tweenC = Wick.Tween.interpolate(tweenA, tweenB, 2);

            expect(tweenC.transformation.x).to.equal(TWEEN.Easing.Quadratic.InOut(0.5) * 100);
            expect(tweenC.transformation.y).to.equal(TWEEN.Easing.Quadratic.InOut(0.5) * 200);
            expect(tweenC.transformation.scaleX).to.equal(1);
            expect(tweenC.transformation.scaleY).to.equal(1);
            expect(tweenC.transformation.rotation).to.equal(0);
            expect(tweenC.transformation.opacity).to.equal(1);
            expect(tweenC.fullRotations).to.equal(0);
        });
    });

    describe('#applyTransformsToClip', function () {
        it('applyTransformsToClip should work correctly', function () {
            var tween = new Wick.Tween({
                playheadPosition: 1,
                transformation: new Wick.Transformation({
                    x: 100,
                    y: 150,
                    scaleX: 2,
                    scaleY: 0.5,
                    rotation: 180,
                    opacity: 0,
                }),
                fullRotations: 0,
            });
            var clip = new Wick.Clip();
            tween.applyTransformsToClip(clip);
            expect(clip.transformation).to.not.equal(tween.transformation);
            expect(clip.transformation.x).to.equal(tween.transformation.x);
            expect(clip.transformation.y).to.equal(tween.transformation.y);
            expect(clip.transformation.scaleX).to.equal(tween.transformation.scaleX);
            expect(clip.transformation.scaleY).to.equal(tween.transformation.scaleY);
            expect(clip.transformation.rotation).to.equal(tween.transformation.rotation);
            expect(clip.transformation.opacity).to.equal(tween.transformation.opacity);
        });
    });
});
