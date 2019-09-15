describe('Wick.SoundAsset', function() {
    describe('#constructor', function () {
        it('should instantiate correctly (wav)', function () {
            var sound = new Wick.SoundAsset({
                filename: 'test.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            expect(sound.classname).to.equal('SoundAsset');
        });

        it('should instantiate correctly (mp3)', function () {
            var sound = new Wick.SoundAsset({
                filename: 'test.mp3',
                src: TestUtils.TEST_SOUND_SRC_MP3
            });
            expect(sound.classname).to.equal('SoundAsset');
        });

        it('should instantiate correctly (ogg)', function () {
            var sound = new Wick.SoundAsset({
                filename: 'test.ogg',
                src: TestUtils.TEST_SOUND_SRC_OGG
            });
            expect(sound.classname).to.equal('SoundAsset');
        });
    });

    describe('#MIMEType', function () {
        it('get MIMEType should return correct MIME type', function() {
            // TODO
        });
    });

    describe('#fileExtension', function () {
        it('get fileExtension should return correct file extension', function() {
            // TODO
        });
    });

    describe('#removeAllInstances', function () {
        it('should delete all instances of the asset in the project', function () {
            var project = new Wick.Project();
            var asset1 = new Wick.SoundAsset({
                filename: 'test.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            var asset2 = new Wick.SoundAsset({
                filename: 'test.mp3',
                src: TestUtils.TEST_SOUND_SRC_MP3,
            });
            project.addAsset(asset1);
            project.addAsset(asset2);

            project.activeLayer.addFrame(new Wick.Frame({start:2}));
            project.activeLayer.addFrame(new Wick.Frame({start:3}));

            expect(asset1.hasInstances()).to.equal(false);
            project.activeLayer.frames[0].sound = asset1;
            project.activeLayer.frames[1].sound = asset1;
            project.activeLayer.frames[2].sound = asset2;
            expect(asset1.hasInstances()).to.equal(true);

            project.removeAsset(asset1);
            expect(project.activeLayer.frames[0].sound).to.equal(null);
            expect(project.activeLayer.frames[1].sound).to.equal(null);
            expect(project.activeLayer.frames[2].sound).to.equal(asset2);
        });
    });

    describe('#waveform', function () {
        it('should generate waveform image', function (done) {
            var project = new Wick.Project();
            var asset1 = new Wick.SoundAsset({
                filename: 'test.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            project.addAsset(asset1);

            asset1.load(() => {
                expect(asset1.waveform instanceof Image).to.equal(true);
                done();
            });
        });
    });
});
