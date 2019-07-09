describe('Wick.GUIElement.Project', function() {
    it('should render frames correctly', function () {
        var project = new Wick.Project();
        project.activeLayer.addFrame(new Wick.Frame(2));
        project.activeLayer.addFrame(new Wick.Frame(3));

        project.guiElement.build();
        //console.log(paper);
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
});
