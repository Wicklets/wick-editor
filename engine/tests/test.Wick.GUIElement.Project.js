describe('Wick.GUIElement.Project', function() {
    it('should render frames correctly', function () {
        var project = new Wick.Project();
        project.activeLayer.addFrame(new Wick.Frame({start: 2}));
        project.activeLayer.addFrame(new Wick.Frame({start: 3}));

        project.guiElement.build();
    });

    it('should render frame sound waveforms', function (done) {
        var project = new Wick.Project();

        var frame = project.activeFrame;
        frame.end = 10;

        var sound = new Wick.SoundAsset({filename:'test.wav', src:TestUtils.TEST_SOUND_SRC_WAV});
        project.addAsset(sound);

        frame.sound = sound;

        // wait a little bit to load the waveform image...
        sound.load(() => {
            project.guiElement.build();
            setTimeout(() => {
                project.guiElement.build();
                done();
            }, 100);
        });
    });

    describe('#performance', function () {
        it('performance test: warmup', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();

            // Three frames
            var layer1 = project.activeLayer;
            layer1.addFrame(new Wick.Frame({start: 1}));
            layer1.addFrame(new Wick.Frame({start: 2}));
            layer1.addFrame(new Wick.Frame({start: 3}));

            project.guiElement.build();
            project.guiElement.build();
        });

        it('performance test: three frames', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();

            // Three frames
            var layer1 = project.activeLayer;
            layer1.addFrame(new Wick.Frame({start: 1}));
            layer1.addFrame(new Wick.Frame({start: 2}));
            layer1.addFrame(new Wick.Frame({start: 3}));

            // Render timeline and time how long it took
            console.log('--- basic perf test ---');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'init build');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'second build');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'third build');
        });

        it('performance test: many frames of all types', function () {
            var project = new Wick.Project();
            project.activeFrame.remove();

            // Three blank frames
            var layer1 = project.activeLayer;
            layer1.addFrame(new Wick.Frame({start: 1}));
            layer1.addFrame(new Wick.Frame({start: 2}));
            layer1.addFrame(new Wick.Frame({start: 3}));

            // Thirty contentful frames
            var layer2 = new Wick.Layer();
            project.activeTimeline.addLayer(layer2);
            for(var i = 0; i < 30; i++) {
                var frame = new Wick.Frame({start: i});
                frame.addPath(TestUtils.paperToWickPath(new paper.Path.Rectangle({
                    to: [0,0],
                    from: [30,30],
                    fillColor: 'red',
                })));
                layer2.addFrame(frame);
            }

            // Render timeline and time how long it took
            console.log('--- heavy perf test ---');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'init build');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'second build');
            TestUtils.timeFunction(() => {
                project.guiElement.build();
            }, 'third build');
        });
    });
});
