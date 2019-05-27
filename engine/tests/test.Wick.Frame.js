describe('Wick.Frame', function() {
    describe('#constructor', function () {
        it('should instatiate correctly', function() {
            var frame = new Wick.Frame();
            expect(frame.start).to.equal(1);
            expect(frame.end).to.equal(1);
            expect(frame instanceof Wick.Base).to.equal(true);
            expect(frame instanceof Wick.Tickable).to.equal(true);
            expect(frame instanceof Wick.Frame).to.equal(true);
            expect(frame.classname).to.equal('Frame');
            expect(frame.scripts instanceof Array).to.equal(true);
            expect(frame.scripts.length).to.equal(1);
            expect(frame.clips instanceof Array).to.equal(true);
            expect(frame.clips.length).to.equal(0);
            expect(frame.tweens instanceof Array).to.equal(true);
            expect(frame.tweens.length).to.equal(0);

            expect(frame.start).to.equal(1);
            expect(frame.end).to.equal(1);
            expect(frame.length).to.equal(1);
            expect(frame.midpoint).to.equal(1);

            frame = new Wick.Frame({start:5});
            expect(frame.start).to.equal(5);
            expect(frame.end).to.equal(5);
            expect(frame.length).to.equal(1);
            expect(frame.midpoint).to.equal(5);

            frame = new Wick.Frame({start:5, end:10});
            expect(frame.start).to.equal(5);
            expect(frame.end).to.equal(10);
            expect(frame.length).to.equal(6);
            expect(frame.midpoint).to.equal(7.5);
        });
    });

    describe('#copy', function () {
        it('should copy correctly (empty frame)', function() {
            var frame = new Wick.Frame();

            var copy = frame.copy();

            expect(frame.start).to.equal(1);
            expect(frame.end).to.equal(1);
            expect(frame instanceof Wick.Base).to.equal(true);
            expect(frame instanceof Wick.Tickable).to.equal(true);
            expect(frame instanceof Wick.Frame).to.equal(true);
            expect(frame.classname).to.equal('Frame');
            expect(frame.scripts instanceof Array).to.equal(true);
            expect(frame.scripts.length).to.equal(1);
            expect(frame.clips instanceof Array).to.equal(true);
            expect(frame.clips.length).to.equal(0);
            expect(frame.tweens instanceof Array).to.equal(true);
            expect(frame.tweens.length).to.equal(0);

            expect(frame.start).to.equal(1);
            expect(frame.end).to.equal(1);
            expect(frame.length).to.equal(1);
            expect(frame.midpoint).to.equal(1);

            expect(copy.start).to.equal(1);
            expect(copy.end).to.equal(1);
            expect(copy instanceof Wick.Base).to.equal(true);
            expect(copy instanceof Wick.Tickable).to.equal(true);
            expect(copy instanceof Wick.Frame).to.equal(true);
            expect(copy.classname).to.equal('Frame');
            expect(copy.scripts instanceof Array).to.equal(true);
            expect(copy.scripts.length).to.equal(1);
            expect(copy.clips instanceof Array).to.equal(true);
            expect(copy.clips.length).to.equal(0);
            expect(copy.tweens instanceof Array).to.equal(true);
            expect(copy.tweens.length).to.equal(0);

            expect(copy.start).to.equal(1);
            expect(copy.end).to.equal(1);
            expect(copy.length).to.equal(1);
            expect(copy.midpoint).to.equal(1);
        });
    });

    describe('#inPosition', function () {
        it('inPosition should be calculated correctly', function() {
            var frame = new Wick.Frame();
            expect(frame.inPosition(1)).to.equal(true);
            expect(frame.inPosition(2)).to.equal(false);

            frame = new Wick.Frame({start:5, end:10});
            expect(frame.inPosition(1)).to.equal(false);
            expect(frame.inPosition(4)).to.equal(false);
            expect(frame.inPosition(5)).to.equal(true);
            expect(frame.inPosition(7)).to.equal(true);
            expect(frame.inPosition(10)).to.equal(true);
            expect(frame.inPosition(11)).to.equal(false);
        });
    });

    describe('#inRange', function () {
        it('inRange should be calculated correctly', function() {
            var frame = new Wick.Frame();
            expect(frame.inRange(1,1)).to.equal(true);
            expect(frame.inRange(1,2)).to.equal(true);
            expect(frame.inRange(2,2)).to.equal(false);
            expect(frame.inRange(2,3)).to.equal(false);
            expect(frame.inRange(3,10)).to.equal(false);

            frame = new Wick.Frame({start:5, end:10});
            expect(frame.inRange(1,1)).to.equal(false);
            expect(frame.inRange(1,4)).to.equal(false);
            expect(frame.inRange(1,5)).to.equal(true);
            expect(frame.inRange(5,5)).to.equal(true);
            expect(frame.inRange(5,10)).to.equal(true);
            expect(frame.inRange(4,6)).to.equal(true);
            expect(frame.inRange(9,11)).to.equal(true);
            expect(frame.inRange(10,11)).to.equal(true);
            expect(frame.inRange(11,15)).to.equal(false);
        });
    });

    describe('#contentful', function () {
        it('should determine contentful correctly', function() {
            var frameEmpty = new Wick.Frame();

            var frameOnePath = new Wick.Frame();
            frameOnePath.addPath(new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE}));

            var frameOneClip = new Wick.Frame();
            frameOneClip.addClip(new Wick.Clip());

            var frameOneClipOnePath = new Wick.Frame();
            frameOneClipOnePath.addPath(new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE}));
            frameOneClipOnePath.addClip(new Wick.Clip());

            expect(frameEmpty.contentful).to.equal(false);
            expect(frameOnePath.contentful).to.equal(true);
            expect(frameOneClip.contentful).to.equal(true);
            expect(frameOneClipOnePath.contentful).to.equal(true);
        });
    });

    describe('#getActiveTween', function () {
        it('should calculate active tween', function () {
            var project = new Wick.Project();
            var frame = project.activeFrame;
            frame.end = 9;

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
                playheadPosition: 5,
                transformation: new Wick.Transformation({
                    x: 100,
                    y: 200,
                    scaleX: 2,
                    scaleY: 0.5,
                    rotation: 180,
                    opacity: 0,
                }),
                fullRotations: 0,
            });
            var tweenC = new Wick.Tween({
                playheadPosition: 9,
                transformation: new Wick.Transformation({
                    x: 100,
                    y: 200,
                    scaleX: 2,
                    scaleY: 0.5,
                    rotation: 180,
                    opacity: 1.0,
                }),
                fullRotations: 0,
            });
            frame.addTween(tweenA);
            frame.addTween(tweenB);
            frame.addTween(tweenC);

            // Existing tweens
            project.root.timeline.playheadPosition = 1;
            expect(frame.getActiveTween()).to.equal(tweenA);

            project.root.timeline.playheadPosition = 5;
            expect(frame.getActiveTween()).to.equal(tweenB);

            project.root.timeline.playheadPosition = 9;
            expect(frame.getActiveTween()).to.equal(tweenC);

            // Interpolated tweens
            project.root.timeline.playheadPosition = 3;
            var tweenAB = frame.getActiveTween();
            expect(tweenAB.playheadPosition).to.equal(3);
            expect(tweenAB.transformation.x).to.be.closeTo(50, 0.01);
            expect(tweenAB.transformation.y).to.be.closeTo(100, 0.01);
            expect(tweenAB.transformation.scaleX).to.be.closeTo(1.5, 0.01);
            expect(tweenAB.transformation.scaleY).to.be.closeTo(0.75, 0.01);
            expect(tweenAB.transformation.rotation).to.be.closeTo(90, 0.01);
            expect(tweenAB.transformation.opacity).to.be.closeTo(0.5, 0.01);

            project.root.timeline.playheadPosition = 7;
            var tweenBC = frame.getActiveTween();
            expect(tweenBC.playheadPosition).to.equal(7);
            expect(tweenBC.transformation.x).to.be.closeTo(100, 0.01);
            expect(tweenBC.transformation.y).to.be.closeTo(200, 0.01);
            expect(tweenBC.transformation.scaleX).to.be.closeTo(2, 0.01);
            expect(tweenBC.transformation.scaleY).to.be.closeTo(0.5, 0.01);
            expect(tweenBC.transformation.rotation).to.be.closeTo(180, 0.01);
            expect(tweenBC.transformation.opacity).to.be.closeTo(0.5, 0.01);
        });
    });

    describe('#applyTweenTransforms', function () {
        it('applyTweenTransforms should work correctly', function () {
            var project = new Wick.Project();

            var frame = project.activeFrame;
            var clip = new Wick.Clip();
            frame.addClip(clip);
            frame.addTween(new Wick.Tween({
                playheadPosition: 1,
                transformation: new Wick.Transformation({
                    x: 100,
                    y: 200,
                    scaleX: 2,
                    scaleY: 0.5,
                    rotation: 180,
                    opacity: 0.25,
                }),
                fullRotations: 0,
            }));

            frame.applyTweenTransforms();

            expect(clip.transformation.x).to.be.closeTo(100, 0.01);
            expect(clip.transformation.y).to.be.closeTo(200, 0.01);
            expect(clip.transformation.scaleX).to.be.closeTo(2, 0.01);
            expect(clip.transformation.scaleY).to.be.closeTo(0.5, 0.01);
            expect(clip.transformation.rotation).to.be.closeTo(180, 0.01);
            expect(clip.transformation.opacity).to.be.closeTo(0.25, 0.01);
        });
    });

    describe('#tick', function () {
        it('script errors from child clips should bubble up', function() {
            var frame = new Wick.Frame();

            var child = new Wick.Clip();
            child.addScript('load', 'thisWillCauseAnError()');
            frame.addClip(child);

            var error = frame.tick();
            expect(error).to.not.equal(null);
            expect(error.message).to.equal('thisWillCauseAnError is not defined');
            expect(error.lineNumber).to.equal(1);
            expect(error.uuid).to.equal(child.uuid);
        });

        it('script errors from child frames should bubble up', function() {
            var frame = new Wick.Frame();

            var child = new Wick.Frame();
            child.addScript('load', 'thisWillCauseAnError()');
            frame.addClip(new Wick.Clip());
            frame.clips[0].timeline.addLayer(new Wick.Layer());
            frame.clips[0].timeline.layers[0].addFrame(child);

            var error = frame.tick();
            expect(error).to.not.equal(null);
            expect(error.message).to.equal('thisWillCauseAnError is not defined');
            expect(error.lineNumber).to.equal(1);
            expect(error.uuid).to.equal(child.uuid);
        });

        it('frames should have access to global API', function() {
            var project = new Wick.Project();

            var frame = project.activeFrame;

            frame.addScript('load', 'stop(); play();');
            var error = frame.tick();
            expect(error).to.equal(null);
        });

        describe('#project', function () {
            it('project should work as expected', function() {
                var project = new Wick.Project();

                var frame = project.activeFrame;

                frame.addScript('load', 'this.__project = project');
                var error = frame.tick();
                expect(error).to.equal(null);
                expect(frame.__project).to.equal(project.root);
                expect(frame.__project.width).to.equal(project.width);
                expect(frame.__project.height).to.equal(project.height);
            });
        });

        describe('#parent', function () {
            it('project should work as expected', function() {
                var project = new Wick.Project();

                var frame = project.activeFrame;

                frame.addScript('load', 'this.__parent = parent');
                var error = frame.tick();
                expect(error).to.equal(null);
                expect(frame.__parent).to.equal(frame.parentClip);
            });
        });

        it('frames should have access to other named objects', function() {
            var project = new Wick.Project();

            var clipA = new Wick.Clip();
            clipA.identifier = 'foo';
            project.activeFrame.addClip(clipA);

            var clipB = new Wick.Clip();
            clipB.identifier = 'bar';
            project.activeFrame.addClip(clipB);

            var clipC = new Wick.Clip();
            project.activeFrame.addClip(clipC);

            var frame = project.activeFrame;

            frame.addScript('load', 'this.__foo = foo; this.__bar = bar;');
            var error = frame.tick();
            expect(error).to.equal(null);
            expect(frame.__foo).to.equal(clipA);
            expect(frame.__bar).to.equal(clipB);
        });

        it('frames should not have access to other named objects on other frames', function() {
            var project = new Wick.Project();
            var frame = new Wick.Frame({start: 2});
            project.root.timeline.activeLayer.addFrame(frame);
            project.root.timeline.playheadPosition = 2;

            var clipA = new Wick.Clip();
            clipA.identifier = 'foo';
            project.activeLayer.frames[0].addClip(clipA);

            var clipB = new Wick.Clip();
            clipB.identifier = 'bar';
            project.activeLayer.frames[0].addClip(clipB);

            frame.addScript('load', 'console.log(bar); this.__bar = bar;');
            var error = project.tick();
            expect(error).not.to.equal(null);
            expect(error.message).to.equal("bar is not defined");
        });

        it('should play/stop sounds', function() {
            var project = new Wick.Project();

            var frame1 = project.activeFrame;
            frame1.end = 5;
            var frame2 = new Wick.Frame({start:6,end:10});
            project.activeLayer.addFrame(frame2);
            var frame3 = new Wick.Frame({start:11,end:15});
            project.activeLayer.addFrame(frame3);

            var sound1 = new Wick.SoundAsset({filename:'test.wav', src:TestUtils.TEST_SOUND_SRC_WAV});
            var sound2 = new Wick.SoundAsset({filename:'test.mp3', src:TestUtils.TEST_SOUND_SRC_WAV});
            project.addAsset(sound1);
            project.addAsset(sound2);

            frame1.sound = sound1;
            frame2.sound = sound2;

            expect(frame1.isSoundPlaying()).to.equal(false);
            expect(frame2.isSoundPlaying()).to.equal(false);

            project.root.tick(); // playhead = 1

            expect(frame1.isSoundPlaying()).to.equal(true);
            expect(frame2.isSoundPlaying()).to.equal(false);

            project.root.tick(); // playhead = 2
            project.root.tick(); // playhead = 3
            project.root.tick(); // playhead = 4
            project.root.tick(); // playhead = 5
            project.root.tick(); // playhead = 6

            expect(frame1.isSoundPlaying()).to.equal(false);
            expect(frame2.isSoundPlaying()).to.equal(true);

            project.root.tick(); // playhead = 7
            project.root.tick(); // playhead = 8
            project.root.tick(); // playhead = 9
            project.root.tick(); // playhead = 10
            project.root.tick(); // playhead = 11

            expect(frame1.isSoundPlaying()).to.equal(false);
            expect(frame2.isSoundPlaying()).to.equal(false);
        });
    });

    describe('#createTween', function () {
        it('should create a blank tween if the frame is empty', function () {
            var project = new Wick.Project();

            project.activeFrame.createTween();

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(0);

            expect(project.activeFrame.tweens.length).to.equal(1);

            expect(project.activeFrame.tweens[0].playheadPosition).to.equal(1);
            expect(project.activeFrame.tweens[0].transformation.x).to.equal(0);
            expect(project.activeFrame.tweens[0].transformation.y).to.equal(0);
            expect(project.activeFrame.tweens[0].transformation.scaleX).to.equal(1);
            expect(project.activeFrame.tweens[0].transformation.scaleY).to.equal(1);
            expect(project.activeFrame.tweens[0].transformation.rotation).to.equal(0);
            expect(project.activeFrame.tweens[0].transformation.opacity).to.equal(1);
        });

        it('should create a tween and convert everything on the frame into one clip', function () {
            var project = new Wick.Project();

            var path1 = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: new paper.Point(50,50),
                to: new paper.Point(100,100),
                fillColor: 'red',
            }));
            var path2 = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: new paper.Point(100,50),
                to: new paper.Point(150,100),
                fillColor: 'green',
            }));
            var path3 = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: new paper.Point(100,100),
                to: new paper.Point(150,150),
                fillColor: 'blue',
            }));

            project.activeFrame.addPath(path1);
            project.activeFrame.addPath(path2);
            project.activeFrame.addPath(path3);

            project.activeFrame.createTween();

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(1);

            expect(project.activeFrame.tweens.length).to.equal(1);

            expect(project.activeFrame.tweens[0].playheadPosition).to.equal(1);
            expect(project.activeFrame.tweens[0].transformation.x).to.equal(100);
            expect(project.activeFrame.tweens[0].transformation.y).to.equal(100);
            expect(project.activeFrame.tweens[0].transformation.scaleX).to.equal(1);
            expect(project.activeFrame.tweens[0].transformation.scaleY).to.equal(1);
            expect(project.activeFrame.tweens[0].transformation.rotation).to.equal(0);
            expect(project.activeFrame.tweens[0].transformation.opacity).to.equal(1);
        });

        it('should create a tween and convert everything on the frame into one clip (single path)', function () {
            // TODO
        });
    });

    it('should automatically create tweens when objects are moved on a tweened frame', function () {
        // TODO
    });
});
