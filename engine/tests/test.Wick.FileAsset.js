describe('Wick.FileAsset', function () {
    describe('#clone', function () {
        it('should clone correctly', function () {
            var image = new Wick.ImageAsset({
                filename: 'foo.png',
                src: TestUtils.TEST_IMG_SRC_PNG
            });
            var sound = new Wick.SoundAsset({
                filename: 'foo.wav',
                src: TestUtils.TEST_SOUND_SRC_WAV
            });

            var imageClone = image.clone();
            var soundClone = sound.clone();

            expect(imageClone.src).to.equal(image.src);
            expect(soundClone.src).to.equal(sound.src);
        });
    });
});
