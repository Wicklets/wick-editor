describe('Wick.FontAsset', function() {
    describe('#constructor', function () {
        it('should instantiate correctly', function(done) {
            var font = new Wick.FontAsset({
                filename:'ABeeZee.ttf',
                fontFamily: 'ABeeZee',
                src: TestUtils.TEST_FONT_SRC_TTF,
            });

            font.onLoad(() => {
                expect(font.MIMEType).to.equal('font/ttf');
                expect(font.fileExtension).to.equal('ttf');
                expect(document.fonts.check("12px ABeeZee")).to.equal(true);
                done();
            });
        });
    });
});
