describe('Wick.SoundAsset', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function () {
            var sound = new Wick.SoundAsset({
                filename:'test.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });
            expect(sound.classname).to.equal('SoundAsset');
        });
    });

    describe('#MIMEType', function () {
        it('get MIMEType should return correct MIME type', function() {
            throw new Error('write me')
        });
    });

    describe('#fileExtension', function () {
        it('get fileExtension should return correct file extension', function() {
            throw new Error('write me')
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

            project.activeLayer.frames[0].sound = asset1;
            project.activeLayer.frames[1].sound = asset1;
            project.activeLayer.frames[2].sound = asset2;

            project.removeAsset(asset1);
            expect(project.activeLayer.frames[0].sound).to.equal(null);
            expect(project.activeLayer.frames[1].sound).to.equal(null);
            expect(project.activeLayer.frames[2].sound).to.equal(asset2);
        });
    });
});
