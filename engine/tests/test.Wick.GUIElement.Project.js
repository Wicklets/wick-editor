describe('Wick.GUIElement.Project', function() {
    it('should render frames correctly', function () {
        var project = new Wick.Project();
        project.activeLayer.addFrame(new Wick.Frame({start: 2}));
        project.activeLayer.addFrame(new Wick.Frame({start: 3}));

        project.guiElement.draw();
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
            project.guiElement.draw();
            setTimeout(() => {
                project.guiElement.draw();
                done();
            }, 100);
        });
    });
});
