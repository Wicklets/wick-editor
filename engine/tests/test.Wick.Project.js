describe('Wick.Project', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var project = new Wick.Project();
            expect(project.classname).to.equal('Project');

            expect(project.width).to.equal(720);
            expect(project.height).to.equal(405);
            expect(project.framerate).to.equal(12);
            expect(project.backgroundColor).to.equal('#ffffff');

            expect(project.zoom).to.equal(1);
            expect(project.pan.x).to.equal(0);
            expect(project.pan.y).to.equal(0);

            expect(project.focus.timeline.layers.length).to.equal(1);
            expect(project.focus.timeline.layers[0].frames.length).to.equal(1);
            expect(project.focus instanceof Wick.Clip).to.equal(true);
            expect(project.focus).to.equal(project.root);

            expect(project.project).to.equal(project);
            expect(project.focus.project).to.equal(project);
            expect(project.focus.timeline.project).to.equal(project);
            expect(project.focus.timeline.layers[0].project).to.equal(project);

            expect(project.getAssets().length).to.equal(0);
        });
    });

    describe('#serialize', function () {
        it('should serialize correctly', function() {
            Wick.ObjectCache.removeAllObjects();

            var project = new Wick.Project();

            var image = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            project.addAsset(image);
            project.addAsset(sound);

            var data = project.serialize();

            expect(data.backgroundColor).to.equal('#ffffff');
            expect(data.children).to.eql([
                project.selection.uuid,
                project.root.uuid,
                image.uuid,
                sound.uuid,
            ]);
            expect(data.classname).to.equal('Project');
            expect(data.focus).to.equal(project.focus.uuid);
            expect(data.framerate).to.equal(12);
            expect(data.height).to.equal(405);
            expect(data.identifier).to.equal(null);
            expect(data.name).to.equal('My Project');
            expect(data.onionSkinEnabled).to.equal(false);
            expect(data.onionSkinSeekBackwards).to.equal(1);
            expect(data.onionSkinSeekForwards).to.equal(1);
            expect(data.pan).to.eql({
                x: 0,
                y: 0,
            });
            expect(data.uuid).to.equal(project.uuid);
            expect(data.width).to.equal(720);
            expect(data.zoom).to.equal(1);
        });
    });

    describe('#deserialize', function () {
        it('should deserialize correctly', function() {
            Wick.ObjectCache.removeAllObjects();

            var project = new Wick.Project();

            var image = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            project.addAsset(image);
            project.addAsset(sound);

            var data = project.serialize();
            var projectFromData = Wick.Project.fromData(data);

            expect(projectFromData.backgroundColor).to.equal('#ffffff');
            expect(projectFromData.getChildren().length).to.equal(4);
            expect(projectFromData.getChildren()[0]).to.equal(project.selection);
            expect(projectFromData.getChildren()[1]).to.equal(project.root);
            expect(projectFromData.getChildren()[2]).to.equal(image);
            expect(projectFromData.getChildren()[3]).to.equal(sound);
            expect(projectFromData.selection).to.equal(project.selection);
            expect(projectFromData.root).to.equal(project.root);
            expect(projectFromData.assets[0]).to.equal(image);
            expect(projectFromData.assets[1]).to.equal(sound);
            expect(projectFromData.classname).to.equal('Project');
            expect(projectFromData.focus).to.equal(project.focus);
            expect(projectFromData.framerate).to.equal(12);
            expect(projectFromData.height).to.equal(405);
            expect(projectFromData.identifier).to.equal(null);
            expect(projectFromData.name).to.equal('My Project');
            expect(projectFromData.onionSkinEnabled).to.equal(false);
            expect(projectFromData.onionSkinSeekBackwards).to.equal(1);
            expect(projectFromData.onionSkinSeekForwards).to.equal(1);
            expect(projectFromData.pan).to.eql({
                x: 0,
                y: 0,
            });
            expect(projectFromData.root).to.equal(project.root);
            expect(projectFromData.selection).to.equal(project.selection);
            expect(projectFromData.uuid).to.equal(project.uuid);
            expect(projectFromData.width).to.equal(720);
            expect(projectFromData.zoom).to.equal(1);
        });
    });

    describe('#focus', function () {
        it('should clear selection when focus is changed', function () {
            var project = new Wick.Project();

            var clip1 = new Wick.Clip();
            project.activeFrame.addClip(clip1);

            var clip2 = new Wick.Clip();
            project.activeFrame.addClip(clip2);

            project.selection.select(clip1);
            project.selection.select(clip2);

            project.focus = project.root;
            expect(project.selection.numObjects).to.equal(2);

            project.focus = clip1;
            expect(project.selection.numObjects).to.equal(0);

            project.selection.select(clip1.activeFrame);
            project.focus = clip1;
            expect(project.selection.numObjects).to.equal(1);
            project.focus = project.root;
            expect(project.selection.numObjects).to.equal(0);
        });

        it('should reset plahead positions of subclips on focus change to parent', function () {
            var project = new Wick.Project();
            project.focus.activeFrame.end = 10;
            project.focus.timeline.playheadPosition = 2;

            var clip1 = new Wick.Clip();
            clip1.activeFrame.end = 5;
            clip1.timeline.playheadPosition = 3;
            project.activeFrame.addClip(clip1);

            var clip2 = new Wick.Clip();
            clip2.activeFrame.end = 5;
            clip2.timeline.playheadPosition = 4;
            project.activeFrame.addClip(clip2);

            // Updating focus should always reset subclip timelines.
            project.focus = project.root;
            expect(project.root.timeline.playheadPosition).to.equal(2);
            expect(clip1.timeline.playheadPosition).to.equal(1);
            expect(clip2.timeline.playheadPosition).to.equal(1);

            // Change focus to subclip, no playhead positions should change
            project.focus = clip1;
            expect(project.root.timeline.playheadPosition).to.equal(2);
            expect(clip1.timeline.playheadPosition).to.equal(1);
            expect(clip2.timeline.playheadPosition).to.equal(1);

            // Change playhead position of focused clip and set focus again, should not change playhead positions
            clip1.timeline.playheadPosition = 5;
            project.focus = clip1;
            expect(project.root.timeline.playheadPosition).to.equal(2);
            expect(clip1.timeline.playheadPosition).to.equal(5);
            expect(clip2.timeline.playheadPosition).to.equal(1);

            // Focus root again, playhead positions should reset
            project.focus = project.root;
            expect(project.root.timeline.playheadPosition).to.equal(2);
            expect(clip1.timeline.playheadPosition).to.equal(1);
            expect(clip2.timeline.playheadPosition).to.equal(1);
        });
    })

    describe('#addObject', function () {
        it('should add paths to the project', function() {
            let project = new Wick.Project();
            let path = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});
            expect(project.activeFrame.paths.length).to.equal(0);
            let returnValue = project.addObject(path);
            expect(returnValue).to.equal(true);
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.paths[0].uuid).to.equal(path.uuid);
        });

        it('should add clips to the project', function() {
            let project = new Wick.Project();
            let clip = new Wick.Clip();
            expect(project.activeFrame.clips.length).to.equal(0);
            let returnValue = project.addObject(clip);
            expect(returnValue).to.equal(true);
            expect(project.activeFrame.clips.length).to.equal(1);
            expect(project.activeFrame.clips[0].uuid).to.equal(clip.uuid);
        });

        it('should add frames to the project', function() {
            let project = new Wick.Project();
            let frame = new Wick.Frame({start:2});
            expect(project.activeLayer.frames.length).to.equal(1);
            let returnValue = project.addObject(frame);
            expect(returnValue).to.equal(true);
            expect(project.activeLayer.frames.length).to.equal(2);
            expect(project.activeLayer.frames[1].uuid).to.equal(frame.uuid);
        });

        it('should add layers to the project', function() {
            let project = new Wick.Project();
            let layer = new Wick.Layer();
            expect(project.activeTimeline.layers.length).to.equal(1);
            let returnValue = project.addObject(layer);
            expect(returnValue).to.equal(true);
            expect(project.activeTimeline.layers.length).to.equal(2);
            expect(project.activeTimeline.layers[1].uuid).to.equal(layer.uuid);
        });

        it('should add tweens to the project', function() {
            let project = new Wick.Project();
            let tween = new Wick.Tween();
            expect(project.activeFrame.tweens.length).to.equal(0);
            let returnValue = project.addObject(tween);
            expect(returnValue).to.equal(true);
            expect(project.activeFrame.tweens.length).to.equal(1);
            expect(project.activeFrame.tweens[0].uuid).to.equal(tween.uuid);
        });

        it('should add assets to the project', function() {
            let project = new Wick.Project();
            let asset = new Wick.ImageAsset();
            expect(project.getAssets().length).to.equal(0);
            let returnValue = project.addObject(asset);
            expect(returnValue).to.equal(true);
            expect(project.getAssets().length).to.equal(1);
            expect(project.getAssets()[0].uuid).to.equal(asset.uuid);
        });

        it('should not add non wick objects to the project', function() {
            let project = new Wick.Project();
            let obj = {};
            expect(project.activeFrame.getChildren().length).to.equal(0);
            let returnValue = project.addObject(obj);
            expect(returnValue).to.equal(false);
            expect(project.activeFrame.getChildren().length).to.equal(0);
        });
    });

    describe('#importFile', function () {
        it('should import sounds correctly', function(done) {
            var parts = [ TestUtils.dataURItoBlob(TestUtils.TEST_SOUND_SRC_WAV) ];
            var file = new File(parts, 'test.wav', {
                lastModified: new Date(0),
                type: "audio/wav"
            });

            var project = new Wick.Project();
            project.importFile(file, function (asset) {
                expect(asset instanceof Wick.SoundAsset).to.equal(true);
                expect(project.getAssets().length).to.equal(1);
                expect(project.getAssets()[0]).to.equal(asset);
                expect(asset.src).to.equal(TestUtils.TEST_SOUND_SRC_WAV);
                done();
            });
        });

        it('should import images correctly', function(done) {
            var parts = [ TestUtils.dataURItoBlob(TestUtils.TEST_IMG_SRC_PNG) ];
            var file = new File(parts, 'test.png', {
                lastModified: new Date(0),
                type: "image/png"
            });

            var project = new Wick.Project();
            project.importFile(file, function (asset) {
                expect(asset instanceof Wick.ImageAsset).to.equal(true);
                expect(project.getAssets().length).to.equal(1);
                expect(project.getAssets()[0]).to.equal(asset);
                expect(asset.src).to.equal(TestUtils.TEST_IMG_SRC_PNG);
                done();
            });
        });
    });

    describe('#tick', function () {
        it('should tick without error', function() {
            var project = new Wick.Project();
            var error = project.tick();
            expect(error).to.equal(null);
        });

        it('should tick with child clips', function() {
            var project = new Wick.Project();

            project.activeFrame.addClip(new Wick.Clip());
            project.activeFrame.addClip(new Wick.Button());

            var error = project.tick();
            expect(error).to.equal(null);
        });

        it('should run scripts of children on tick', function() {
            var project = new Wick.Project();

            project.activeFrame.addScript('load', 'this.__dummy = "foo"');

            var clip = new Wick.Clip();
            clip.addScript('load', 'var e = 0;');
            project.activeFrame.addClip(clip);

            var error = project.tick();
            expect(error).to.equal(null);
            expect(project.activeFrame.__dummy).to.equal('foo');
        });

        it('should advance timeline on tick', function() {
            var project = new Wick.Project();
            project.focus.timeline.layers[0].addFrame(new Wick.Frame({start:2}));
            project.tick();
            project.tick(); // (tick twice because first tick calls onActivated not onActive)
            expect(project.focus.timeline.playheadPosition).to.equal(2);
        });

        it('should advance timeline on tick (inside a clip)', function() {
            var project = new Wick.Project();
            var focus = new Wick.Clip();
            project.activeFrame.addClip(focus);
            project.focus = focus;

            focus.timeline.addLayer(new Wick.Layer());
            focus.timeline.layers[0].addFrame(new Wick.Frame());
            focus.activeFrame.end = 10;

            project.tick();
            project.tick(); // (tick twice because first tick calls onActivated not onActive)
            expect(project.focus.timeline.playheadPosition).to.equal(2);
        });

        it('should advance timeline on tick (inside a clip) and ignore scripts of that clip', function() {
            var project = new Wick.Project();
            var focus = new Wick.Clip();
            focus.addScript('update', 'this.stop()');
            project.addObject(focus);
            project.focus = focus;

            focus.timeline.addLayer(new Wick.Layer());
            focus.timeline.layers[0].addFrame(new Wick.Frame());
            focus.activeFrame.end = 10;

            project.tick();
            project.tick(); // (tick twice because first tick calls onActivated not onActive)
            expect(project.focus.timeline.playheadPosition).to.equal(2);
        });

        it('should tween an object correctly (preview play)', function () {
            var project = new Wick.Project();

            var frame = project.activeFrame;
            frame.end = 9;

            var clip = new Wick.Clip();
            frame.addClip(clip);

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
                    opacity: 0.0,
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

            project.tick(); // playhead = 1

            expect(clip.transformation.x).to.be.closeTo(0, 0.01);
            expect(clip.transformation.y).to.be.closeTo(0, 0.01);
            expect(clip.transformation.scaleX).to.be.closeTo(1, 0.01);
            expect(clip.transformation.scaleY).to.be.closeTo(1, 0.01);
            expect(clip.transformation.rotation).to.be.closeTo(0, 0.01);
            expect(clip.transformation.opacity).to.be.closeTo(1, 0.01);

            project.tick(); // playhead = 2
            project.tick(); // playhead = 3

            expect(clip.transformation.x).to.be.closeTo(50, 0.01);
            expect(clip.transformation.y).to.be.closeTo(100, 0.01);
            expect(clip.transformation.scaleX).to.be.closeTo(1.5, 0.01);
            expect(clip.transformation.scaleY).to.be.closeTo(0.75, 0.01);
            expect(clip.transformation.rotation).to.be.closeTo(90, 0.01);
            expect(clip.transformation.opacity).to.be.closeTo(0.5, 0.01);

            project.tick(); // playhead = 4
            project.tick(); // playhead = 5

            expect(clip.transformation.x).to.be.closeTo(100, 0.01);
            expect(clip.transformation.y).to.be.closeTo(200, 0.01);
            expect(clip.transformation.scaleX).to.be.closeTo(2, 0.01);
            expect(clip.transformation.scaleY).to.be.closeTo(0.5, 0.01);
            expect(clip.transformation.rotation).to.be.closeTo(180, 0.01);
            expect(clip.transformation.opacity).to.be.closeTo(0.0, 0.01);

            project.tick(); // playhead = 6
            project.tick(); // playhead = 7

            expect(clip.transformation.x).to.be.closeTo(100, 0.01);
            expect(clip.transformation.y).to.be.closeTo(200, 0.01);
            expect(clip.transformation.scaleX).to.be.closeTo(2, 0.01);
            expect(clip.transformation.scaleY).to.be.closeTo(0.5, 0.01);
            expect(clip.transformation.rotation).to.be.closeTo(180, 0.01);
            expect(clip.transformation.opacity).to.be.closeTo(0.5, 0.01);

            project.tick(); // playhead = 8
            project.tick(); // playhead = 9

            expect(clip.transformation.x).to.be.closeTo(100, 0.01);
            expect(clip.transformation.y).to.be.closeTo(200, 0.01);
            expect(clip.transformation.scaleX).to.be.closeTo(2, 0.01);
            expect(clip.transformation.scaleY).to.be.closeTo(0.5, 0.01);
            expect(clip.transformation.rotation).to.be.closeTo(180, 0.01);
            expect(clip.transformation.opacity).to.be.closeTo(1.0, 0.01);
        });
    });

    describe('#play', function () {
        it('should play without error', function(done) {
            var project = new Wick.Project();

            project.play({
                onAfterTick: () => {
                    project.stop();
                    done();
                }
            })
        });

        it('should send error through callback if there is an error', function(done) {
            var project = new Wick.Project();
            project.framerate = 60;

            project.activeFrame.addScript('load', 'thisWillCauseAnError();');

            project.play({
                onError: error => {
                expect(error.message).to.equal('thisWillCauseAnError is not defined');
                    done();
                }
            });
        });

        it('should send error through callback if there is an error after a few ticks', function(done) {
            var project = new Wick.Project();
            project.framerate = 60;

            project.activeLayer.addFrame(new Wick.Frame(2,5));
            var frame = new Wick.Frame(6);
            project.activeLayer.addFrame(frame);
            frame.addScript('load', 'thisWillCauseAnError();');

            project.play({
                onError: error => {
                    expect(error.message).to.equal('thisWillCauseAnError is not defined');
                    done();
                },
            });
        });
    });

    describe('#stop', function () {
        it('should stop project from running so that a script doesnt run', function(done) {
            var project = new Wick.Project();
            project.activeFrame.addScript('load', 'thisWillCauseAnError();');
            project.play({
                onError: error => {
                    throw Error('The script ran, it should not have!');
                    expect(false).to.equal(true);
                }
            });
            project.stop();
            done();
        });

        it('should stop all sounds', function (done) {
            var project = new Wick.Project();
            var sound = new Wick.SoundAsset({
                filename: 'test.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV,
            });
            project.addAsset(sound);
            project.activeFrame.sound = sound;
            project.activeFrame.end = 10;

            project.play({
                onAfterTick: () => {
                    expect(project.activeFrame.isSoundPlaying()).to.equal(true);
                    project.stop();
                    expect(project.activeFrame.isSoundPlaying()).to.equal(false);
                    done();
                }
            });
        });

        it('should run unload scripts on all clips when the project is stopped', function (done) {
            var project = new Wick.Project();

            var rootLevelClip = new Wick.Clip();
            rootLevelClip.addScript('unload', 'this.__unloadScriptRan = true;');
            project.activeFrame.addClip(rootLevelClip);

            var childClip = new Wick.Clip();
            childClip.addScript('unload', 'this.__unloadScriptRan = true;');
            rootLevelClip.activeFrame.addClip(childClip);

            project.play({
                onAfterTick: () => {
                    project.stop();
                    expect(rootLevelClip.__unloadScriptRan).to.equal(true);
                    expect(childClip.__unloadScriptRan).to.equal(true);
                    done();
                }
            });
        });
    });

    describe('#getAllFrames', function () {
        it('should return all frames in the project', function () {
            var project = new Wick.Project();

            var rootLevelClip = new Wick.Clip();
            rootLevelClip.addScript('unload', 'this.__unloadScriptRan = true;');
            project.activeFrame.addClip(rootLevelClip);

            var childClip = new Wick.Clip();
            childClip.addScript('unload', 'this.__unloadScriptRan = true;');
            rootLevelClip.activeFrame.addClip(childClip);

            expect(project.getAllFrames().length).to.equal(3);
            expect(project.getAllFrames()[0]).to.equal(project.root.activeFrame);
            expect(project.getAllFrames()[1]).to.equal(rootLevelClip.activeFrame);
            expect(project.getAllFrames()[2]).to.equal(childClip.activeFrame);
        });
    });

    describe('#createClipFromSelection', function () {
        it('should create a clip out of selected paths', function () {
            var project = new Wick.Project();

            var path1 = new Wick.Path({
                json: TestUtils.TEST_PATH_JSON_BLUE_SQUARE,
            });
            var path2 = new Wick.Path({
                json: TestUtils.TEST_PATH_JSON_RED_SQUARE
            });

            project.activeFrame.addPath(path1);
            project.activeFrame.addPath(path2);

            project.selection.select(project.activeFrame.paths[0]);
            project.selection.select(project.activeFrame.paths[1]);

            project.view.render();

            project.createClipFromSelection({
                identifier: 'foo',
                type: 'Clip'
            });

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(1);
            expect(project.activeFrame.clips[0] instanceof Wick.Clip).to.equal(true);
            expect(project.activeFrame.clips[0] instanceof Wick.Button).to.equal(false);
            expect(project.activeFrame.clips[0].activeFrame.paths.length).to.equal(2);
            expect(project.activeFrame.clips[0].activeFrame.paths[0]).to.equal(path1);
            expect(project.activeFrame.clips[0].activeFrame.paths[1]).to.equal(path2);
            expect(project.activeFrame.clips[0].activeFrame.clips.length).to.equal(0);
        });

        it('should create a clip out of selected clips', function () {
            var project = new Wick.Project();

            var clip1 = new Wick.Clip({
                identifier: 'foo',
                objects: [new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE})]
            });
            project.activeFrame.addClip(clip1);

            var clip2 = new Wick.Clip({
                identifier: 'foo',
                objects: [new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE})]
            });
            project.activeFrame.addClip(clip2);

            project.selection.select(project.activeFrame.clips[0]);
            project.selection.select(project.activeFrame.clips[1]);

            project.view.render();

            project.createClipFromSelection({
                identifier: 'bar',
                type: 'Clip',
            });

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(1);
            expect(project.activeFrame.clips[0] instanceof Wick.Clip).to.equal(true);
            expect(project.activeFrame.clips[0] instanceof Wick.Button).to.equal(false);
            expect(project.activeFrame.clips[0].activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips[0].activeFrame.clips.length).to.equal(2);
        });

        it('should create a clip out of selected clips and paths', function () {
            var project = new Wick.Project();

            var pathJson1 = new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'red',
            }).exportJSON({asString:false});
            var pathJson2 = new paper.Path.Rectangle({
                from: [100, 100],
                to: [150, 150],
                fillColor: 'red',
            }).exportJSON({asString:false});

            project.activeFrame.addPath(new Wick.Path({json:pathJson1}));

            project.activeFrame.addClip(new Wick.Clip({
                identifier: 'foo',
                objects: [
                    new Wick.Path({
                        json: pathJson2
                    })
                ],
            }));

            project.selection.select(project.activeFrame.paths[0]);
            project.selection.select(project.activeFrame.clips[0]);

            project.view.render();

            project.createClipFromSelection({
                identifier: 'bar',
                type: 'Clip'
            });

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(1);
            expect(project.activeFrame.clips[0] instanceof Wick.Clip).to.equal(true);
            expect(project.activeFrame.clips[0] instanceof Wick.Button).to.equal(false);
            expect(project.activeFrame.clips[0].activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.clips[0].activeFrame.clips.length).to.equal(1);
        });
    });

    describe('#createButtonFromSelection', function () {
        it('should create a button out of selected paths', function () {
            var project = new Wick.Project();

            var pathJson1 = new paper.Path.Rectangle({
                from: [50, 50],
                to: [100, 100],
                fillColor: 'red',
            }).exportJSON({asString:false});
            var pathJson2 = new paper.Path.Rectangle({
                from: [100, 100],
                to: [150, 150],
                fillColor: 'red',
            }).exportJSON({asString:false})

            project.activeFrame.addPath(new Wick.Path({json: pathJson1}));
            project.activeFrame.addPath(new Wick.Path({json: pathJson2}));

            project.selection.select(project.activeFrame.paths[0]);
            project.selection.select(project.activeFrame.paths[1]);

            project.view.render();

            project.createClipFromSelection({
                identifier: 'foo',
                type: 'Button'
            });

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(1);
            expect(project.activeFrame.clips[0] instanceof Wick.Button).to.equal(true);
        });
    });

    describe('#deleteSelectedObjects', function () {
        it('should delete all selected objects', function () {
            var project = new Wick.Project();

            var clip = new Wick.Clip();
            var button = new Wick.Button();
            var path = new Wick.Path({json:TestUtils.TEST_PATH_JSON_RED_SQUARE});

            var imageAsset = new Wick.ImageAsset({
                filename: 'test.png',
                src: TestUtils.TEST_IMAGE_SRC_PNG
            });
            var soundAsset = new Wick.ImageAsset({
                filename: 'test.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });

            var layer = new Wick.Layer();
            var frame = new Wick.Frame({start:2});
            var tween = new Wick.Tween();

            project.activeFrame.addClip(clip);
            project.activeFrame.addClip(button);
            project.activeFrame.addPath(path);
            project.addAsset(imageAsset);
            project.addAsset(soundAsset);
            project.focus.timeline.addLayer(layer);
            project.activeLayer.addFrame(frame);
            project.activeFrame.addTween(tween);

            project.selection.select(clip);
            project.selection.select(button);
            project.selection.select(path);

            expect(project.selection.numObjects).to.equal(3);
            expect(project.activeFrame.paths.length).to.equal(1);
            expect(project.activeFrame.clips.length).to.equal(2);

            project.deleteSelectedObjects();

            expect(project.activeFrame.paths.length).to.equal(0);
            expect(project.activeFrame.clips.length).to.equal(0);
            expect(project.selection.numObjects).to.equal(0);
        });
    });

    describe('#getAssets', function () {
        it('should return all assets', function () {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                src: TestUtils.TEST_IMAGE_SRC_PNG
            });
            project.addAsset(imageAsset);

            var soundAsset = new Wick.SoundAsset({
                src: TestUtils.TEST_SOUND_SRC_WAV,
            });
            project.addAsset(soundAsset);

            var clipAsset = new Wick.ClipAsset();
            project.addAsset(clipAsset);

            expect(project.getAssets()).to.eql([imageAsset, soundAsset, clipAsset]);
        });

        it('should return image assets', function () {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            project.addAsset(imageAsset);

            var soundAsset = new Wick.SoundAsset({
                src: TestUtils.TEST_SOUND_SRC_WAV,
            });
            project.addAsset(soundAsset);

            var clipAsset = new Wick.ClipAsset();
            project.addAsset(clipAsset);

            expect(project.getAssets('Image')).to.eql([imageAsset]);
        });

        it('should return sound assets', function () {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                src: TestUtils.TEST_IMG_SRC_PNG,
            });
            project.addAsset(imageAsset);

            var soundAsset = new Wick.SoundAsset({
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            project.addAsset(soundAsset);

            var clipAsset = new Wick.ClipAsset();
            project.addAsset(clipAsset);

            expect(project.getAssets('Sound')).to.eql([soundAsset]);
        });

        it('should return clip assets', function () {
            var project = new Wick.Project();

            var imageAsset = new Wick.ImageAsset({
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            project.addAsset(imageAsset);

            var soundAsset = new Wick.SoundAsset({
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            project.addAsset(soundAsset);

            var clipAsset = new Wick.ClipAsset();
            project.addAsset(clipAsset);

            expect(project.getAssets('Clip')).to.eql([clipAsset]);
        });
    });

    describe('#generateImageSequence', function () {
        it('should export correct images', function (done) {
            var project = new Wick.Project();
            project.activeLayer.addFrame(new Wick.Frame({start: 2}));
            project.activeLayer.addFrame(new Wick.Frame({start: 3}));

            let path1 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});
            let path2 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_BLUE_SQUARE});
            let path3 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});

            project.activeFrame.addPath(path1);
            project.activeLayer.frames[1].addPath(path2);
            project.activeLayer.frames[2].addPath(path3);

            project.generateImageSequence({}, images => {
                expect(images.length).to.equal(3);
                // TODO need more tests here
                done();
            });
        });
    });

    describe('#isKeyDown', function () {
        // TODO
    });

    describe('#isKeyJustPressed', function () {
        // TODO
    });

    describe('#clipboard + history bug', function () {
        it('should not throw an error when history is undone after clipboard content changes', function () {
            var project = new Wick.Project();
            project.history.pushState();
            project.selection.select(project.activeFrame);
            project.copySelectionToClipboard();
            project.history.popState();

            var project2 = new Wick.Project();
            project2.history.pushState();
            project2.selection.select(project2.activeFrame);
            project2.copySelectionToClipboard();
            project2.history.popState();
        });
    });
});
