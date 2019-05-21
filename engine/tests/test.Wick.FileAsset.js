describe('Wick.FileAsset', function () {
    describe('#copy', function () {
        it('should copy correctly', function () {
            var image = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });

            var imagecopy = image.copy();
            var soundcopy = sound.copy();

            expect(imagecopy.src).to.equal(image.src);
            expect(soundcopy.src).to.equal(sound.src);
        });
    });
});
