describe('Wick.Project', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function() {
            var project = new Wick.Project();
            expect(project.classname).to.equal('Project');

            expect(project.width).to.equal(720);
            expect(project.height).to.equal(480);
            expect(project.framerate).to.equal(12);
            expect(project.backgroundColor.hex).to.equal('#ffffff');

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
            Wick.ObjectCache.clear();

            var project = new Wick.Project();
            project.backgroundColor = new Wick.Color('#000000');

            var image = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            var clip = new Wick.ClipAsset({
                filename: 'foo.wickobject',
                data: new Wick.Clip().export(),
            });
            var svg = new Wick.SVGAsset({
                filename: 'foo.svg',
                data: TestUtils.TEST_SVG_SRC
            });
            project.addAsset(image);
            project.addAsset(sound);
            project.addAsset(clip);
            project.addAsset(svg);

            var data = project.serialize();

            expect(data.backgroundColor).to.equal('rgb(0,0,0)');
            expect(data.children).to.eql([
                project.selection.uuid,
                project.root.uuid,
                image.uuid,
                sound.uuid,
                clip.uuid,
                svg.uuid,
            ]);
            expect(data.classname).to.equal('Project');
            expect(data.focus).to.equal(project.focus.uuid);
            expect(data.framerate).to.equal(12);
            expect(data.height).to.equal(480);
            expect(data.identifier).to.equal(null);
            expect(data.name).to.equal('My Project');
            expect(data.onionSkinEnabled).to.equal(false);
            expect(data.onionSkinSeekBackwards).to.equal(1);
            expect(data.onionSkinSeekForwards).to.equal(1);
            expect(data.uuid).to.equal(project.uuid);
            expect(data.width).to.equal(720);
        });
    });

    describe('#deserialize', function () {
        it('should deserialize correctly', function() {
            Wick.ObjectCache.clear();

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

            expect(projectFromData.backgroundColor.hex).to.equal('#ffffff');
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
            expect(projectFromData.height).to.equal(480);
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

            // Change focus to subclip, then back to root. playhead positions should reset
            project.focus = clip1;
            project.focus = project.root;
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

        it('should reset zoom and pan when focus changes', function () {
            var project = new Wick.Project();

            project.zoom = 2;
            project.pan.x = 100;
            project.pan.y = 200;

            var clip1 = new Wick.Clip();
            project.activeFrame.addClip(clip1);

            project.focus = clip1;
            expect(project.zoom).to.equal(1);
            expect(project.pan.x).to.equal(0);
            expect(project.pan.y).to.equal(0);
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
        it('should import sounds correctly (wav)', function(done) {
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

        it('should import sounds correctly (mp3)', function(done) {
            var parts = [ TestUtils.dataURItoBlob(TestUtils.TEST_SOUND_SRC_MP3) ];
            var file = new File(parts, 'test.mp3', {
                lastModified: new Date(0),
                type: "audio/mp3"
            });

            var project = new Wick.Project();
            project.importFile(file, function (asset) {
                expect(asset instanceof Wick.SoundAsset).to.equal(true);
                expect(project.getAssets().length).to.equal(1);
                expect(project.getAssets()[0]).to.equal(asset);
                expect(asset.src).to.equal(TestUtils.TEST_SOUND_SRC_MP3);
                done();
            });
        });

        it('should import sounds correctly (ogg)', function(done) {
            var parts = [ TestUtils.dataURItoBlob(TestUtils.TEST_SOUND_SRC_OGG) ];
            var file = new File(parts, 'test.ogg', {
                lastModified: new Date(0),
                type: "audio/ogg"
            });

            var project = new Wick.Project();
            project.importFile(file, function (asset) {
                expect(asset instanceof Wick.SoundAsset).to.equal(true);
                expect(project.getAssets().length).to.equal(1);
                expect(project.getAssets()[0]).to.equal(asset);
                expect(asset.src).to.equal(TestUtils.TEST_SOUND_SRC_OGG);
                done();
            });
        });

        it('should import sounds correctly (ogg) (firefox video/ogg bug)', function(done) {
            var parts = [ TestUtils.dataURItoBlob(TestUtils.TEST_SOUND_SRC_VIDEO_OGG) ];
            var file = new File(parts, 'test.ogg', {
                lastModified: new Date(0),
                type: "video/ogg"
            });

            var project = new Wick.Project();
            project.importFile(file, function (asset) {
                expect(asset instanceof Wick.SoundAsset).to.equal(true);
                expect(project.getAssets().length).to.equal(1);
                expect(project.getAssets()[0]).to.equal(asset);
                expect(asset.src).to.equal(TestUtils.TEST_SOUND_SRC_VIDEO_OGG);
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

        it('should import fonts correctly', function(done) {
            var parts = [ TestUtils.dataURItoBlob(TestUtils.TEST_FONT_SRC_TTF) ];
            var file = new File(parts, 'ABeeZee.ttf', {
                lastModified: new Date(0),
                type: "font/ttf",
            });

            var project = new Wick.Project();
            project.importFile(file, function (asset) {
                expect(asset instanceof Wick.FontAsset).to.equal(true);
                expect(project.getAssets().length).to.equal(1);
                expect(project.getAssets()[0]).to.equal(asset);
                expect(asset.src).to.equal(TestUtils.TEST_FONT_SRC_TTF);
                expect(asset.fontFamily).to.equal('ABeeZee');
                done();
            });
        });

        it('should import clips correctly', function(done) {
            var parts = [ TestUtils.dataURItoBlob(TestUtils.TEST_WICKOBJ_SRC) ];
            var file = new File(parts, 'object.wickobj', {
                lastModified: new Date(0),
                type: "application/json",
            });

            var project = new Wick.Project();
            project.importFile(file, function (asset) {
                expect(asset instanceof Wick.ClipAsset).to.equal(true);
                expect(project.getAssets().length).to.equal(1);
                expect(project.getAssets()[0]).to.equal(asset);
                expect(asset.src).to.equal(TestUtils.TEST_WICKOBJ_SRC);
                done();
            });
        });

        it('should import clips correctly (missing mimetype bug)', function(done) {
            var parts = [ TestUtils.dataURItoBlob(TestUtils.TEST_WICKOBJ_SRC) ];
            var file = new File(parts, 'object.wickobj', {
                lastModified: new Date(0),
                type: "",
            });

            var project = new Wick.Project();
            project.importFile(file, function (asset) {
                expect(asset instanceof Wick.ClipAsset).to.equal(true);
                expect(project.getAssets().length).to.equal(1);
                expect(project.getAssets()[0]).to.equal(asset);
                expect(asset.src.split(';')[1]).to.equal(TestUtils.TEST_WICKOBJ_SRC.split(';')[1]);
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
            expect(project.activeFrame.parentClip.__dummy).to.equal('foo');
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

        it('should run all scripts in the correct order', function () {
            // This checks that all default scrips run before all load scripts.
            window.scriptOrder = [];

            var project = new Wick.Project();
            var frame = project.activeFrame;

            var clip1 = new Wick.Clip();
            var clip2 = new Wick.Clip();
            var clip3 = new Wick.Clip();
            frame.addClip(clip1);
            frame.addClip(clip2);
            frame.addClip(clip3);

            clip1.addScript('load', 'window.scriptOrder.push({uuid: this.uuid, name: "load"})');
            clip1.addScript('default', 'window.scriptOrder.push({uuid: this.uuid, name: "default"})');
            clip2.addScript('load', 'window.scriptOrder.push({uuid: this.uuid, name: "load"})');
            clip2.addScript('default', 'window.scriptOrder.push({uuid: this.uuid, name: "default"})');
            clip3.addScript('load', 'window.scriptOrder.push({uuid: this.uuid, name: "load"})');
            clip3.addScript('default', 'window.scriptOrder.push({uuid: this.uuid, name: "default"})');

            project.tick();
            project.tick(); // (tick twice because first tick calls onActivated not onActive)
            expect(window.scriptOrder[0].uuid).to.equal(clip1.uuid);
            expect(window.scriptOrder[0].name).to.equal('default');
            expect(window.scriptOrder[1].uuid).to.equal(clip2.uuid);
            expect(window.scriptOrder[1].name).to.equal('default');
            expect(window.scriptOrder[2].uuid).to.equal(clip3.uuid);
            expect(window.scriptOrder[2].name).to.equal('default');
            expect(window.scriptOrder[3].uuid).to.equal(clip1.uuid);
            expect(window.scriptOrder[3].name).to.equal('load');
            expect(window.scriptOrder[4].uuid).to.equal(clip2.uuid);
            expect(window.scriptOrder[4].name).to.equal('load');
            expect(window.scriptOrder[5].uuid).to.equal(clip3.uuid);
            expect(window.scriptOrder[5].name).to.equal('load');

            delete window.scriptOrder;
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

        it('playing flag should update correctly', function(done) {
            var project = new Wick.Project();
            expect(project.playing).to.equal(false);

            project.play({
                onAfterTick: () => {
                    expect(project.playing).to.equal(true);
                    project.stop();
                    expect(project.playing).to.equal(false);
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
                    expect(error.uuid).to.equal(frame.uuid);
                    expect(error.name).to.equal("load");
                    expect(error.lineNumber).to.equal(1);
                    expect(error.message).to.equal('thisWillCauseAnError is not defined');
                    done();
                },
            });
        });

        it('should select object that error occured in', function(done) {
            var project = new Wick.Project();
            project.framerate = 60;

            project.activeFrame.addScript('load', 'thisWillCauseAnError();');

            project.play({
                onError: error => {
                    expect(error.uuid).to.equal(project.activeFrame.uuid);
                    expect(error.name).to.equal("load");
                    expect(error.lineNumber).to.equal(1);
                    expect(error.message).to.equal('thisWillCauseAnError is not defined');
                    expect(project.selection.getSelectedObject()).to.equal(project.activeFrame);
                    expect(project.focus).to.equal(project.root);
                    done();
                }
            });
        });

        it('should change focus to parent of object that error occured in', function(done) {
            var project = new Wick.Project();
            project.framerate = 60;

            var clip = new Wick.Clip();
            clip.activeFrame.addScript('load', 'thisWillCauseAnError();');
            project.activeFrame.addClip(clip);

            project.play({
                onError: error => {
                    expect(error.uuid).to.equal(clip.activeFrame.uuid);
                    expect(error.name).to.equal("load");
                    expect(error.lineNumber).to.equal(1);
                    expect(error.message).to.equal('thisWillCauseAnError is not defined');
                    expect(project.focus).to.equal(clip);
                    expect(project.selection.getSelectedObject()).to.equal(clip.activeFrame);
                    done();
                }
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

            window.tempArea = {};

            var rootLevelClip = new Wick.Clip();
            rootLevelClip.addScript('unload', 'window.tempArea[this.uuid] = true;');
            project.activeFrame.addClip(rootLevelClip);

            var childClip = new Wick.Clip();
            childClip.addScript('unload', 'window.tempArea[this.uuid] = true;');
            rootLevelClip.activeFrame.addClip(childClip);

            project.play({
                onAfterTick: () => {
                    project.stop();
                    expect(window.tempArea[rootLevelClip.uuid]).to.equal(true);
                    expect(window.tempArea[childClip.uuid]).to.equal(true);
                    delete window.tempArea;
                    done();
                }
            });
        });

        it('should catch errors from unload scripts when the project is stopped', function (done) {
            var project = new Wick.Project();

            var rootLevelClip = new Wick.Clip();
            rootLevelClip.addScript('unload', 'thisWillCauseAnError();');
            project.activeFrame.addClip(rootLevelClip);

            project.play({
                onAfterTick: () => {
                    project.stop();
                    console.log(project.error)
                    done();
                },
                onError: () => {
                    console.log('a')
                },
            });
        });

        it('should save playheadPosition after preview play', function (done) {
            var project = new Wick.Project();
            project.activeLayer.addFrame(new Wick.Frame({start:2}));
            project.activeLayer.addFrame(new Wick.Frame({start:3}));

            project.play({
                onAfterTick: () => {
                    if(project.activeTimeline.playheadPosition === 3) {
                        project.stop();
                        expect(project.activeTimeline.playheadPosition).to.equal(3);
                        done();
                    }
                }
            });
        });

        it('should clear all custom attributes set by scripts', function (done) {
            var project = new Wick.Project();

            var frame = project.activeFrame;
            var clip = new Wick.Clip();
            clip.addScript('default', 'this._shouldNotLeak = 123');
            frame.addClip(clip);

            project.play({
                onAfterTick: () => {
                    expect(clip._shouldNotLeak).to.equal(123);
                    project.stop();
                    expect(clip._shouldNotLeak).to.equal(undefined);
                    done();
                }
            });
        });
    });

    describe('#inject', function () {
        it('should inject into a div correctly', function () {
            var container = document.createElement('div');
            container.width = 500;
            container.height = 500;
            document.body.appendChild(container);

            var project = new Wick.Project();

            project.inject(container);

            project.stop();

            expect(container.children[0]).to.equal(project.view._svgCanvas);

            document.body.removeChild(container);
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

            var clipAsset = new Wick.ClipAsset({
                data: new Wick.Clip().export(),
            });
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

            var clipAsset = new Wick.ClipAsset({
                data: new Wick.Clip().export(),
            });
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

            var clipAsset = new Wick.ClipAsset({
                data: new Wick.Clip().export(),
            });
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

            var clipAsset = new Wick.ClipAsset({
                data: new Wick.Clip().export(),
            });
            project.addAsset(clipAsset);

            expect(project.getAssets('Clip')).to.eql([clipAsset]);
        });
    });

    describe('#generateImageSequence', function () {
        it('should export correct images', function (done) {
            var project = new Wick.Project();
            project.backgroundColor = new Wick.Color('#FF00FF');
            project.activeLayer.addFrame(new Wick.Frame({start: 2}));
            project.activeLayer.addFrame(new Wick.Frame({start: 3}));

            let path1 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});
            let path2 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_BLUE_SQUARE});
            let path3 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_GREEN_SQUARE});

            project.activeFrame.addPath(path1);
            project.activeLayer.frames[1].addPath(path2);
            project.activeLayer.frames[2].addPath(path3);

            project.generateImageSequence({
                onFinish: (images) => {
                    images.forEach(image => {
                        expect(image.width).to.equal(project.width);
                        expect(image.height).to.equal(project.height);
                    });

                    expect(images.length).to.equal(3);
                    done();
                }
            }); 
        });

        it('should export correct images (zoom 2x, same aspect ratio)', function (done) {
            var project = new Wick.Project();
            project.backgroundColor = new Wick.Color('#FF00FF');
            project.activeLayer.addFrame(new Wick.Frame({start: 2}));
            project.activeLayer.addFrame(new Wick.Frame({start: 3}));

            let path1 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});
            let path2 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_BLUE_SQUARE});
            let path3 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_GREEN_SQUARE});

            project.activeFrame.addPath(path1);
            project.activeLayer.frames[1].addPath(path2);
            project.activeLayer.frames[2].addPath(path3);

            // for testing is onProgress works (this is kind of hacky and weird to test...)
            var onProgressCallsCorrect = [[1,3],[2,3],[3,3]];
            var onProgressCallsResult = [];

            project.generateImageSequence({
                width: project.width * 2,
                height: project.height * 2,
                onProgress: (current, max) => {
                    onProgressCallsResult.push([current,max]);
                },
                onFinish: images => {
                    images.forEach(image => {
                        expect(image.width).to.equal(project.width * 2);
                        expect(image.height).to.equal(project.height * 2);

                        var imageName = document.createElement('p');
                        imageName.innerHTML = 'zoom 2x, same aspect ratio, frame ' + images.indexOf(image);
                        document.body.appendChild(imageName);
                        document.body.appendChild(image);
                    });
                    expect(images.length).to.equal(3);

                    expect(onProgressCallsResult).to.deep.equal(onProgressCallsCorrect);

                    done();
                }
            });
        });

        it('should export correct images (square aspect ratio, 720p project)', function (done) {
            var project = new Wick.Project();
            project.backgroundColor = new Wick.Color('#FF00FF');
            project.activeLayer.addFrame(new Wick.Frame({start: 2}));
            project.activeLayer.addFrame(new Wick.Frame({start: 3}));

            let path1 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});
            let path2 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_BLUE_SQUARE});
            let path3 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_GREEN_SQUARE});

            project.activeFrame.addPath(path1);
            project.activeLayer.frames[1].addPath(path2);
            project.activeLayer.frames[2].addPath(path3);

            // for testing is onProgress works (this is kind of hacky and weird to test...)
            var onProgressCallsCorrect = [[1,3],[2,3],[3,3]];
            var onProgressCallsResult = [];

            project.generateImageSequence({
                width: 1000,
                height: 1000,
                onProgress: (current, max) => {
                    onProgressCallsResult.push([current,max]);
                },
                onFinish: images => {
                    images.forEach(image => {
                        expect(image.width).to.equal(1000);
                        expect(image.height).to.equal(1000);

                        var imageName = document.createElement('p');
                        imageName.innerHTML = 'square aspect ratio, 720p project, frame ' + images.indexOf(image);
                        document.body.appendChild(imageName);
                        document.body.appendChild(image);
                    });
                    expect(images.length).to.equal(3);

                    expect(onProgressCallsResult).to.deep.equal(onProgressCallsCorrect);

                    done();
                }
            });
        });

        it('should export correct images (super wide aspect ratio, 720p project)', function (done) {
            var project = new Wick.Project();
            project.backgroundColor = new Wick.Color('#FF00FF');
            project.activeLayer.addFrame(new Wick.Frame({start: 2}));
            project.activeLayer.addFrame(new Wick.Frame({start: 3}));

            let path1 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_RED_SQUARE});
            let path2 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_BLUE_SQUARE});
            let path3 = new Wick.Path({json: TestUtils.TEST_PATH_JSON_GREEN_SQUARE});

            project.activeFrame.addPath(path1);
            project.activeLayer.frames[1].addPath(path2);
            project.activeLayer.frames[2].addPath(path3);

            // for testing is onProgress works (this is kind of hacky and weird to test...)
            var onProgressCallsCorrect = [[1,3],[2,3],[3,3]];
            var onProgressCallsResult = [];

            project.generateImageSequence({
                width: 2000,
                height: 500,
                onProgress: (current, max) => {
                    onProgressCallsResult.push([current,max]);
                },
                onFinish: images => {
                    images.forEach(image => {
                        expect(image.width).to.equal(2000);
                        expect(image.height).to.equal(500);

                        var imageName = document.createElement('p');
                        imageName.innerHTML = 'super wide aspect ratio, 720p project, frame ' + images.indexOf(image);
                        document.body.appendChild(imageName);
                        document.body.appendChild(image);
                    });
                    expect(images.length).to.equal(3);

                    expect(onProgressCallsResult).to.deep.equal(onProgressCallsCorrect);

                    done();
                }
            });
        });
    });

    describe('#getAudioInfo', function () {
        it('should return audio data' , function () {
            var project = new Wick.Project();

            var sound1 = new Wick.SoundAsset({
                filename: 'test1.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            project.addAsset(sound1);

            var sound2 = new Wick.SoundAsset({
                filename: 'test2.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            project.addAsset(sound2);

            project.activeFrame.sound = sound1;
            project.activeFrame.end = 10;

            var frame = new Wick.Frame({start: 11, end: 30});
            frame.sound = sound2
            project.activeLayer.addFrame(frame);

            var audioInfo = project.getAudioInfo();
            expect(audioInfo.length).to.equal(2);
            expect(audioInfo[0].start).to.equal(0);
            expect(audioInfo[0].end).to.equal(10 * (1000 / project.framerate));
            expect(audioInfo[0].offset).to.equal(0);
            expect(audioInfo[0].src).to.equal(sound1.src);
            expect(audioInfo[1].start).to.equal(10 * (1000 / project.framerate));
            expect(audioInfo[1].end).to.equal(30 * (1000 / project.framerate));
            expect(audioInfo[1].offset).to.equal(0);
            expect(audioInfo[1].src).to.equal(sound1.src);
        });
    })

    describe('#generateAudioTrack', function () {
        it('should return an empty audio sequence if project has no sounds', function (done) {
            var project = new Wick.Project();

            project.generateAudioSequence({onFinish: audioSequence => {
                    expect(audioSequence).to.be.an('array');
                    expect(audioSequence.length).to.equal(0);
                    done();
                }
            });
        });

        it('Should find sounds on the first frame.', function (done) {
            var project = new Wick.Project();

            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });

            project.addAsset(sound);

            project.activeFrame.sound = sound;
            project.activeFrame.end = 12;

            project.generateAudioSequence({onFinish: audioSequence => {
                    expect(audioSequence).to.be.an('array');
                    expect(audioSequence.length).to.equal(1);
                    done();
                }
            });
        });

        it('Should find sounds on the second frame.', function (done) {
            var project = new Wick.Project();

            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });

            project.activeFrame.end = 6;

            var frame2 = new Wick.Frame({start: 7, end: 12});
            project.activeLayer.addFrame(frame2);

            project.addAsset(sound);

            frame2.sound = sound;

            project.generateAudioSequence({onFinish: audioSequence => {
                    expect(audioSequence).to.be.an('array');
                    expect(audioSequence.length).to.equal(1);
                    done();
                }
            });
        });

        it('Should find 2 sounds on the first and second frame.', function (done) {
            var project = new Wick.Project();

            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });

            project.activeFrame.end = 6;

            var frame2 = new Wick.Frame({start: 7, end: 12});
            project.activeLayer.addFrame(frame2);

            project.addAsset(sound);

            project.activeFrame.sound = sound;
            frame2.sound = sound;
            
            project.generateAudioSequence({onFinish: audioSequence => {
                    expect(audioSequence).to.be.an('array');
                    expect(audioSequence.length).to.equal(2);
                    done();
                }
            });
        });

        it('Should find sounds in clips', function (done) {
            var project = new Wick.Project();

            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });

            project.addAsset(sound);

            var frame2 = new Wick.Frame({start: 7, end: 12});
            project.activeLayer.addFrame(frame2);

            var clip1 = new Wick.Clip();
            project.activeFrame.addClip(clip1);
            clip1.activeFrame.sound = sound;

            var clip2 = new Wick.Clip();
            frame2.addClip(clip2);
            clip2.activeFrame.sound = sound;
            
            project.generateAudioSequence({onFinish: audioSequence => {
                    expect(audioSequence).to.be.an('array');
                    expect(audioSequence.length).to.equal(2);
                    done();
                }
            });
        });

        it('should return an empty audio track if project has no sounds' , function (done) {
            var project = new Wick.Project();

            project.generateAudioTrack({}, audioBuffer => {
                expect(audioBuffer).to.equal(null);
                done();
            });
        });

        it('should return an audio track with a single 1 second sound' , function (done) {
            var project = new Wick.Project();

            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });

            project.addAsset(sound);

            project.activeFrame.sound = sound;
            project.activeFrame.end = 12;

            project.generateAudioTrack({}, audioBuffer => {
                expect(audioBuffer.length).to.equal(48000 * 1);
                done();
            });
        });

        it('should return an audio track with a single 0.5 second sound' , function (done) {
            var project = new Wick.Project();

            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            project.addAsset(sound);

            project.activeFrame.sound = sound;
            project.activeFrame.end = 6;

            project.generateAudioTrack({}, audioBuffer => {
                expect(audioBuffer.length).to.equal(48000 * 0.5);
                done();
            });
        });

        it('should return an audio track with two 0.5 second sounds' , function (done) {
            var project = new Wick.Project();

            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            project.addAsset(sound);

            var frame1 = project.activeFrame;
            frame1.sound = sound;
            frame1.end = 6;

            var frame2 = new Wick.Frame({start: 7, end: 12});
            project.activeLayer.addFrame(frame2);
            frame2.sound = sound;

            project.generateAudioTrack({}, audioBuffer => {
                expect(audioBuffer.length).to.equal(48000 * 1.0);
                done();
            });
        });
    });

    describe('#keyDown', function () {
        it ('should use the correct key values when firing keydown scripts', function () {
            // TODO: This test is commented out because we cannot find a consistent way to generate keypresses and keydowns virtually.
            // var project = new Wick.Project();

            // var clip = new Wick.Clip();
            // project.addObject(clip);

            // clip.addScript('load', `
            //     this.aDown = 0;
            //     this.bDown = 0;
            // `);

            // clip.addScript('keydown', `
            // if (key === "a") {
            //     this.aDown += 1;
            // }

            // if (key === "b") {
            //     this.bDown += 1;
            // }`);


            // // No keys down
            // var error = project.tick();
            // expect(error).to.equal(null);
            // expect(clip.aDown).to.equal(0);
            // expect(clip.bDown).to.equal(0);

            // var error = project.tick();
            // expect(error).to.equal(null);
            // expect(clip.aDown).to.equal(1);
            // expect(clip.bDown).to.equal(0);

            // var error = project.tick();
            // expect(error).to.equal(null);
            // expect(clip.aDown).to.equal(2);
            // expect(clip.bDown).to.equal(0);

            // // a and b keys down
            // var error = project.tick();
            // expect(error).to.equal(null);
            // expect(clip.aDown).to.equal(3);
            // expect(clip.bDown).to.equal(1);

            // var error = project.tick();
            // expect(error).to.equal(null);
            // expect(clip.aDown).to.equal(4);
            // expect(clip.bDown).to.equal(2);

            // // b key down
            // var error = project.tick();
            // expect(error).to.equal(null);
            // expect(clip.aDown).to.equal(4);
            // expect(clip.bDown).to.equal(3);

            // // No keys down
            // var error = project.tick();
            // expect(error).to.equal(null);
            // expect(clip.aDown).to.equal(4);
            // expect(clip.bDown).to.equal(3);
        });
    });

    describe('#isKeyDown', function () {
        // TODO
    });

    describe('#isKeyJustPressed', function () {
        // TODO
    });

    describe('#copySelectionToClipboard', function () {
        it('should copy correctly', function () {
            // TODO
        });
    });

    describe('#pasteClipboardContents', function () {
        it('should paste correctly', function () {
            // TODO
        });
    });

    describe('#duplicateSelection', function () {
        it('should copy and paste correctly', function () {
            var project = new Wick.Project();
            project.selection.select(project.activeFrame);
            project.activeTimeline.playheadPosition = 2;
            project.duplicateSelection();
            expect(project.activeLayer.frames.length).to.equal(2);
            expect(project.activeLayer.getFrameAtPlayheadPosition(1)).to.not.equal(null);
            expect(project.activeLayer.getFrameAtPlayheadPosition(2)).to.not.equal(null);
        });
    });

    describe('#cutSelectionToClipboard', function () {
        it('should cut correctly', function () {
            var project = new Wick.Project();
            project.activeLayer.addFrame(new Wick.Frame({start:2}));
            project.selection.select(project.activeLayer.getFrameAtPlayheadPosition(2));
            project.cutSelectionToClipboard();
            expect(project.activeLayer.frames.length).to.equal(1);
            expect(project.activeLayer.getFrameAtPlayheadPosition(1)).to.not.equal(null);
            project.activeTimeline.playheadPosition = 2;
            project.pasteClipboardContents();
            expect(project.activeLayer.frames.length).to.equal(2);
            expect(project.activeLayer.getFrameAtPlayheadPosition(1)).to.not.equal(null);
            expect(project.activeLayer.getFrameAtPlayheadPosition(2)).to.not.equal(null);
        });
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

    describe('selectAll', function () {
        it('should select all items on the canvas', function () {
            // TODO
        })

        it('should not select items on locked/hidden layers', function () {
            // TODO
        })
    });

    describe('createImagePathFromAsset', function () {
        it('should create an image path', function (done) {
            // TODO
            done();
        })
    });

    describe('createClipInstanceFromAsset', function () {
        it('should create a clip', function (done) {
            // TODO
            done();
        })
    });

    describe('hasFont', function () {
        it('should check for existing fonts', function (done) {
            var project = new Wick.Project();

            var font = new Wick.FontAsset({
                filename: 'ABeeZee.ttf',
                src: TestUtils.TEST_FONT_SRC_TTF,
            });

            font.load(() => {
                expect(project.hasFont('ABeeZee')).to.equal(false);
                project.addAsset(font);
                expect(project.hasFont('ABeeZee')).to.equal(true);
                done();
            });
        })
    })

    describe('getFonts', function () {
        it('should return the correct list of fontFamilies', function () {
            var project = new Wick.Project();

            var font1 = new Wick.FontAsset({
                filename: 'foo.ttf',
                src: TestUtils.TEST_FONT_SRC_TTF,
            });
            var font2 = new Wick.FontAsset({
                filename: 'bar.ttf',
                src: TestUtils.TEST_FONT_SRC_TTF,
            });
            var font3 = new Wick.FontAsset({
                filename: 'baz.ttf',
                src: TestUtils.TEST_FONT_SRC_TTF,
            });

            project.addAsset(font1);
            project.addAsset(font2);
            project.addAsset(font3);

            expect(project.getFonts().length).to.equal(3);
            expect(project.getFonts()[0]).to.equal('foo');
            expect(project.getFonts()[1]).to.equal('bar');
            expect(project.getFonts()[2]).to.equal('baz');
        });
    })

    it('should change path fillColor when the fillColor tool setting is changed', function () {
        var project = new Wick.Project();
        var path = TestUtils.paperToWickPath(new paper.Path.Rectangle({
            fillColor: '#000000',
            strokeColor: '#000000',
            from: [0, 0],
            to: [100, 100],
        }));
        project.activeFrame.addPath(path);

        // path isn't selected. fillcolor should not change
        project.toolSettings.setSetting('fillColor', new Wick.Color('#ff0000'));
        expect(path.fillColor.toCSS(true)).to.equal('#000000');

        project.selection.select(path);
        expect(path.fillColor.toCSS(true)).to.equal('#000000');

        // path is selected, fillcolor should be changed
        project.toolSettings.setSetting('fillColor', new Wick.Color('#00ff00'));
        expect(path.fillColor.toCSS(true)).to.equal('#00ff00');
        expect(path.strokeColor.toCSS(true)).to.equal('#000000');
    });

    it('should change path strokeColor when the strokeColor tool setting is changed', function () {
        var project = new Wick.Project();
        var path = TestUtils.paperToWickPath(new paper.Path.Rectangle({
            fillColor: '#000000',
            strokeColor: '#000000',
            from: [0, 0],
            to: [100, 100],
        }));
        project.activeFrame.addPath(path);

        // path isn't selected. fillcolor should not change
        project.toolSettings.setSetting('strokeColor', new Wick.Color('#ff0000'));
        expect(path.strokeColor.toCSS(true)).to.equal('#000000');

        project.selection.select(path);
        expect(path.strokeColor.toCSS(true)).to.equal('#000000');

        // path is selected, fillcolor should be changed
        project.toolSettings.setSetting('strokeColor', new Wick.Color('#00ff00'));
        expect(path.strokeColor.toCSS(true)).to.equal('#00ff00');
        expect(path.fillColor.toCSS(true)).to.equal('#000000');
    });

    describe('#canDraw', function () {
        it('should be true by default', function () {
            var project = new Wick.Project();
            expect(project.canDraw).to.equal(true);
        });

        it('should be false if the active layer is locked', function () {
            var project = new Wick.Project();
            project.activeLayer.locked = true;
            expect(project.canDraw).to.equal(false);
        });

        it('should be false if the active layer is hidden', function () {
            var project = new Wick.Project();
            project.activeLayer.hidden = true;
            expect(project.canDraw).to.equal(false);
        });
    });

    describe('#doBooleanOperationOnSelection', function () {
        it('should perform boolean unite', function () {
            var project = new Wick.Project();

            var fill1 = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [0, 0],
                to: [50, 50],
                fillColor: '#ff0000',
                strokeColor: '#000000',
                strokeWidth: 5,
            }));
            var fill2 = TestUtils.paperToWickPath(new paper.Path.Rectangle({
                from: [25, 25],
                to: [75, 75],
                fillColor: '#00ff00',
            }));

            project.activeFrame.addPath(fill1);
            project.activeFrame.addPath(fill2);

            project.selection.select(fill1);
            project.selection.select(fill2);

            project.doBooleanOperationOnSelection('unite');

            var united = project.selection.getSelectedObject();
            expect(united.fillColor.toCSS(true)).to.equal('#ff0000');
            expect(united.strokeColor.toCSS(true)).to.equal('#000000');
            expect(united.strokeWidth).to.equal(5);
            expect(united.bounds.width).to.equal(75);
            expect(united.bounds.height).to.equal(75);
        });

        it('should perform boolean subtraction', function () {
            // TODO
        });

        it('should perform boolean intersection', function () {
            // TODO
        });
    });

    describe('#activeTool', function () {
        it('should change active tool', function () {
            // TODO
        });

        it('should clear selection when switching between drawing tools', function () {
            // TODO
        });
    });

    describe('#cutSelectedFrames', function () {
        it('should cut selected frames', function () {
            // TODO
        })
    });

    describe('#copySelectedFramesForward', function () {
        it('should copy selected frames forwards', function () {
            // TODO
        })
    });

    describe('#canCreateTween', function () {
        it('should determine if tweens can be created or not', function () {
            // TODO
        });
    });

    describe('#createTween', function () {
        it('should create tweens', function () {
            // TODO
        });
    });

    describe('#extendFrames', function () {
        it('should extend selected frames', function () {
            // TODO
        });
    });

    describe('#extendFramesAndPushOtherFrames', function () {
        it('should extend selected frames', function () {
            // TODO
        });
    });

    describe('#shrinkFrames', function () {
        it('should shrink selected frames', function () {
            // TODO
        });
    });

    describe('#shrinkFramesAndPullOtherFrames', function () {
        it('should shrink selected frames', function () {
            // TODO
        });
    });

    describe('#moveSelectedFramesRight', function () {
        it('should move selected frames right', function () {
            // TODO
        });
    });

    describe('#moveSelectedFramesLeft', function () {
        it('should move selected frames left', function () {
            // TODO
        });
    });

    describe('#insertBlankFrame', function () {
        it('should insert a blank frame', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();

            var frameToCut = new Wick.Frame({start: 1, end: 10, identifier: 'frameToCut'});
            project.activeLayer.addFrame(frameToCut);
            frameToCut.addClip(new Wick.Clip({identifier: 'childShouldBeCopied'}));

            project.activeTimeline.playheadPosition = 6;
            project.insertBlankFrame();

            expect(project.activeLayer.frames.length).to.equal(2);
            expect(project.activeLayer.getFrameAtPlayheadPosition(1)).to.equal(frameToCut);
            expect(project.activeLayer.getFrameAtPlayheadPosition(1).identifier).to.equal('frameToCut');
            expect(project.activeLayer.getFrameAtPlayheadPosition(1).length).to.equal(5);
            expect(project.activeLayer.getFrameAtPlayheadPosition(6).identifier).to.equal(null);
            expect(project.activeLayer.getFrameAtPlayheadPosition(7).length).to.equal(5);
        });

        it('should add blank frame but not cut frame if the parent playhead is not in range', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();

            var frameToCut = new Wick.Frame({start: 1, end: 10, identifier: 'frameToCut'});
            project.activeLayer.addFrame(frameToCut);
            frameToCut.addClip(new Wick.Clip({identifier: 'childShouldBeCopied'}));

            project.activeTimeline.playheadPosition = 11;
            project.insertBlankFrame();

            expect(project.activeLayer.frames.length).to.equal(2);
            expect(project.activeLayer.getFrameAtPlayheadPosition(1)).to.equal(frameToCut);
            expect(project.activeLayer.getFrameAtPlayheadPosition(1).identifier).to.equal('frameToCut');
            expect(project.activeLayer.getFrameAtPlayheadPosition(11)).to.not.equal(frameToCut);
            expect(project.activeLayer.getFrameAtPlayheadPosition(11).length).to.equal(1);
        });

        it('should insert blank frames to all layers with selected frames', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();
            project.activeTimeline.addLayer(new Wick.Layer());
            project.activeTimeline.addLayer(new Wick.Layer());
            project.activeTimeline.addLayer(new Wick.Layer());

            var frame0 = new Wick.Frame({start:1, end:10});
            var frame1 = new Wick.Frame({start:1, end:10});
            var frame2 = new Wick.Frame({start:1, end:5});
            var frame3 = new Wick.Frame({start:1, end:10});
            project.activeTimeline.layers[0].addFrame(frame0);
            project.activeTimeline.layers[1].addFrame(frame1);
            project.activeTimeline.layers[2].addFrame(frame2);
            project.activeTimeline.layers[3].addFrame(frame3);

            project.selection.select(frame0);
            project.selection.select(frame1);
            project.selection.select(frame2);

            project.activeTimeline.playheadPosition = 7;
            project.insertBlankFrame();

            expect(project.activeTimeline.layers[0].frames.length).to.equal(2);
            expect(project.activeTimeline.layers[0].getFrameAtPlayheadPosition(1).length).to.equal(6);
            expect(project.activeTimeline.layers[0].getFrameAtPlayheadPosition(7).length).to.equal(4);
            expect(project.activeTimeline.layers[1].frames.length).to.equal(2);
            expect(project.activeTimeline.layers[1].getFrameAtPlayheadPosition(1).length).to.equal(6);
            expect(project.activeTimeline.layers[1].getFrameAtPlayheadPosition(7).length).to.equal(4);
            expect(project.activeTimeline.layers[2].frames.length).to.equal(2);
            expect(project.activeTimeline.layers[2].getFrameAtPlayheadPosition(1).length).to.equal(6);
            expect(project.activeTimeline.layers[2].getFrameAtPlayheadPosition(7).length).to.equal(1);
            expect(project.activeTimeline.layers[3].frames.length).to.equal(1);
            expect(project.activeTimeline.layers[3].getFrameAtPlayheadPosition(1).length).to.equal(10);
        });
    });
});
